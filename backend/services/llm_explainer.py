from typing import Optional, Dict
import os
import json
import httpx

class LLMExplainer:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.model_name = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.base_url = os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1/chat/completions")

    async def explain_analysis(self, drug_name: str, gene: str, phenotype: str, recommendation: str) -> Dict[str, str]:
        if not self.api_key:
            return self._generate_basic_explanation(drug_name, gene, phenotype, recommendation)
        
        try:
            prompt = f"""
You are an expert pharmacogenomics assistant. Explain results in simple, non-technical language for a normal user.

Input:
- Drug: {drug_name}
- Gene: {gene}
- Phenotype: {phenotype}
- Recommendation: {recommendation}

Return ONLY valid JSON with exactly these keys:
{{
  "summary": "...",
  "biological_mechanism": "...",
  "variant_reasoning": "...",
  "clinical_interpretation": "..."
}}

Rules:
- Keep each field concise (2-4 sentences max).
- Avoid jargon unless explained.
- Include practical next steps and what user should discuss with doctor.
- Do not include markdown/code fences.
"""
            payload = {
                "model": self.model_name,
                "temperature": 0.2,
                "max_tokens": 700,
                "messages": [
                    {"role": "system", "content": "You produce safe, clear medical education text. Not a diagnosis."},
                    {"role": "user", "content": prompt.strip()},
                ],
            }
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

            content = data["choices"][0]["message"]["content"]
            parsed = self._parse_or_fallback(content, drug_name, gene, phenotype, recommendation)
            parsed["ai_generated"] = True
            parsed["model_used"] = f"groq:{self.model_name}"
            return parsed
        except Exception:
            return self._generate_basic_explanation(drug_name, gene, phenotype, recommendation)

    def _parse_or_fallback(self, content: str, drug_name: str, gene: str, phenotype: str, recommendation: str) -> Dict[str, str]:
        try:
            obj = json.loads(content)
            required = ["summary", "biological_mechanism", "variant_reasoning", "clinical_interpretation"]
            if all(key in obj for key in required):
                return {
                    "summary": str(obj["summary"]),
                    "biological_mechanism": str(obj["biological_mechanism"]),
                    "variant_reasoning": str(obj["variant_reasoning"]),
                    "clinical_interpretation": str(obj["clinical_interpretation"]),
                }
        except Exception:
            pass
        return self._generate_basic_explanation(drug_name, gene, phenotype, recommendation)

    def _generate_basic_explanation(self, drug_name: str, gene: str, phenotype: str, recommendation: str) -> Dict[str, str]:
        summary = (
            f"Your gene result suggests that your body may process {drug_name} differently than average. "
            f"Current recommendation: {recommendation}."
        )
        biological = (
            f"The {gene} gene helps break down or transport {drug_name}. "
            f"With a {phenotype} pattern, drug levels can become too high, too low, or less predictable."
        )
        variant = (
            f"Based on your {gene} profile, the expected response to {drug_name} may differ from standard dosing. "
            "That is why dose change or an alternative medicine may be safer."
        )
        clinical = (
            "Please discuss this result with your doctor before changing medicine. "
            "They can confirm with your history, other medicines, and clinical tests."
        )
        return {
            "summary": summary,
            "biological_mechanism": biological,
            "variant_reasoning": variant,
            "clinical_interpretation": clinical,
            "ai_generated": False,
            "model_used": "fallback-template",
        }
