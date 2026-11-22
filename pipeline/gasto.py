"""Registro de lo que se gasta en las APIs (Claude y OpenAI), calculado con los tokens reales de cada llamada.

Cada ejecución deja sus gastos en data/gasto/<fecha>-<tanda>-<proceso>.json (un archivo por proceso: las máquinas que
trabajan a la vez nunca chocan). El panel suma lo gastado desde que el dueño apuntó su saldo y enseña lo que le queda.
Precios en dólares por millón de tokens (los de la API; el lote/Batch cuesta la mitad).
"""
from __future__ import annotations

import atexit
import datetime as dt
import json
import os
from pathlib import Path

DIR = Path(__file__).resolve().parent.parent / "data" / "gasto"
# modelo -> (entrada, salida, lectura de caché)
PRECIOS = {
    "claude-opus-5-5": (4.0, 20.0, 0.20),
    "claude-sonnet-5-5": (2.0, 10.0, 0.10),
    "claude-haiku-5-5": (0.10, 0.50, 0.01),
    "claude-sonnet-5": (2.0, 10.0, 0.20),
    "claude-opus-5": (5.0, 25.0, 0.50),
    "claude-opus-4-8": (5.0, 25.0, 0.50),
}
_ENTRIES: list[dict] = []
_STAMP = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%S")


def _precio(model: str) -> tuple[float, float, float]:
    m = str(model or "")
    for k, v in PRECIOS.items():
        if m.startswith(k):
            return v
    return PRECIOS["claude-opus-5-5"] if "opus" in m else PRECIOS["claude-haiku-5-5"] if "haiku" in m else PRECIOS["claude-sonnet-5-5"]


def anthropic(model: str, usage, batch: bool = False, que: str = "") -> float:
    """Apunta una llamada a Claude. 'usage' es resp.usage del SDK."""
    try:
        pin, pout, pcache = _precio(model)
        g = lambda k: int(getattr(usage, k, 0) or 0)  # noqa: E731
        usd = (g("input_tokens") * pin + g("cache_creation_input_tokens") * pin * 2 + g("cache_read_input_tokens") * pcache
               + g("output_tokens") * pout) / 1e6
        if batch:
            usd *= 0.5
        _ENTRIES.append({"servicio": "anthropic", "modelo": model, "usd": round(usd, 6), "que": que or ("lote" if batch else "")})
        return usd
    except Exception:  # noqa: BLE001
        return 0.0


def openai_image(model: str, usage: dict | None, calidad: str = "medium", que: str = "miniatura") -> float:
    """Apunta una imagen de OpenAI (con su 'usage' si lo trae; si no, el precio orientativo por imagen)."""
    try:
        if usage and usage.get("output_tokens"):
            usd = (usage.get("input_tokens", 0) * 5.0 + usage.get("output_tokens", 0) * 40.0) / 1e6
        else:
            usd = {"low": 0.016, "medium": 0.063, "high": 0.25}.get(calidad, 0.063)
        _ENTRIES.append({"servicio": "openai", "modelo": model, "usd": round(usd, 6), "que": que})
        return usd
    except Exception:  # noqa: BLE001
        return 0.0


@atexit.register
def guardar() -> None:
    if not _ENTRIES:
        return
    try:
        DIR.mkdir(parents=True, exist_ok=True)
        rid = os.environ.get("RUN_ID", "local").replace("/", "-")
        f = DIR / f"{_STAMP}-{rid}-{os.getpid()}.json"
        total = {s: round(sum(e["usd"] for e in _ENTRIES if e["servicio"] == s), 6) for s in ("anthropic", "openai")}
        f.write_text(json.dumps({"fecha": dt.datetime.now(dt.timezone.utc).isoformat(), "tanda": rid, "total_usd": total,
                                 "llamadas": _ENTRIES}, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"Gasto de API apuntado: Claude {total['anthropic']:.4f} $ · OpenAI {total['openai']:.4f} $")
    except Exception as e:  # noqa: BLE001
        print(f"aviso: no se pudo apuntar el gasto ({e})")
