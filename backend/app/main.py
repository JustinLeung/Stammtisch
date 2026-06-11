"""FastAPI app. v1 endpoints land incrementally; auth + /venues so far."""
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import config
from .api.auth import router as auth_router
from .db import Base, engine, get_session
from .providers.places import SeededPlacesProvider

app = FastAPI(title="Stammtisch API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_ORIGIN, "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(engine)

app.include_router(auth_router)


@app.get("/health")
def health():
    return {"ok": True, "auth_mode": config.auth_mode()}


@app.get("/venues")
def list_venues(area: str | None = None, session: Session = Depends(get_session)):
    places = SeededPlacesProvider(session)
    return [
        {
            "id": v.id, "name": v.name, "area": v.area, "category": v.category,
            "price_band": v.price_band.value, "tags": v.tags,
        }
        for v in places.search(area=area)
    ]
