"""Utilidades compartidas: configuración, rutas, cliente de YouTube."""
from __future__ import annotations

import datetime as dt
import json
import os
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = ROOT / "out"
RENDERER = ROOT / "renderer"
CATALOG = RENDERER / "scenes" / "catalog.json"


def load_config() -> dict:
    with open(ROOT / "config.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def week_id(date: dt.date | None = None) -> str:
    d = date or dt.date.today()
    y, w, _ = d.isocalendar()
    return f"{y}-S{w:02d}"


def week_dir(wid: str) -> Path:
    p = OUT / wid
    p.mkdir(parents=True, exist_ok=True)
    return p


def read_json(path: Path, default=None):
    if not Path(path).exists():
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def youtube_client():
    """Cliente autenticado con OAuth (refresh token guardado como secreto)."""
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    creds = Credentials(
        token=None,
        refresh_token=os.environ["YT_REFRESH_TOKEN"],
        client_id=os.environ["YT_CLIENT_ID"],
        client_secret=os.environ["YT_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=[
            "https://www.googleapis.com/auth/youtube.upload",
            "https://www.googleapis.com/auth/youtube.readonly",
        ],
    )
    return build("youtube", "v3", credentials=creds, cache_discovery=False)
