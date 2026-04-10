from dotenv import load_dotenv
load_dotenv()  # Load .env before anything else

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import json
import asyncio
from datetime import datetime
from typing import Optional
import time

from services.vcf_parser import VCFParser
from services.rule_engine import RuleEngine
from services.llm_explainer import LLMExplainer
from services.model_inference import ModelInferenceService
from services.ollama_report import interpret_report_json
from services.ollama_chatbot import chat_with_bot
from services.ai_vision_service import AIVisionService
from services.auth_service import AuthService
from models.schemas import (
    AnalysisRequest, AnalysisResponse, DrugListResponse, HealthResponse,
    DrugInfo, RiskAssessment, Explanation, QualityMetrics, GeneProfile,
    RegisterRequest, LoginRequest, RoleRequest, BaseAuthResponse
)

app = FastAPI(title="PharmaGuard API")
model_inference_service = ModelInferenceService()

@app.on_event("startup")
async def preload_model():
    """Load the ML model in a background thread so it never blocks the event loop."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, model_inference_service._load_assets)

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,https://pharma-care-kohl.vercel.app"
)
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
allow_all_origins = "*" in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else allowed_origins,
    # Credentials cannot be combined with wildcard origins in browsers.
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (for sample data)
app.mount("/static", StaticFiles(directory="data"), name="static")

@app.get("/")
def read_root():
    return {"status": "PharmaGuard Backend is running"}

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
        services={
            "vcf_parser": "active",
            "rule_engine": "active", 
            "llm_explainer": "active"
        }
    )

@app.post("/api/auth/register")
def register_user(payload: RegisterRequest):
    try:
        return AuthService.register(payload.name, payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/auth/login")
def login_user(payload: LoginRequest):
    try:
        return AuthService.login(payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/api/auth/set-role")
def set_user_role(payload: RoleRequest):
    try:
        user_data = AuthService.set_role(payload.token, payload.role, payload.wallet_address)
        return {"success": True, "user": user_data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to set role")

@app.post("/api/report/interpret")
async def interpret_exported_report(payload: dict = Body(...)):
    """
    Accept a PharmaGuard AnalysisResponse-shaped JSON (from export) and return
    a plain-language narrative via local Ollama, with template fallback.
    """
    report = payload.get("report") if isinstance(payload, dict) else None
    if not report and isinstance(payload, dict) and "patient_id" in payload:
        report = payload
    if not isinstance(report, dict):
        raise HTTPException(status_code=400, detail="Expected JSON object with key 'report' or a raw analysis object")
    try:
        result = await interpret_report_json(report)
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate report narrative")


@app.post("/api/chatbot/chat")
async def chatbot_chat(payload: dict = Body(...)):
    """
    Context-aware chatbot for PharmaGuard questions.
    Uses Ollama for AI responses with fallback templates.
    """
    user_message = payload.get("message", "")
    chat_history = payload.get("history", [])

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        result = await chat_with_bot(user_message, chat_history)
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="Chatbot error")


@app.get("/api/drugs", response_model=DrugListResponse)
def get_supported_drugs():
    """Get list of supported drugs and genes"""
    if model_inference_service.enabled:
        drugs = model_inference_service.get_supported_drugs()
    else:
        drugs = RuleEngine.get_supported_drugs()
    genes = RuleEngine.get_supported_genes()
    
    return DrugListResponse(
        supported_drugs=drugs,
        supported_genes=genes,
        total_drugs=len(drugs),
        total_genes=len(genes)
    )

@app.get("/api/sample-data/{patient_id}")
def get_sample_data(patient_id: str):
    """Get sample VCF data for demo patients"""
    sample_files = {
        "PatientA": "sample_patient_a.vcf",
        "PatientB": "sample_patient_b.vcf", 
        "PatientC": "sample_patient_c.vcf"
    }
    
    if patient_id not in sample_files:
        raise HTTPException(status_code=404, detail=f"Sample patient {patient_id} not found")
    
    file_path = os.path.join("data", sample_files[patient_id])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Sample file not found")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    return {
        "patient_id": patient_id,
        "vcf_content": content,
        "file_name": sample_files[patient_id]
    }

@app.post("/api/validate")
async def validate_vcf(file: UploadFile = File(...)):
    """Validate VCF file format and structure"""
    try:
        content = await file.read()
        vcf_content = content.decode('utf-8')
        
        # Validate VCF structure
        is_valid, errors = VCFParser.validate_vcf_structure(vcf_content)
        
        return {
            "valid": is_valid,
            "errors": errors,
            "file_size": len(content),
            "file_name": file.filename
        }
    except Exception:
        raise HTTPException(status_code=400, detail="Unable to validate VCF input")

@app.post("/api/scan-pill")
async def scan_pill(file: UploadFile = File(...)):
    """Extract drug name from a pill bottle image using Gemini Vision"""
    try:
        content = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        extracted_drug = AIVisionService.extract_drug_from_image(content, mime_type)
        
        return {"drug": extracted_drug}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_vcf(
    drug_name: str = Form(...),
    patient_id: str = Form(...),
    file: Optional[UploadFile] = File(None),
    vcf_content: Optional[str] = Form(None),
    drug_names: Optional[str] = Form(None)
):
    """Main analysis endpoint"""
    start_time = time.time()
    
    # Handle multiple drugs
    selected_drugs = []
    if drug_names:
        try:
            selected_drugs = json.loads(drug_names)
        except json.JSONDecodeError:
            selected_drugs = [drug_name]
    else:
        selected_drugs = [drug_name]
    
    # Get VCF content
    if file:
        content = await file.read()
        vcf_content = content.decode('utf-8')
    elif vcf_content:
        pass  # Use provided content
    else:
        raise HTTPException(status_code=400, detail="No VCF file or content provided")
    
    try:
        
        # Parse VCF
        variants, parsing_errors = VCFParser.parse_vcf(vcf_content)
        
        # Get pharmacogenomic profile
        pharmacogenomic_profile = VCFParser.get_pharmacogenomic_profile(variants)
        
        # Evaluate drug response for all selected drugs
        drug_responses = []
        model_fallback_count = 0
        model_used_count = 0
        for drug in selected_drugs:
            response = None
            if model_inference_service.enabled:
                try:
                    ml_result = model_inference_service.predict_drug_response(drug, pharmacogenomic_profile)
                    response = ml_result.response
                    model_used_count += 1
                except Exception:
                    model_fallback_count += 1

            if response is None:
                response = RuleEngine.evaluate_drug_response(drug, pharmacogenomic_profile)
            drug_responses.append(response)
        
        # Use the first drug for the main response (for backward compatibility)
        drug_response = drug_responses[0]
        
        # Generate AI explanation for the primary drug
        llm_explainer = LLMExplainer()
        explanation_payload = await llm_explainer.explain_analysis(
            drug_name=drug_name,
            gene=drug_response.get('applicable_genes', ['Unknown'])[0] if drug_response.get('applicable_genes') else 'Unknown',
            phenotype=pharmacogenomic_profile.get(drug_response.get('applicable_genes', ['Unknown'])[0] if drug_response.get('applicable_genes') else 'Unknown', {}).get('phenotype', 'Unknown'),
            recommendation=drug_response.get('recommendation', 'No recommendation available')
        )
        
        # Calculate quality metrics
        processing_time_ms = int((time.time() - start_time) * 1000)
        vcf_quality_score = max(0.0, 1.0 - (len(parsing_errors) * 0.1))
        variant_coverage = sum(len(profile.get('variants', [])) for profile in pharmacogenomic_profile.values())
        quality_warnings = []
        if model_used_count:
            quality_warnings.append(f"ML model used for {model_used_count} drug(s)")
        if model_fallback_count:
            quality_warnings.append(f"Rule-engine fallback used for {model_fallback_count} drug(s)")
        
        quality_metrics = QualityMetrics(
            vcf_quality_score=vcf_quality_score,
            variant_coverage=variant_coverage,
            genes_analyzed=len(pharmacogenomic_profile),
            total_variants_found=len(variants),
            parsing_errors=parsing_errors,
            warnings=quality_warnings,
            analysis_timestamp=datetime.now().isoformat(),
            processing_time_ms=processing_time_ms
        )
        
        # Build response
        risk_assessment = RiskAssessment(
            risk_level=drug_response.get('risk_level', 'Unknown'),
            confidence=drug_response.get('confidence', 0.0),
            severity=drug_response.get('severity', 'Low'),
            recommendation=drug_response.get('recommendation', 'No recommendation available'),
            warnings=drug_response.get('warnings', []),
            dosage=drug_response.get('dosage'),
            evidence_level=drug_response.get('evidence_level'),
            applicable_genes=drug_response.get('applicable_genes', []),
            matched_rules_count=drug_response.get('matched_rules_count', 0)
        )
        
        explanation = Explanation(
            biological_mechanism=explanation_payload.get("biological_mechanism"),
            variant_reasoning=explanation_payload.get("variant_reasoning"),
            clinical_interpretation=explanation_payload.get("clinical_interpretation"),
            summary=explanation_payload.get("summary"),
            ai_generated=bool(explanation_payload.get("ai_generated")),
            model_used=explanation_payload.get("model_used")
        )
        
        drug_info = DrugInfo(
            name=drug_name,
            category="Pharmacogenomic",
            indication="Varies by drug"
        )
        
        # Convert pharmacogenomic profile to GeneProfile objects
        pg_profile_dict = {}
        for gene, profile in pharmacogenomic_profile.items():
            pg_profile_dict[gene] = GeneProfile(
                phenotype=profile['phenotype'],
                severity=profile['severity'],
                variant_count=profile['variant_count'],
                variants=profile['variants']
            )
        
        response = AnalysisResponse(
            patient_id=patient_id,
            drug_info=drug_info,
            risk_assessment=risk_assessment,
            pharmacogenomic_profile=pg_profile_dict,
            explanation=explanation,
            quality_metrics=quality_metrics,
            version="1.0",
            compliance={
                "cpic_guidelines": True,
                "evidence_based": True,
                "clinically_validated": True,
                "ml_model_enabled": model_inference_service.enabled
            }
        )
        
        return response
        
    except Exception:
        raise HTTPException(status_code=500, detail="Analysis failed due to internal processing error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Trigger reload
