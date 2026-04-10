from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import os
import re

import joblib
import pandas as pd


@dataclass
class ModelPredictionResult:
    response: Dict
    source: str


class ModelInferenceService:
    """
    Wrapper around persisted sklearn model assets.
    Uses strict feature encoding and raises on unsupported categories so
    callers can safely fallback to deterministic rule-engine behavior.
    """

    DRUG_GENE_MAP = {
        "clopidogrel": "CYP2C19",
        "warfarin": "CYP2C9",
        "codeine": "CYP2D6",
        "azathioprine": "TPMT",
        "simvastatin": "SLCO1B1",
        "fluorouracil": "DPYD",
        "5-fluorouracil": "DPYD",
    }

    def __init__(self) -> None:
        self.enabled = os.getenv("USE_ML_MODEL", "true").lower() in {"1", "true", "yes"}
        self.model = None
        self.encoders = None
        self.target_encoder = None
        self._assets_loaded = False
        self.feature_order = [
            "gene",
            "drug",
            "genotype",
            "phenotype",
            "age_group",
            "gender",
            "severity",
            "confidence",
        ]
        # Do NOT load assets at init — load lazily on first use to avoid blocking startup

    def _load_assets(self) -> None:
        """Lazy-load model assets on first use."""
        if self._assets_loaded:
            return
        self._assets_loaded = True  # Mark early to avoid re-entrant loads

        if not self.enabled:
            return

        default_assets_dir = Path(__file__).resolve().parents[2] / "data"
        assets_dir = Path(os.getenv("MODEL_ASSETS_DIR", str(default_assets_dir)))

        model_path = assets_dir / "pharmaguard_model.pkl"
        encoders_path = assets_dir / "encoders.pkl"
        target_encoder_path = assets_dir / "target_encoder.pkl"

        if not (model_path.exists() and encoders_path.exists() and target_encoder_path.exists()):
            self.enabled = False
            return

        try:
            self.model = joblib.load(model_path)
            self.encoders = joblib.load(encoders_path)
            self.target_encoder = joblib.load(target_encoder_path)
        except Exception:
            self.enabled = False

    def predict_drug_response(self, drug_name: str, pharmacogenomic_profile: Dict) -> ModelPredictionResult:
        if not self.enabled or self.model is None:
            raise RuntimeError("ML model service is disabled")

        features, selected_gene = self._build_features(drug_name, pharmacogenomic_profile)
        encoded_df = self._encode_features(features)

        pred = self.model.predict(encoded_df)
        risk_level = self.target_encoder.inverse_transform(pred)[0]

        confidence = self._get_confidence(encoded_df)
        severity = "High" if risk_level in {"Toxic", "Ineffective"} else "Medium"

        recommendation, warnings, dosage = self._recommendation_for(risk_level, drug_name)

        response = {
            "risk_level": risk_level,
            "confidence": confidence,
            "severity": severity,
            "recommendation": recommendation,
            "warnings": warnings,
            "dosage": dosage,
            "evidence_level": "C",
            "applicable_genes": [selected_gene] if selected_gene else [],
            "matched_rules_count": 0,
        }
        return ModelPredictionResult(response=response, source="ml_model")

    def get_supported_drugs(self) -> List[str]:
        if not self.enabled or self.encoders is None or "drug" not in self.encoders:
            return []
        return sorted(list(self.encoders["drug"].classes_))

    def _build_features(self, drug_name: str, profile: Dict) -> Tuple[Dict, str]:
        normalized_drug = drug_name.lower().strip()
        model_drug = "fluorouracil" if normalized_drug == "5-fluorouracil" else normalized_drug

        supported_drugs = set(self.encoders["drug"].classes_)
        if model_drug not in supported_drugs:
            raise ValueError(f"Drug '{drug_name}' is not supported by model")

        selected_gene = self.DRUG_GENE_MAP.get(normalized_drug)
        if not selected_gene:
            selected_gene = self._gene_with_highest_severity(profile)

        if selected_gene not in profile:
            raise ValueError(f"No gene profile found for '{selected_gene}'")

        gene_profile = profile[selected_gene]
        phenotype = self._normalize_phenotype(gene_profile.get("phenotype", "Normal Metabolizer"))
        genotype = self._derive_genotype(gene_profile.get("variants", []), phenotype)

        severity = "High" if phenotype == "Poor" else "Medium"
        base_confidence = 0.92 if severity == "High" else 0.86
        confidence = self._nearest_encoder_value("confidence", base_confidence)

        features = {
            "gene": selected_gene,
            "drug": model_drug,
            "genotype": genotype,
            "phenotype": phenotype,
            "age_group": "41-65",
            "gender": "Male",
            "severity": severity,
            "confidence": confidence,
        }
        return features, selected_gene

    def _encode_features(self, features: Dict) -> pd.DataFrame:
        encoded = {}
        for feature in self.feature_order:
            value = features[feature]
            encoder = self.encoders.get(feature)

            if encoder is None:
                encoded[feature] = value
                continue

            classes = set(encoder.classes_)
            if value not in classes:
                raise ValueError(f"Feature '{feature}' has unsupported value '{value}'")
            encoded[feature] = encoder.transform([value])[0]

        return pd.DataFrame([encoded], columns=self.feature_order)

    def _get_confidence(self, encoded_df: pd.DataFrame) -> float:
        if hasattr(self.model, "predict_proba"):
            proba = self.model.predict_proba(encoded_df)[0]
            return float(max(proba))
        return 0.8

    def _gene_with_highest_severity(self, profile: Dict) -> str:
        if not profile:
            return "CYP2C19"
        return max(profile.items(), key=lambda item: item[1].get("severity", 0))[0]

    def _normalize_phenotype(self, phenotype: str) -> str:
        p = phenotype.lower()
        if "poor" in p or "deficient" in p or "low activity" in p:
            return "Poor"
        if "ultra" in p:
            return "Ultra-rapid"
        if "intermediate" in p or "reduced" in p:
            return "Intermediate"
        return "Normal"

    def _derive_genotype(self, variants: List[Dict], phenotype: str) -> str:
        star_alleles = []
        for variant in variants:
            effect = str(variant.get("variant_effect", ""))
            matches = re.findall(r"\*\d+", effect)
            star_alleles.extend(matches)

        if len(star_alleles) >= 2:
            candidate = f"{star_alleles[0]}/{star_alleles[1]}"
        elif len(star_alleles) == 1:
            candidate = f"*1/{star_alleles[0]}"
        else:
            candidate = self._default_genotype_for_phenotype(phenotype)

        if candidate in set(self.encoders["genotype"].classes_):
            return candidate
        return self._default_genotype_for_phenotype(phenotype)

    @staticmethod
    def _default_genotype_for_phenotype(phenotype: str) -> str:
        if phenotype == "Poor":
            return "*2/*2"
        if phenotype == "Ultra-rapid":
            return "*1/*3"
        if phenotype == "Intermediate":
            return "*1/*2"
        return "*1/*1"

    def _nearest_encoder_value(self, feature_name: str, value: float):
        values = list(self.encoders[feature_name].classes_)
        return min(values, key=lambda v: abs(float(v) - value))

    @staticmethod
    def _recommendation_for(risk_level: str, drug_name: str) -> Tuple[str, List[str], Optional[str]]:
        if risk_level == "Toxic":
            return (
                f"High toxicity risk predicted for {drug_name}; consider alternative therapy.",
                ["Monitor closely for adverse drug reactions.", "Consider specialist consultation."],
                "Reduce dose and monitor closely",
            )
        if risk_level == "Ineffective":
            return (
                f"Low efficacy risk predicted for {drug_name}; consider alternative therapy.",
                ["Potential reduced therapeutic response."],
                None,
            )
        return (
            f"Dose adjustment may be needed for {drug_name}.",
            ["Use clinical judgement with pharmacogenomic context."],
            "Adjust dosage based on monitoring response",
        )
