"""
Context-aware chatbot using local Ollama for PharmaGuard.
Answers questions related to pharmacogenomics and the website.
"""
import os
from typing import Any, Dict, List, Optional

import httpx


PHARMAGUARD_CONTEXT = """
You are a helpful assistant for PharmaGuard, a pharmacogenomics analysis application.

PharmaGuard Features:
- Upload VCF (Variant Call Format) genetic data files
- Analyze how patients respond to medications based on their genetics
- Support for drugs like clopidogrel, warfarin, codeine, tamoxifen, simvastatin
- Analyzes genes: CYP2C19, CYP2C9, CYP2D6, CYP3A5, SLCO1B1, ABCG2, VKORC1
- Provides risk assessments: Normal, Moderate, High, Very High
- Offers clinical recommendations based on CPIC guidelines
- ML-powered predictions + rule-based engine
- AI-generated explanations using Claude/Ollama

How to use:
1. Upload a VCF file or select sample patient data
2. Select one or more drugs to analyze
3. Click "Analyze" to get risk assessment and recommendations
4. Export results as PDF or JSON

Risk Levels:
- Normal: Standard dosing, no special precautions
- Moderate: May need adjusted dosing or monitoring
- High: Consider alternative medications
- Very High: Strong caution, consider alternative therapy

Answer questions concisely and accurately. If you don't know something, say so.
"""


def _build_chat_prompt(user_message: str, chat_history: List[Dict[str, str]]) -> str:
    history_text = ""
    for msg in chat_history[-5:]:
        role = "User" if msg.get("role") == "user" else "Assistant"
        history_text += f"{role}: {msg.get('content')}\n"

    return f"""System: {PHARMAGUARD_CONTEXT}

Conversation history:
{history_text}
User: {user_message}

Assistant:"""


def _fallback_response(user_message: str) -> str:
    msg_lower = user_message.lower()

    if any(kw in msg_lower for kw in ["how", "use", "upload", "analyze", "start"]):
        return "To use PharmaGuard: 1) Upload your VCF genetic data file or select sample data, 2) Choose drugs to analyze, 3) Click 'Analyze' to get your pharmacogenomic profile and recommendations."

    if any(kw in msg_lower for kw in ["drug", "medication", "medicine"]):
        return "PharmaGuard supports these drugs: clopidogrel (Plavix), warfarin (Coumadin), codeine, tamoxifen, simvastatin (Zocor). More drugs may be available."

    if any(kw in msg_lower for kw in ["gene", "genetic", "variant"]):
        return "PharmaGuard analyzes these genes: CYP2C19, CYP2C9, CYP2D6, CYP3A5, SLCO1B1, ABCG2, VKORC1. These genes affect drug metabolism and response."

    if any(kw in msg_lower for kw in ["risk", "level", "assessment"]):
        return "Risk levels: Normal (standard dosing), Moderate (may need monitoring), High (consider alternatives), Very High (strong caution). Recommendations are based on CPIC guidelines."

    if any(kw in msg_lower for kw in ["what is", "explain", "about"]):
        return "PharmaGuard is a pharmacogenomics tool that analyzes how your genetic variations affect your response to medications. It helps clinicians make personalized medication decisions."

    if any(kw in msg_lower for kw in ["hello", "hi", "hey", "help"]):
        return "Hello! I can help you with questions about PharmaGuard, pharmacogenomics, supported drugs/genes, or how to use the analysis. What would you like to know?"

    return "I'm here to help with PharmaGuard questions. You can ask about how to use the analysis, supported drugs/genes, risk levels, or pharmacogenomics in general. What would you like to know?"


async def chat_with_bot(
    user_message: str,
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    base = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    enabled = os.getenv("USE_OLLAMA_REPORT", "true").lower() in {"1", "true", "yes"}

    if chat_history is None:
        chat_history = []

    if not enabled:
        return {
            "response": _fallback_response(user_message),
            "source": "template"
        }

    url = f"{base}/api/chat"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": PHARMAGUARD_CONTEXT},
            *[
                {"role": msg.get("role", "user"), "content": msg.get("content", "")}
                for msg in chat_history[-5:]
            ],
            {"role": "user", "content": user_message}
        ],
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(url, json=payload)
            r.raise_for_status()
            data = r.json()

        msg = data.get("message") or {}
        content = msg.get("content") or data.get("response") or ""
        if not content.strip():
            return {"response": _fallback_response(user_message), "source": f"ollama:{model}"}
        return {"response": content.strip(), "source": f"ollama:{model}"}
    except Exception:
        return {"response": _fallback_response(user_message), "source": "template"}
