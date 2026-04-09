"""
Generate a human-readable report narrative from a PharmaGuard AnalysisResponse JSON.
Uses local Ollama when available; falls back to a structured template.
"""
from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional

import httpx


def _build_prompt(report: Dict[str, Any]) -> str:
    compact = json.dumps(report, indent=2, default=str)[:12000]
    return f"""You are a medical education assistant. The user will paste a JSON export from the PharmaGuard pharmacogenomics app.

Analyze this JSON and write a clear, structured explanation for a normal user (non-expert). Use markdown-style headings.

Cover these sections in order:
1. **Main verdict** — drug name, risk level, severity, confidence, and the main recommendation in plain language.
2. **Genetic profile** — how many genes/variants were analyzed, highlight the most relevant gene for the selected drug, phenotypes (e.g. metabolizer types), and note if "Complex" or multiple pathways matter.
3. **Clinical explanation** — summarize biological_mechanism, variant_reasoning, clinical_interpretation, and summary from the explanation block if present.
4. **System / technical notes** — briefly mention quality_metrics (processing time, variant counts), whether ai_generated is true/false, model_used, and compliance flags if present.

Rules:
- Do not invent lab values or diagnoses.
- If data is missing, say so briefly.
- Keep total length reasonable (under ~800 words).
- End with one sentence: results are educational and a clinician must confirm any medication change.

JSON:
{compact}
"""


def _fallback_narrative(report: Dict[str, Any]) -> str:
    drug = (report.get("drug_info") or {}).get("name", "Unknown drug")
    risk = (report.get("risk_assessment") or {})
    risk_level = risk.get("risk_level", "Unknown")
    severity = risk.get("severity", "Unknown")
    conf = risk.get("confidence", 0)
    rec = risk.get("recommendation", "No recommendation text.")
    qm = report.get("quality_metrics") or {}
    expl = report.get("explanation") or {}
    profile = report.get("pharmacogenomic_profile") or {}

    lines = [
        "## 1. Main verdict",
        f"- **Drug:** {drug}",
        f"- **Risk level:** {risk_level}",
        f"- **Severity:** {severity}",
        f"- **Confidence:** ~{float(conf) * 100:.0f}%" if isinstance(conf, (int, float)) else f"- **Confidence:** {conf}",
        f"- **Recommendation:** {rec}",
        "",
        "## 2. Genetic profile",
    ]
    genes = list(profile.keys())
    lines.append(f"- Genes in this report: **{len(genes)}** ({', '.join(genes) if genes else 'none listed'}).")
    total_v = qm.get("total_variants_found", "—")
    cov = qm.get("variant_coverage", "—")
    lines.append(f"- Variants in VCF (total): **{total_v}**; target-gene variant coverage: **{cov}**.")
    for g, p in list(profile.items())[:6]:
        ph = (p or {}).get("phenotype", "?")
        vc = (p or {}).get("variant_count", "?")
        lines.append(f"  - **{g}:** phenotype *{ph}*, variants: {vc}")
    lines.extend(
        [
            "",
            "## 3. Clinical explanation (from report)",
            expl.get("summary") or expl.get("biological_mechanism") or "No AI summary block present.",
            "",
            "## 4. Technical notes",
            f"- Processing time: **{qm.get('processing_time_ms', '—')}** ms",
            f"- AI explanation: **{'yes' if expl.get('ai_generated') else 'no'}**, model: `{expl.get('model_used', '—')}`",
            f"- Compliance flags: {report.get('compliance', {})}",
            "",
            "*Educational only — confirm any medication change with a licensed clinician.*",
        ]
    )
    return "\n".join(lines)


async def interpret_report_json(report: Dict[str, Any]) -> Dict[str, str]:
    base = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    enabled = os.getenv("USE_OLLAMA_REPORT", "true").lower() in {"1", "true", "yes"}

    if not enabled:
        return {"narrative": _fallback_narrative(report), "source": "template"}

    url = f"{base}/api/chat"
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": _build_prompt(report)}],
        "stream": False,
    }
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.post(url, json=payload)
            r.raise_for_status()
            data = r.json()
        msg = data.get("message") or {}
        content = msg.get("content") or data.get("response") or ""
        if not content.strip():
            return {"narrative": _fallback_narrative(report), "source": "template"}
        return {"narrative": content.strip(), "source": f"ollama:{model}"}
    except Exception:
        return {"narrative": _fallback_narrative(report), "source": "template"}
