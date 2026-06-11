import re
from datetime import datetime

from sqlalchemy import select

from app.models import BudgetBand, User, Venue, VerificationStatus
from app.providers.places import SeededPlacesProvider, is_open_at

HHMM = re.compile(r"^\d{2}:\d{2}$")


# ---------- seed integrity ----------

def test_venue_seed_size_and_spread(seeded_session):
    venues = list(seeded_session.scalars(select(Venue)))
    assert len(venues) >= 50
    areas = {v.area for v in venues}
    assert len(areas) >= 2  # "a couple of neighborhoods" per spec


def test_venue_hours_shape(seeded_session):
    for v in seeded_session.scalars(select(Venue)):
        assert v.hours, f"{v.name} has no hours"
        for day, span in v.hours.items():
            assert day in ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
            if span is not None:
                open_t, close_t = span
                assert HHMM.match(open_t) and HHMM.match(close_t), v.name


def test_user_seed_validity(seeded_session):
    users = list(seeded_session.scalars(select(User)))
    assert len(users) >= 20
    for u in users:
        assert u.interests, u.display_name
        assert u.travel_radius_km > 0
        for w in u.availability_windows:
            assert 0 <= w["dow"] <= 6
            assert w["start"] < w["end"]
    # at least one unverified edge case for the fit-gate tests later
    assert any(u.verification_status == VerificationStatus.UNVERIFIED for u in users)


def test_seed_is_idempotent(seeded_session):
    from app.seeds.seed import seed
    before = len(list(seeded_session.scalars(select(Venue))))
    seed(seeded_session)  # run again
    after = len(list(seeded_session.scalars(select(Venue))))
    assert before == after


# ---------- places provider ----------

def _thursday_at(hhmm: str) -> datetime:
    # 2026-06-18 is a Thursday
    h, m = map(int, hhmm.split(":"))
    return datetime(2026, 6, 18, h, m)


def test_search_by_area(seeded_session):
    places = SeededPlacesProvider(seeded_session)
    result = places.search(area="Haidhausen")
    assert result and all(v.area == "Haidhausen" for v in result)


def test_open_at_filters_closed_venues(seeded_session):
    places = SeededPlacesProvider(seeded_session)
    monday_noon = datetime(2026, 6, 15, 12, 0)  # museums are closed Mondays
    open_monday = places.search(area="Maxvorstadt", open_at=monday_noon)
    assert all(v.category != "museum" for v in open_monday)
    thursday_noon = datetime(2026, 6, 18, 12, 0)
    open_thursday = places.search(area="Maxvorstadt", open_at=thursday_noon)
    assert any(v.category == "museum" for v in open_thursday)


def test_open_past_midnight(seeded_session):
    # Café Puck closes 01:00: open at 00:30, closed at 02:00
    venue = seeded_session.scalars(select(Venue).where(Venue.name == "Café Puck")).one()
    assert is_open_at(venue, _thursday_at("00:30"))
    assert not is_open_at(venue, _thursday_at("02:00"))
    assert is_open_at(venue, _thursday_at("23:00"))


def test_price_and_tag_filters(seeded_session):
    places = SeededPlacesProvider(seeded_session)
    cheap = places.search(max_price=BudgetBand.LOW)
    assert cheap and all(v.price_band == BudgetBand.LOW for v in cheap)
    outdoor = places.search(tags_any=["outdoor"])
    assert outdoor and all("outdoor" in v.tags for v in outdoor)


def test_get_returns_none_for_missing(seeded_session):
    places = SeededPlacesProvider(seeded_session)
    assert places.get("nope") is None
