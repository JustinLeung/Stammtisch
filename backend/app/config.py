"""Env-driven config. Loads backend/.env (gitignored). Auth provider
selection: Supabase when real credentials are present, stub otherwise —
the app always runs with zero external credentials (spec requirement)."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
# New-style publishable key preferred; legacy anon key accepted.
SUPABASE_KEY = (
    os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip()
    or os.getenv("SUPABASE_ANON_KEY", "").strip()
)
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


def auth_mode() -> str:
    return "supabase" if SUPABASE_URL and SUPABASE_KEY else "stub"
