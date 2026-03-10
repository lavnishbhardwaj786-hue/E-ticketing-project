from sqlalchemy import Column, Integer, String, JSON
from app.db.base import Base


class Aircraft(Base):
    __tablename__ = "aircraft"

    id = Column(Integer, primary_key=True, index=True)
    model = Column(String(100), nullable=False)  # e.g., "Boeing 737-800"
    total_capacity = Column(Integer, nullable=False)
    seat_map = Column(JSON, nullable=False)  # JSON structure for seat layout