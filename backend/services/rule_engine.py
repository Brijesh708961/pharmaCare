from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Risk level enumeration for competition requirements
class RiskLevel(Enum):
    SAFE = "Safe"
    ADJUST_DOSAGE = "Adjust Dosage"
    TOXIC = "Toxic"
    INEFFECTIVE = "Ineffective"
    UNKNOWN = "Unknown"

# Severity level enumeration
class SeverityLevel(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

# CPIC Evidence levels for confidence scoring
class EvidenceLevel(Enum):
    A = "A"  # High evidence
    B = "B"  # Moderate evidence
    C = "C"  # Low evidence
    D = "D"  # Very low evidence

@dataclass
class DrugRule:
    drug: str
    gene: str
    phenotype: str
    risk_level: RiskLevel
    recommendation: str
    dosage: Optional[str] = None
    warnings: List[str] = None
    evidence_level: EvidenceLevel = EvidenceLevel.B
    severity_level: SeverityLevel = SeverityLevel.MEDIUM
    confidence_score: float = 0.85

    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []
        
        # Auto-calculate confidence based on evidence level
        confidence_map = {
            EvidenceLevel.A: 0.95,
            EvidenceLevel.B: 0.85,
            EvidenceLevel.C: 0.70,
            EvidenceLevel.D: 0.50
        }
        self.confidence_score = confidence_map.get(self.evidence_level, 0.75)

# Comprehensive CPIC guidelines for all 6 target genes
DRUG_RULES = [
    # CYP2C19 - Clopidogrel (High evidence)
    DrugRule(
        drug="clopidogrel",
        gene="CYP2C19",
        phenotype="Poor Metabolizer",
        risk_level=RiskLevel.INEFFECTIVE,
        recommendation="Consider alternative antiplatelet agents (e.g., prasugrel, ticagrelor)",
        warnings=["Increased risk of cardiovascular events", "Reduced platelet inhibition"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.HIGH,
        confidence_score=0.95
    ),
    DrugRule(
        drug="clopidogrel",
        gene="CYP2C19",
        phenotype="Intermediate Metabolizer",
        risk_level=RiskLevel.ADJUST_DOSAGE,
        recommendation="Consider alternative therapy or standard dosing with monitoring",
        dosage="Consider higher dose or alternative agent",
        warnings=["May have reduced efficacy", "Monitor platelet function"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.MEDIUM,
        confidence_score=0.90
    ),
    DrugRule(
        drug="clopidogrel",
        gene="CYP2C19",
        phenotype="Normal Metabolizer",
        risk_level=RiskLevel.SAFE,
        recommendation="Standard dosing",
        dosage="75mg once daily",
        warnings=[],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.LOW,
        confidence_score=0.95
    ),
    DrugRule(
        drug="clopidogrel",
        gene="CYP2C19",
        phenotype="Ultra-Rapid Metabolizer",
        risk_level=RiskLevel.SAFE,
        recommendation="Standard dosing",
        dosage="75mg once daily",
        warnings=["May have increased efficacy"],
        evidence_level=EvidenceLevel.B,
        severity_level=SeverityLevel.LOW,
        confidence_score=0.80
    ),
    
    # CYP2D6 - Codeine, Tamoxifen, Tramadol
    DrugRule(
        drug="codeine",
        gene="CYP2D6",
        phenotype="Ultra-Rapid Metabolizer",
        risk_level=RiskLevel.TOXIC,
        recommendation="Avoid use - risk of toxicity",
        warnings=["Risk of life-threatening respiratory depression", "Potential for fatal overdose"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.CRITICAL,
        confidence_score=0.95
    ),
    DrugRule(
        drug="codeine",
        gene="CYP2D6",
        phenotype="Poor Metabolizer",
        risk_level=RiskLevel.INEFFECTIVE,
        recommendation="Avoid use - risk of therapeutic failure",
        warnings=["Reduced analgesic effect", "No pain relief expected"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.MEDIUM,
        confidence_score=0.95
    ),
    DrugRule(
        drug="codeine",
        gene="CYP2D6",
        phenotype="Normal Metabolizer",
        risk_level=RiskLevel.SAFE,
        recommendation="Standard dosing",
        dosage="As needed for pain",
        warnings=["Monitor for sedation"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.LOW,
        confidence_score=0.90
    ),
    DrugRule(
        drug="tamoxifen",
        gene="CYP2D6",
        phenotype="Poor Metabolizer",
        risk_level=RiskLevel.INEFFECTIVE,
        recommendation="Consider alternative endocrine therapy",
        warnings=["Reduced efficacy", "Higher risk of breast cancer recurrence"],
        evidence_level=EvidenceLevel.B,
        severity_level=SeverityLevel.HIGH,
        confidence_score=0.85
    ),
    DrugRule(
        drug="tamoxifen",
        gene="CYP2D6",
        phenotype="Normal Metabolizer",
        risk_level=RiskLevel.SAFE,
        recommendation="Standard dosing",
        dosage="20mg once daily",
        warnings=[],
        evidence_level=EvidenceLevel.B,
        severity_level=SeverityLevel.LOW,
        confidence_score=0.80
    ),
    
    # CYP2C9 - Warfarin, Phenytoin, NSAIDs
    DrugRule(
        drug="warfarin",
        gene="CYP2C9",
        phenotype="Poor Metabolizer",
        risk_level=RiskLevel.TOXIC,
        recommendation="Reduce dose and monitor INR closely",
        dosage="Reduce initial dose by 50-75%",
        warnings=["Increased bleeding risk", "Higher INR levels expected"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.HIGH,
        confidence_score=0.95
    ),
    DrugRule(
        drug="warfarin",
        gene="CYP2C9",
        phenotype="Intermediate Metabolizer",
        risk_level=RiskLevel.ADJUST_DOSAGE,
        recommendation="Reduce initial dose",
        dosage="Reduce initial dose by 25-50%",
        warnings=["Increased bleeding risk", "Monitor INR frequently"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.MEDIUM,
        confidence_score=0.90
    ),
    DrugRule(
        drug="warfarin",
        gene="CYP2C9",
        phenotype="Normal Metabolizer",
        risk_level=RiskLevel.SAFE,
        recommendation="Standard dosing",
        dosage="Standard initial dose 5mg daily",
        warnings=["Monitor INR regularly"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.LOW,
        confidence_score=0.95
    ),
    
    # SLCO1B1 - Statins
    DrugRule(
        drug="simvastatin",
        gene="SLCO1B1",
        phenotype="Reduced Function",
        risk_level=RiskLevel.TOXIC,
        recommendation="Use lower dose or alternative statin",
        dosage="Max 20mg daily or use pravastatin",
        warnings=["Increased risk of myopathy", "Higher risk of rhabdomyolysis"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.HIGH,
        confidence_score=0.95
    ),
    DrugRule(
        drug="simvastatin",
        gene="SLCO1B1",
        phenotype="Normal Function",
        risk_level=RiskLevel.SAFE,
        recommendation="Standard dosing",
        dosage="20-80mg daily as needed",
        warnings=["Monitor for muscle pain"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.LOW,
        confidence_score=0.90
    ),
    DrugRule(
        drug="atorvastatin",
        gene="SLCO1B1",
        phenotype="Reduced Function",
        risk_level=RiskLevel.ADJUST_DOSAGE,
        recommendation="Use lower dose or alternative statin",
        dosage="Max 40mg daily or use rosuvastatin",
        warnings=["Increased risk of myopathy"],
        evidence_level=EvidenceLevel.B,
        severity_level=SeverityLevel.MEDIUM,
        confidence_score=0.85
    ),
    
    # TPMT - Thiopurines (Azathioprine, 6-Mercaptopurine)
    DrugRule(
        drug="azathioprine",
        gene="TPMT",
        phenotype="Low Activity",
        risk_level=RiskLevel.TOXIC,
        recommendation="Reduce dose to 10-30% of standard or avoid",
        dosage="Start with 10% of standard dose",
        warnings=["High risk of severe myelosuppression", "Life-threatening bone marrow suppression"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.CRITICAL,
        confidence_score=0.95
    ),
    DrugRule(
        drug="azathioprine",
        gene="TPMT",
        phenotype="Intermediate Activity",
        risk_level=RiskLevel.ADJUST_DOSAGE,
        recommendation="Reduce dose to 30-70% of standard",
        dosage="Start with 30-70% of standard dose",
        warnings=["Increased risk of myelosuppression", "Monitor blood counts closely"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.MEDIUM,
        confidence_score=0.90
    ),
    DrugRule(
        drug="6-mercaptopurine",
        gene="TPMT",
        phenotype="Low Activity",
        risk_level=RiskLevel.TOXIC,
        recommendation="Reduce dose to 10-30% of standard or avoid",
        dosage="Start with 10% of standard dose",
        warnings=["High risk of severe myelosuppression"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.CRITICAL,
        confidence_score=0.95
    ),
    
    # DPYD - Fluoropyrimidines (5-Fluorouracil, Capecitabine)
    DrugRule(
        drug="5-fluorouracil",
        gene="DPYD",
        phenotype="Deficient",
        risk_level=RiskLevel.TOXIC,
        recommendation="Avoid or reduce dose to 50% or less",
        dosage="Reduce initial dose by at least 50%",
        warnings=["High risk of severe toxicity", "Potential fatal toxicity"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.CRITICAL,
        confidence_score=0.95
    ),
    DrugRule(
        drug="5-fluorouracil",
        gene="DPYD",
        phenotype="Reduced Function",
        risk_level=RiskLevel.ADJUST_DOSAGE,
        recommendation="Reduce dose by 25-50%",
        dosage="Reduce initial dose by 25-50%",
        warnings=["Increased risk of toxicity", "Monitor for adverse effects"],
        evidence_level=EvidenceLevel.B,
        severity_level=SeverityLevel.MEDIUM,
        confidence_score=0.85
    ),
    DrugRule(
        drug="capecitabine",
        gene="DPYD",
        phenotype="Deficient",
        risk_level=RiskLevel.TOXIC,
        recommendation="Avoid or reduce dose to 50% or less",
        dosage="Reduce initial dose by at least 50%",
        warnings=["High risk of severe toxicity"],
        evidence_level=EvidenceLevel.A,
        severity_level=SeverityLevel.CRITICAL,
        confidence_score=0.95
    ),
    
    # Additional common drugs with known interactions
    DrugRule(
        drug="omeprazole",
        gene="CYP2C19",
        phenotype="Poor Metabolizer",
        risk_level=RiskLevel.ADJUST_DOSAGE,
        recommendation="Consider alternative PPI or standard dose",
        dosage="Standard dose may be more effective",
        warnings=["Increased drug exposure"],
        evidence_level=EvidenceLevel.B,
        severity_level=SeverityLevel.LOW,
        confidence_score=0.80
    ),
    DrugRule(
        drug="escitalopram",
        gene="CYP2C19",
        phenotype="Poor Metabolizer",
        risk_level=RiskLevel.ADJUST_DOSAGE,
        recommendation="Consider 50% dose reduction",
        dosage="Reduce initial dose by 50%",
        warnings=["Increased risk of side effects"],
        evidence_level=EvidenceLevel.B,
        severity_level=SeverityLevel.MEDIUM,
        confidence_score=0.85
    )
]

RULES_BY_DRUG = {}
for rule in DRUG_RULES:
    if rule.drug not in RULES_BY_DRUG:
        RULES_BY_DRUG[rule.drug] = []
    RULES_BY_DRUG[rule.drug].append(rule)

SEVERITY_RANK = {
    SeverityLevel.LOW: 1,
    SeverityLevel.MEDIUM: 2,
    SeverityLevel.HIGH: 3,
    SeverityLevel.CRITICAL: 4
}

class RuleEngine:
    @staticmethod
    def get_rules_for_drug(drug_name: str) -> List[DrugRule]:
        return RULES_BY_DRUG.get(drug_name.lower(), [])
    
    @staticmethod
    def evaluate_drug_response(drug_name: str, pharmacogenomic_profile: Dict) -> Dict:
        """Evaluate drug response based on complete pharmacogenomic profile."""
        drug_rules = RuleEngine.get_rules_for_drug(drug_name)
        
        if not drug_rules:
            return {
                'risk_level': RiskLevel.UNKNOWN,
                'confidence': 0.0,
                'severity': SeverityLevel.LOW,
                'recommendation': f'No pharmacogenomic data available for {drug_name}',
                'warnings': ['Drug not in pharmacogenomic database'],
                'dosage': None
            }
        
        # Find matching rules for relevant genes
        applicable_rules = []
        for rule in drug_rules:
            if rule.gene in pharmacogenomic_profile:
                patient_phenotype = pharmacogenomic_profile[rule.gene]['phenotype']
                if rule.phenotype.lower() == patient_phenotype.lower():
                    applicable_rules.append(rule)
        
        if not applicable_rules:
            # No specific variants found - assume normal metabolism
            normal_rules = [r for r in drug_rules if r.phenotype == 'Normal Metabolizer']
            if normal_rules:
                return {
                    'risk_level': normal_rules[0].risk_level,
                    'confidence': normal_rules[0].confidence_score,
                    'severity': normal_rules[0].severity_level,
                    'recommendation': normal_rules[0].recommendation,
                    'warnings': normal_rules[0].warnings,
                    'dosage': normal_rules[0].dosage,
                    'evidence_level': normal_rules[0].evidence_level.value
                }
            else:
                return {
                    'risk_level': RiskLevel.UNKNOWN,
                    'confidence': 0.5,
                    'severity': SeverityLevel.MEDIUM,
                    'recommendation': f'Insufficient data for {drug_name}',
                    'warnings': ['Limited pharmacogenomic information'],
                    'dosage': None
                }
        
        # Select the highest severity rule if multiple apply
        highest_severity_rule = max(
            applicable_rules,
            key=lambda r: (SEVERITY_RANK.get(r.severity_level, 0), r.confidence_score)
        )
        
        return {
            'risk_level': highest_severity_rule.risk_level,
            'confidence': highest_severity_rule.confidence_score,
            'severity': highest_severity_rule.severity_level,
            'recommendation': highest_severity_rule.recommendation,
            'warnings': highest_severity_rule.warnings,
            'dosage': highest_severity_rule.dosage,
            'evidence_level': highest_severity_rule.evidence_level.value,
            'applicable_genes': [rule.gene for rule in applicable_rules],
            'matched_rules_count': len(applicable_rules)
        }
    
    @staticmethod
    def evaluate(drug_name: str, gene: str, phenotype: str) -> Optional[DrugRule]:
        """Legacy method for single gene evaluation."""
        rules = RULES_BY_DRUG.get(drug_name.lower(), [])
        for rule in rules:
            if rule.gene.upper() == gene.upper() and rule.phenotype.lower() == phenotype.lower():
                return rule
        return None
    
    @staticmethod
    def get_supported_drugs() -> List[str]:
        """Get list of all supported drugs."""
        return sorted(list(RULES_BY_DRUG.keys()))
    
    @staticmethod
    def get_supported_genes() -> List[str]:
        """Get list of all supported genes."""
        return ['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD']
