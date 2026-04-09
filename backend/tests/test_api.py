import pytest
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "services" in data

def test_get_supported_drugs():
    """Test get supported drugs endpoint"""
    response = client.get("/api/drugs")
    assert response.status_code == 200
    data = response.json()
    assert "supported_drugs" in data
    assert "supported_genes" in data
    assert "total_drugs" in data
    assert "total_genes" in data

def test_get_sample_data_patient_a():
    """Test get sample data for Patient A"""
    response = client.get("/api/sample-data/PatientA")
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "PatientA"
    assert "vcf_content" in data
    assert data["file_name"] == "sample_patient_a.vcf"

def test_get_sample_data_invalid_patient():
    """Test get sample data for invalid patient"""
    response = client.get("/api/sample-data/InvalidPatient")
    assert response.status_code == 404

def test_analyze_vcf_with_sample_data():
    """Test analyze VCF with sample data"""
    # First get sample data
    sample_response = client.get("/api/sample-data/PatientA")
    sample_data = sample_response.json()
    
    # Test analysis
    response = client.post(
        "/api/analyze",
        data={
            "drug_name": "clopidogrel",
            "patient_id": "TestPatient",
            "vcf_content": sample_data["vcf_content"]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Test response structure
    assert "patient_id" in data
    assert "drug_info" in data
    assert "risk_assessment" in data
    assert "pharmacogenomic_profile" in data
    assert "explanation" in data
    assert "quality_metrics" in data
    assert "version" in data
    assert "compliance" in data
    
    # Test risk assessment structure
    risk_assessment = data["risk_assessment"]
    assert "risk_level" in risk_assessment
    assert "confidence" in risk_assessment
    assert "severity" in risk_assessment
    assert "recommendation" in risk_assessment
    
    # Test quality metrics structure
    quality_metrics = data["quality_metrics"]
    assert "vcf_quality_score" in quality_metrics
    assert "variant_coverage" in quality_metrics
    assert "genes_analyzed" in quality_metrics
    assert "total_variants_found" in quality_metrics
    assert "analysis_timestamp" in quality_metrics
    assert "processing_time_ms" in quality_metrics

def test_analyze_vcf_no_data():
    """Test analyze VCF with no data"""
    response = client.post(
        "/api/analyze",
        data={
            "drug_name": "clopidogrel",
            "patient_id": "TestPatient"
        }
    )
    
    assert response.status_code == 400
    assert "No VCF file or content provided" in response.json()["detail"]

def test_analyze_vcf_invalid_drug():
    """Test analyze VCF with invalid drug"""
    sample_response = client.get("/api/sample-data/PatientA")
    sample_data = sample_response.json()
    
    response = client.post(
        "/api/analyze",
        data={
            "drug_name": "invalid_drug",
            "patient_id": "TestPatient",
            "vcf_content": sample_data["vcf_content"]
        }
    )
    
    # Should still return 200 but with unknown risk level
    assert response.status_code == 200
    data = response.json()
    assert data["risk_assessment"]["risk_level"] == "Unknown"

def test_validate_vcf_valid():
    """Test VCF validation with valid VCF"""
    sample_response = client.get("/api/sample-data/PatientA")
    sample_data = sample_response.json()
    
    # Create a temporary file for testing
    from io import BytesIO
    file_content = BytesIO(sample_data["vcf_content"].encode())
    
    response = client.post(
        "/api/validate",
        files={"file": ("test.vcf", file_content, "text/vcf")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "valid" in data
    assert "errors" in data
    assert "file_size" in data
    assert "file_name" in data

def test_validate_vcf_invalid():
    """Test VCF validation with invalid VCF"""
    invalid_vcf = "This is not a valid VCF file"
    
    from io import BytesIO
    file_content = BytesIO(invalid_vcf.encode())
    
    response = client.post(
        "/api/validate",
        files={"file": ("invalid.vcf", file_content, "text/vcf")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "valid" in data
    assert "errors" in data

def test_json_schema_compliance():
    """Test that API responses comply with expected JSON schema"""
    sample_response = client.get("/api/sample-data/PatientA")
    sample_data = sample_response.json()
    
    response = client.post(
        "/api/analyze",
        data={
            "drug_name": "clopidogrel",
            "patient_id": "TestPatient",
            "vcf_content": sample_data["vcf_content"]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify all required fields are present
    required_fields = [
        "patient_id", "drug_info", "risk_assessment", 
        "pharmacogenomic_profile", "explanation", "quality_metrics",
        "version", "compliance"
    ]
    
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"
    
    # Verify nested structures
    assert "name" in data["drug_info"]
    assert "category" in data["drug_info"]
    
    assert "risk_level" in data["risk_assessment"]
    assert "confidence" in data["risk_assessment"]
    assert "severity" in data["risk_assessment"]
    assert "recommendation" in data["risk_assessment"]
    
    assert "biological_mechanism" in data["explanation"]
    assert "variant_reasoning" in data["explanation"]
    assert "clinical_interpretation" in data["explanation"]
    assert "summary" in data["explanation"]
    
    assert "vcf_quality_score" in data["quality_metrics"]
    assert "variant_coverage" in data["quality_metrics"]
    assert "genes_analyzed" in data["quality_metrics"]
    assert "total_variants_found" in data["quality_metrics"]
    assert "analysis_timestamp" in data["quality_metrics"]
    assert "processing_time_ms" in data["quality_metrics"]
    
    assert "cpic_guidelines" in data["compliance"]
    assert "evidence_based" in data["compliance"]
    assert "clinically_validated" in data["compliance"]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
