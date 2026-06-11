"""PlacesProvider seam (spec §3/§9). One seeded implementation for v1;
a future GooglePlacesProvider implements the same interface."""
from abc import ABC, abstractmethod
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import BudgetBand, Venue

DOW_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

_BAND_ORDER = {BudgetBand.LOW: 0, BudgetBand.MID: 1, BudgetBand.HIGH: 2}


def is_open_at(venue: Venue, when: datetime) -> bool:
    """True if the venue is open at `when`. close < open means past-midnight
    closing (e.g. 19:00–01:00)."""
    day = (venue.hours or {}).get(DOW_KEYS[when.weekday()])
    if not day:
        return False
    open_t, close_t = day
    t = when.strftime("%H:%M")
    if close_t < open_t:  # spills past midnight
        return t >= open_t or t < close_t
    return open_t <= t < close_t


class PlacesProvider(ABC):
    @abstractmethod
    def get(self, venue_id: str) -> Venue | None: ...

    @abstractmethod
    def search(
        self,
        *,
        area: str | None = None,
        categories: list[str] | None = None,
        open_at: datetime | None = None,
        max_price: BudgetBand | None = None,
        tags_any: list[str] | None = None,
    ) -> list[Venue]: ...


class SeededPlacesProvider(PlacesProvider):
    """Backed by the seeded `venues` table — no external key needed."""

    def __init__(self, session: Session):
        self.session = session

    def get(self, venue_id: str) -> Venue | None:
        venue = self.session.get(Venue, venue_id)
        return venue if venue and venue.deleted_at is None else None

    def search(
        self,
        *,
        area: str | None = None,
        categories: list[str] | None = None,
        open_at: datetime | None = None,
        max_price: BudgetBand | None = None,
        tags_any: list[str] | None = None,
    ) -> list[Venue]:
        stmt = select(Venue).where(Venue.deleted_at.is_(None))
        if area:
            stmt = stmt.where(Venue.area == area)
        if categories:
            stmt = stmt.where(Venue.category.in_(categories))
        venues = list(self.session.scalars(stmt))

        if open_at is not None:
            venues = [v for v in venues if is_open_at(v, open_at)]
        if max_price is not None:
            venues = [v for v in venues if _BAND_ORDER[v.price_band] <= _BAND_ORDER[max_price]]
        if tags_any:
            wanted = set(tags_any)
            venues = [v for v in venues if wanted & set(v.tags or [])]
        return venues
