from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class RiskLevelEnum(str, Enum):
    SAFE = "Safe"
    ADJUST_DOSAGE = "Adjust Dosage"
    TOXIC = "Toxic"
    INEFFECTIVE = "Ineffective"
    UNKNOWN = "Unknown"

class SeverityLevelEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class EvidenceLevelEnum(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"

class GeneVariant(BaseModel):
    gene: str = Field(..., description="Gene name")
    rsid: str = Field(..., description="dbSNP identifier")
    variant_effect: str = Field(..., description="Star allele or variant effect")
    phenotype: str = Field(..., description="Metabolizer phenotype")
    severity: int = Field(..., description="Severity score 1-4")
    chrom: str = Field(..., description="Chromosome")
    pos: str = Field(..., description="Position")
    ref: str = Field(..., description="Reference allele")
    alt: str = Field(..., description="Alternate allele")
    quality: str = Field(..., description="Quality score")

class GeneProfile(BaseModel):
    phenotype: str = Field(..., description="Overall phenotype for this gene")
    severity: int = Field(..., description="Severity score 1-4")
    variant_count: int = Field(..., description="Number of variants found")
    variants: List[GeneVariant] = Field(default_factory=list, description="List of variants for this gene")

class RiskAssessment(BaseModel):
    risk_level: RiskLevelEnum = Field(..., description="Overall risk category")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0-1")
    severity: SeverityLevelEnum = Field(..., description="Clinical severity level")
    recommendation: str = Field(..., description="Clinical recommendation")
    warnings: List[str] = Field(default_factory=list, description="Clinical warnings")
    dosage: Optional[str] = Field(None, description="Recommended dosage adjustment")
    evidence_level: Optional[EvidenceLevelEnum] = Field(None, description="CPIC evidence level")
    applicable_genes: List[str] = Field(default_factory=list, description="Genes that influenced this assessment")
    matched_rules_count: int = Field(default=0, description="Number of matching rules")

class Explanation(BaseModel):
    biological_mechanism: Optional[str] = Field(None, description="Explanation of biological mechanism")
    variant_reasoning: Optional[str] = Field(None, description="Reasoning about specific variants")
    clinical_interpretation: Optional[str] = Field(None, description="Clinical interpretation for healthcare providers")
    summary: Optional[str] = Field(None, description="Overall summary")
    ai_generated: bool = Field(default=False, description="Whether explanation was AI-generated")
    model_used: Optional[str] = Field(None, description="AI model used for explanation")

class QualityMetrics(BaseModel):
    vcf_quality_score: float = Field(..., ge=0.0, le=1.0, description="Quality of VCF file")
    variant_coverage: int = Field(..., description="Number of target gene variants covered")
    genes_analyzed: int = Field(..., description="Number of genes analyzed")
    total_variants_found: int = Field(..., description="Total variants found in VCF")
    parsing_errors: List[str] = Field(default_factory=list, description="Errors encountered during parsing")
    warnings: List[str] = Field(default_factory=list, description="Warnings during analysis")
    analysis_timestamp: str = Field(..., description="Timestamp of analysis")
    processing_time_ms: Optional[int] = Field(None, description="Processing time in milliseconds")

class DrugInfo(BaseModel):
    name: str = Field(..., description="Drug name")
    category: Optional[str] = Field(None, description="Drug category")
    indication: Optional[str] = Field(None, description="Drug indication")

class AnalysisResponse(BaseModel):
    patient_id: str = Field(..., description="Patient identifier")
    drug_info: DrugInfo = Field(..., description="Drug information")
    risk_assessment: RiskAssessment = Field(..., description="Risk assessment results")
    pharmacogenomic_profile: Dict[str, GeneProfile] = Field(..., description="Complete pharmacogenomic profile")
    explanation: Explanation = Field(..., description="Explainable AI explanation")
    quality_metrics: QualityMetrics = Field(..., description="Quality and processing metrics")
    version: str = Field(default="1.0", description="API version")
    compliance: Dict[str, Any] = Field(default_factory=dict, description="Compliance information")

# Request models
class AnalysisRequest(BaseModel):
    drug_name: str = Field(..., description="Name of drug to analyze")
    patient_id: str = Field(..., description="Patient identifier")
    vcf_content: Optional[str] = Field(None, description="VCF file content")

class DrugListResponse(BaseModel):
    supported_drugs: List[str] = Field(..., description="List of supported drugs")
    supported_genes: List[str] = Field(..., description="List of supported genes")
    total_drugs: int = Field(..., description="Total number of supported drugs")
    total_genes: int = Field(..., description="Total number of supported genes")

class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    timestamp: str = Field(..., description="Current timestamp")
    services: Dict[str, str] = Field(..., description="Service status")
