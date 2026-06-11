"""FastAPI app. v1 endpoints land incrementally; /health and /venues prove
the stack end-to-end for step 1."""
from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from .db import Base, engine, get_session
from .providers.places import SeededPlacesProvider

app = FastAPI(title="Stammtisch API", version="0.1.0")

Base.metadata.create_all(engine)


@app.get("/health")
def health():
    return {"ok": True}


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
