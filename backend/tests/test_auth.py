import httpx
import pytest
from fastapi.testclient import TestClient

from app.db import get_session
from app.main import app
from app.models import User, VerificationStatus
from app.providers.auth import (
    AuthError, StubAuthProvider, SupabaseAuthProvider,
)


@pytest.fixture()
def client(session):
    def _session_override():
        yield session

    app.dependency_overrides[get_session] = _session_override
    yield TestClient(app)
    app.dependency_overrides.clear()


# ---------- stub flow end-to-end (default mode, no credentials) ----------

def test_config_reports_stub_mode(client):
    cfg = client.get("/auth/config").json()
    assert cfg["mode"] == "stub"
    assert cfg["magic_link"] is True
    assert cfg["google_auth_url"] is None


def test_magic_link_stub_logs_in_instantly(client, session):
    resp = client.post("/auth/magic-link", json={"email": "anna@example.com"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["sent"] is True and data["token"].startswith("stub:")
    # local user created, verified, named from email prefix
    user = session.query(User).filter_by(email="anna@example.com").one()
    assert user.display_name == "anna"
    assert user.verification_status == VerificationStatus.VERIFIED


def test_me_roundtrip_and_stable_identity(client):
    token = client.post("/auth/magic-link", json={"email": "max@example.com"}).json()["token"]
    me1 = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    me2 = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    assert me1["user"]["id"] == me2["user"]["id"]  # same local user on re-auth


def test_signup_login_password_path(client):
    up = client.post("/auth/signup", json={
        "email": "vroni@example.com", "password": "pw", "display_name": "Vroni",
    }).json()
    assert up["user"]["display_name"] == "Vroni"
    down = client.post("/auth/login", json={"email": "vroni@example.com", "password": "pw"}).json()
    assert down["user"]["id"] == up["user"]["id"]


def test_bad_token_rejected(client):
    assert client.get("/auth/me", headers={"Authorization": "Bearer nonsense"}).status_code == 401
    assert client.get("/auth/me").status_code == 401


def test_invalid_email_rejected(client):
    assert client.post("/auth/magic-link", json={"email": "not-an-email"}).status_code == 422


# ---------- supabase provider against a mocked GoTrue ----------

def _mock_gotrue(request: httpx.Request) -> httpx.Response:
    assert request.headers["apikey"] == "test-key"
    path = request.url.path
    if path.endswith("/signup"):
        return httpx.Response(200, json={
            "user": {"id": "sb-uuid-1", "email": "lena@example.com"},
            "access_token": "jwt-abc",
        })
    if path.endswith("/token"):
        return httpx.Response(200, json={
            "access_token": "jwt-abc",
            "user": {"id": "sb-uuid-1", "email": "lena@example.com"},
        })
    if path.endswith("/user"):
        if request.headers.get("authorization") == "Bearer jwt-abc":
            return httpx.Response(200, json={"id": "sb-uuid-1", "email": "lena@example.com"})
        return httpx.Response(401, json={"msg": "invalid JWT"})
    if path.endswith("/otp"):
        assert request.url.params["redirect_to"]
        return httpx.Response(200, json={})
    return httpx.Response(404)


@pytest.fixture()
def supabase_provider():
    return SupabaseAuthProvider(
        "https://proj.supabase.co", "test-key",
        transport=httpx.MockTransport(_mock_gotrue),
    )


def test_supabase_signup_and_login(supabase_provider):
    s = supabase_provider.signup("lena@example.com", "pw123456")
    assert s.identity.auth_id == "sb-uuid-1" and s.token == "jwt-abc"
    s = supabase_provider.login("lena@example.com", "pw123456")
    assert s.token == "jwt-abc"


def test_supabase_verify(supabase_provider):
    ident = supabase_provider.verify("jwt-abc")
    assert ident.email == "lena@example.com"
    with pytest.raises(AuthError) as exc:
        supabase_provider.verify("wrong")
    assert exc.value.status_code == 401


def test_supabase_magic_link_sends_email(supabase_provider):
    assert supabase_provider.send_magic_link("lena@example.com", redirect_to="http://localhost:5173") is None


# ---------- stub provider determinism ----------

def test_stub_identity_is_deterministic():
    p = StubAuthProvider()
    a = p.send_magic_link("Same@Example.com").identity
    b = p.verify("stub:same@example.com")
    assert a.auth_id == b.auth_id
