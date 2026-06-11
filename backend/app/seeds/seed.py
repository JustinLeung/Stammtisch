"""Idempotent seeder: wipes and reloads venues + users.

Usage:  python -m app.seeds.seed
"""
from sqlalchemy import delete
from sqlalchemy.orm import Session

from ..db import Base, SessionLocal, engine
from ..models import (
    BudgetBand, Event, Membership, Rating, User, VerificationStatus, Venue, Vote,
)
from .users import USERS
from .venues import VENUES


def seed(session: Session) -> dict:
    # order matters for FK integrity
    for table in (Vote, Rating, Membership, Event, Venue, User):
        session.execute(delete(table))

    for v in VENUES:
        session.add(Venue(
            name=v["name"], area=v["area"], lat=v["lat"], lng=v["lng"],
            category=v["category"], hours=v["hours"],
            price_band=BudgetBand(v["price_band"]), tags=v["tags"],
            accessibility=v["accessibility"],
        ))
    for u in USERS:
        session.add(User(
            display_name=u["display_name"], interests=u["interests"],
            home_lat=u["home_lat"], home_lng=u["home_lng"],
            travel_radius_km=u["travel_radius_km"],
            availability_windows=u["availability_windows"],
            budget_band=BudgetBand(u["budget_band"]),
            constraints=u["constraints"],
            verification_status=VerificationStatus(u["verification_status"]),
        ))
    session.commit()
    return {"venues": len(VENUES), "users": len(USERS)}


def main():
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        counts = seed(session)
    print(f"Seeded {counts['venues']} venues, {counts['users']} users.")


if __name__ == "__main__":
    main()
