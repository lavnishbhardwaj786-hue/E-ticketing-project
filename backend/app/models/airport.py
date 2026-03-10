from sqlalchemy import Column, Integer, String
from app.db.base import Base


class Airport(Base):
    __tablename__ = "airports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    iata_code = Column(String(3), unique=True, nullable=False, index=True)  # e.g., "JFK"