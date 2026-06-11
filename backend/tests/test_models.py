from app.models import (
    Event, EventStatus, Membership, MembershipRole, MembershipStatus, Rating,
    SeedType, User, Venue, Visibility, Vote, utcnow,
)


def make_user(name="Test", **kw):
    defaults = dict(
        display_name=name, interests=["bouldering"], home_lat=48.13,
        home_lng=11.58, travel_radius_km=5.0,
        availability_windows=[{"dow": 3, "start": "18:00", "end": "22:00"}],
    )
    defaults.update(kw)
    return User(**defaults)


def test_event_defaults(session):
    evt = Event(seed_type=SeedType.MATCH, theme="bouldering", area="Haidhausen")
    session.add(evt)
    session.commit()

    assert evt.id  # uuid assigned
    assert evt.status == EventStatus.SEEDED
    assert evt.visibility == Visibility.PRIVATE
    assert evt.min_size == 3 and evt.max_size == 5 and evt.threshold == 3
    assert evt.venue_id is None and evt.scheduled_time is None
    assert evt.created_at is not None and evt.deleted_at is None


def test_membership_roster_counting(session):
    evt = Event(seed_type=SeedType.MATCH, theme="jazz", area="Haidhausen")
    users = [make_user(f"u{i}") for i in range(4)]
    session.add_all([evt, *users])
    session.flush()

    statuses = [
        MembershipStatus.ACCEPTED, MembershipStatus.ACCEPTED,
        MembershipStatus.PROPOSED, MembershipStatus.DECLINED,
    ]
    for user, status in zip(users, statuses):
        session.add(Membership(
            user_id=user.id, event_id=evt.id,
            role=MembershipRole.HOST, status=status,
        ))
    session.commit()
    session.refresh(evt)

    # only accepted/joined count toward the roster
    assert evt.current_size == 2
    assert evt.current_size < evt.threshold


def test_soft_deleted_membership_excluded(session):
    evt = Event(seed_type=SeedType.AI, theme="hiking", area="Schwabing")
    user = make_user()
    session.add_all([evt, user])
    session.flush()
    m = Membership(user_id=user.id, event_id=evt.id,
                   role=MembershipRole.JOINER, status=MembershipStatus.JOINED)
    session.add(m)
    session.commit()
    session.refresh(evt)
    assert evt.current_size == 1

    m.deleted_at = utcnow()
    session.commit()
    session.refresh(evt)
    assert evt.current_size == 0


def test_vote_and_rating_one_per_user(session):
    evt = Event(seed_type=SeedType.MATCH, theme="board games", area="Maxvorstadt")
    user = make_user()
    venue = Venue(name="Café Puck", area="Maxvorstadt", lat=48.15, lng=11.57,
                  category="boardgame_cafe", hours={}, tags=[])
    session.add_all([evt, user, venue])
    session.flush()

    session.add(Vote(event_id=evt.id, user_id=user.id, venue_id=venue.id))
    session.add(Rating(event_id=evt.id, user_id=user.id, score=5, comment="Great table"))
    session.commit()

    # composite PKs: one vote and one rating per (event, user)
    import pytest
    from sqlalchemy.exc import IntegrityError
    session.add(Vote(event_id=evt.id, user_id=user.id, venue_id=venue.id))
    with pytest.raises(IntegrityError):
        session.commit()
