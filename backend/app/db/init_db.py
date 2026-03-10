from app.db.base import Base
from app.db.session import engine

# Import ALL models so metadata is registered
from app.models import (
    User,
    Airline,
    Airport,
    Aircraft,
    Route,
    Flight,
    Booking,
    Payment
)  # noqa


def init_db():
    Base.metadata.create_all(bind=engine)