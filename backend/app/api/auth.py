"""Auth endpoints. Three login paths, all producing the same bearer token:

- magic link (primary): POST /auth/magic-link → email lands the user back
  on the frontend with tokens in the URL fragment (stub mode: instant token)
- Google OAuth: browser redirect to the authorize URL from GET /auth/config;
  tokens also arrive via the frontend redirect
- email+password: POST /auth/signup | /auth/login (kept for tests/scripts)

The backend never sees Google credentials and stores no passwords; it only
verifies bearer tokens via the AuthProvider and maps them to local Users.
"""
from urllib.parse import quote

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import config
from ..db import get_session
from ..models import User, VerificationStatus
from ..providers.auth import AuthError, AuthIdentity, AuthProvider, get_auth_provider

router = APIRouter(prefix="/auth", tags=["auth"])

MUNICH_CENTER = (48.137, 11.575)


def get_provider() -> AuthProvider:
    return get_auth_provider()


class EmailPayload(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def _looks_like_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("invalid email")
        return v


class Credentials(EmailPayload):
    password: str
    display_name: str | None = None


def _ensure_user(session: Session, ident: AuthIdentity, display_name: str | None = None) -> User:
    user = session.scalar(select(User).where(User.auth_id == ident.auth_id))
    if user:
        return user
    user = session.scalar(select(User).where(User.email == ident.email))
    if user:  # seeded/pre-linked user claiming their account
        user.auth_id = ident.auth_id
        session.commit()
        return user
    user = User(
        display_name=display_name or ident.email.split("@")[0],
        email=ident.email,
        auth_id=ident.auth_id,
        home_lat=MUNICH_CENTER[0],
        home_lng=MUNICH_CENTER[1],
        # real account ⇒ verified for v1 (stub verification per spec)
        verification_status=VerificationStatus.VERIFIED,
    )
    session.add(user)
    session.commit()
    return user


def _user_payload(user: User, token: str | None = None, needs_confirmation: bool = False) -> dict:
    out = {
        "user": {
            "id": user.id, "display_name": user.display_name, "email": user.email,
            "verification_status": user.verification_status.value,
        },
        "needs_confirmation": needs_confirmation,
    }
    if token:
        out["token"] = token
    return out


def get_current_user(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
    provider: AuthProvider = Depends(get_provider),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    try:
        ident = provider.verify(authorization.removeprefix("Bearer "))
    except AuthError as e:
        raise HTTPException(e.status_code, e.message)
    return _ensure_user(session, ident)


@router.get("/config")
def auth_config():
    mode = config.auth_mode()
    google_url = None
    if mode == "supabase":
        google_url = (
            f"{config.SUPABASE_URL}/auth/v1/authorize"
            f"?provider=google&redirect_to={quote(config.FRONTEND_ORIGIN, safe='')}"
        )
    return {"mode": mode, "magic_link": True, "google_auth_url": google_url}


@router.post("/magic-link")
def magic_link(
    payload: EmailPayload,
    session: Session = Depends(get_session),
    provider: AuthProvider = Depends(get_provider),
):
    try:
        result = provider.send_magic_link(payload.email, redirect_to=config.FRONTEND_ORIGIN)
    except AuthError as e:
        raise HTTPException(e.status_code, e.message)
    if result is None:
        return {"sent": True}
    user = _ensure_user(session, result.identity)
    return {"sent": True, **_user_payload(user, token=result.token)}


@router.post("/signup")
def signup(
    creds: Credentials,
    session: Session = Depends(get_session),
    provider: AuthProvider = Depends(get_provider),
):
    try:
        result = provider.signup(creds.email, creds.password)
    except AuthError as e:
        raise HTTPException(e.status_code, e.message)
    user = _ensure_user(session, result.identity, display_name=creds.display_name)
    return _user_payload(user, token=result.token, needs_confirmation=result.token is None)


@router.post("/login")
def login(
    creds: Credentials,
    session: Session = Depends(get_session),
    provider: AuthProvider = Depends(get_provider),
):
    try:
        result = provider.login(creds.email, creds.password)
    except AuthError as e:
        raise HTTPException(e.status_code, e.message)
    user = _ensure_user(session, result.identity)
    return _user_payload(user, token=result.token)


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return _user_payload(user)
