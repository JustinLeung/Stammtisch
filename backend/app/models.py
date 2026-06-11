"""Core domain entities per spec §3, plus Rating (needed for §10 step 6 and
the §8 fit-gate eval). The event is the central object: groups assemble
around events via Memberships; `host` is a role every event has.

Datetimes are naive UTC throughout v1 (Europe/Berlin localization is a
frontend concern for now)."""
import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)  # naive UTC, v1 convention


def SAEnum(e):  # portable across SQLite/Postgres: stored as VARCHAR + check
    return Enum(e, native_enum=False, values_callable=lambda x: [m.value for m in x])


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ---------- enums ----------

class Intent(str, enum.Enum):
    ACTIVITY_FRIENDS = "activity_friends"  # extensible; v1 only value


class BudgetBand(str, enum.Enum):
    LOW = "low"
    MID = "mid"
    HIGH = "high"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    VERIFIED = "verified"


class SeedType(str, enum.Enum):
    MATCH = "match"
    AI = "ai"
    HOST = "host"


class EventStatus(str, enum.Enum):
    SEEDED = "seeded"
    ACCEPTING = "accepting"
    DECIDING = "deciding"
    CONFIRMED = "confirmed"
    OPEN_PUBLIC = "open_public"
    ROSTER_LOCKED = "roster_locked"
    HAPPENING = "happening"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    MERGED = "merged"


class Visibility(str, enum.Enum):
    PRIVATE = "private"
    PUBLIC = "public"


class MembershipRole(str, enum.Enum):
    HOST = "host"      # founding/core cluster (or single creator on host-seeded)
    JOINER = "joiner"  # public seat-filler; accepts a finalized plan


class MembershipStatus(str, enum.Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    JOINED = "joined"


# ---------- entities ----------

class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    display_name: Mapped[str] = mapped_column(String(80))
    # real-account identity (null for seeded/synthetic users)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    auth_id: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    interests: Mapped[list] = mapped_column(JSON, default=list)  # freeform tags
    intent: Mapped[Intent] = mapped_column(SAEnum(Intent), default=Intent.ACTIVITY_FRIENDS)
    home_lat: Mapped[float] = mapped_column(Float)
    home_lng: Mapped[float] = mapped_column(Float)
    travel_radius_km: Mapped[float] = mapped_column(Float, default=5.0)
    # [{dow: 0-6 (Mon=0), start: "14:00", end: "20:00"}, ...]
    availability_windows: Mapped[list] = mapped_column(JSON, default=list)
    budget_band: Mapped[BudgetBand] = mapped_column(SAEnum(BudgetBand), default=BudgetBand.MID)
    # {dietary: [...], accessibility: [...], alcohol_ok: bool, setting: "indoor"|"outdoor"|"either"}
    constraints: Mapped[dict] = mapped_column(JSON, default=dict)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        SAEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED
    )

    memberships: Mapped[list["Membership"]] = relationship(back_populates="user")


class Venue(TimestampMixin, Base):
    __tablename__ = "venues"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120))
    area: Mapped[str] = mapped_column(String(60), index=True)  # neighborhood bucket
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    category: Mapped[str] = mapped_column(String(40), index=True)
    # {"mon": ["09:00","23:00"], ...}; missing/None day = closed; close < open = past midnight
    hours: Mapped[dict] = mapped_column(JSON, default=dict)
    price_band: Mapped[BudgetBand] = mapped_column(SAEnum(BudgetBand), default=BudgetBand.MID)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    # {wheelchair: bool, step_free: bool}
    accessibility: Mapped[dict] = mapped_column(JSON, default=dict)


class Event(TimestampMixin, Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    seed_type: Mapped[SeedType] = mapped_column(SAEnum(SeedType))
    status: Mapped[EventStatus] = mapped_column(
        SAEnum(EventStatus), default=EventStatus.SEEDED, index=True
    )
    theme: Mapped[str] = mapped_column(String(80))
    area: Mapped[str] = mapped_column(String(60), index=True)
    # {dow: 0-6, start: "HH:MM", end: "HH:MM", date: "YYYY-MM-DD"} candidate window
    time_window: Mapped[dict] = mapped_column(JSON, default=dict)
    scheduled_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    venue_id: Mapped[str | None] = mapped_column(ForeignKey("venues.id"), nullable=True)
    shortlist: Mapped[list] = mapped_column(JSON, default=list)  # candidate venue ids
    min_size: Mapped[int] = mapped_column(Integer, default=3)
    max_size: Mapped[int] = mapped_column(Integer, default=5)
    threshold: Mapped[int] = mapped_column(Integer, default=3)  # confirmed count to publicize
    decision_deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    lock_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    visibility: Mapped[Visibility] = mapped_column(SAEnum(Visibility), default=Visibility.PRIVATE)

    venue: Mapped[Venue | None] = relationship()
    memberships: Mapped[list["Membership"]] = relationship(back_populates="event")
    votes: Mapped[list["Vote"]] = relationship(back_populates="event")

    @property
    def confirmed_members(self) -> list["Membership"]:
        return [
            m for m in self.memberships
            if m.status in (MembershipStatus.ACCEPTED, MembershipStatus.JOINED)
            and m.deleted_at is None
        ]

    @property
    def current_size(self) -> int:
        return len(self.confirmed_members)


class Membership(TimestampMixin, Base):
    __tablename__ = "memberships"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), primary_key=True)
    role: Mapped[MembershipRole] = mapped_column(SAEnum(MembershipRole))
    status: Mapped[MembershipStatus] = mapped_column(
        SAEnum(MembershipStatus), default=MembershipStatus.PROPOSED
    )

    user: Mapped[User] = relationship(back_populates="memberships")
    event: Mapped[Event] = relationship(back_populates="memberships")


class Vote(Base):
    __tablename__ = "votes"

    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    venue_id: Mapped[str] = mapped_column(ForeignKey("venues.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    event: Mapped[Event] = relationship(back_populates="votes")


class Rating(Base):
    __tablename__ = "ratings"

    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    score: Mapped[int] = mapped_column(Integer)  # 1..5
    comment: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
