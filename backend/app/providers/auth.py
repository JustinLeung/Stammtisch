"""AuthProvider seam (spec §9: auth is externally swappable).

- StubAuthProvider: default; deterministic fake accounts, no network.
- SupabaseAuthProvider: real email/password accounts against Supabase
  GoTrue REST (/auth/v1). Uses only the publishable/anon key — never the
  service_role key — so it is safe in any environment.
"""
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass

import httpx

from .. import config


@dataclass
class AuthIdentity:
    auth_id: str
    email: str


@dataclass
class AuthSession:
    identity: AuthIdentity
    token: str | None  # None => signup ok but email confirmation pending


class AuthError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(message)


class AuthProvider(ABC):
    @abstractmethod
    def signup(self, email: str, password: str) -> AuthSession: ...

    @abstractmethod
    def login(self, email: str, password: str) -> AuthSession: ...

    @abstractmethod
    def verify(self, token: str) -> AuthIdentity: ...

    @abstractmethod
    def send_magic_link(self, email: str, redirect_to: str | None = None) -> AuthSession | None:
        """Passwordless login. Returns an AuthSession when login completes
        immediately (stub mode); returns None when a real email was sent and
        the session arrives later via the redirect link."""


# ---------------------------------------------------------------- stub

_STUB_NS = uuid.UUID("a5b1c3d0-0000-4000-8000-000000000000")


class StubAuthProvider(AuthProvider):
    """Fake accounts: any email/password works, token is `stub:<email>`.
    auth_id is deterministic per email so re-login maps to the same user."""

    def _identity(self, email: str) -> AuthIdentity:
        return AuthIdentity(auth_id=str(uuid.uuid5(_STUB_NS, email.lower())), email=email.lower())

    def signup(self, email: str, password: str) -> AuthSession:
        ident = self._identity(email)
        return AuthSession(identity=ident, token=f"stub:{ident.email}")

    def login(self, email: str, password: str) -> AuthSession:
        return self.signup(email, password)

    def verify(self, token: str) -> AuthIdentity:
        if not token.startswith("stub:"):
            raise AuthError(401, "Invalid token")
        return self._identity(token.removeprefix("stub:"))

    def send_magic_link(self, email: str, redirect_to: str | None = None) -> AuthSession | None:
        return self.signup(email, "")  # stub: the "emailed link" logs in instantly


# ------------------------------------------------------------ supabase

class SupabaseAuthProvider(AuthProvider):
    def __init__(self, url: str, key: str, transport: httpx.BaseTransport | None = None):
        self.base = f"{url.rstrip('/')}/auth/v1"
        self.client = httpx.Client(
            headers={"apikey": key}, timeout=10.0, transport=transport,
        )

    def _raise(self, resp: httpx.Response):
        try:
            body = resp.json()
            msg = body.get("msg") or body.get("error_description") or body.get("message") or resp.text
        except Exception:
            msg = resp.text
        raise AuthError(401 if resp.status_code in (400, 401, 403) else 502, msg)

    def signup(self, email: str, password: str) -> AuthSession:
        resp = self.client.post(f"{self.base}/signup", json={"email": email, "password": password})
        if resp.status_code >= 400:
            self._raise(resp)
        data = resp.json()
        user = data.get("user") or data  # shape differs with/without auto-confirm
        return AuthSession(
            identity=AuthIdentity(auth_id=user["id"], email=user["email"]),
            token=data.get("access_token"),
        )

    def login(self, email: str, password: str) -> AuthSession:
        resp = self.client.post(
            f"{self.base}/token", params={"grant_type": "password"},
            json={"email": email, "password": password},
        )
        if resp.status_code >= 400:
            self._raise(resp)
        data = resp.json()
        return AuthSession(
            identity=AuthIdentity(auth_id=data["user"]["id"], email=data["user"]["email"]),
            token=data["access_token"],
        )

    def verify(self, token: str) -> AuthIdentity:
        resp = self.client.get(f"{self.base}/user", headers={"Authorization": f"Bearer {token}"})
        if resp.status_code >= 400:
            self._raise(resp)
        user = resp.json()
        return AuthIdentity(auth_id=user["id"], email=user["email"])

    def send_magic_link(self, email: str, redirect_to: str | None = None) -> AuthSession | None:
        params = {"redirect_to": redirect_to} if redirect_to else {}
        resp = self.client.post(
            f"{self.base}/otp", params=params,
            json={"email": email, "create_user": True},
        )
        if resp.status_code >= 400:
            self._raise(resp)
        return None  # email sent; session arrives via the redirect link


# ------------------------------------------------------------- factory

def get_auth_provider() -> AuthProvider:
    if config.auth_mode() == "supabase":
        return SupabaseAuthProvider(config.SUPABASE_URL, config.SUPABASE_KEY)
    return StubAuthProvider()
