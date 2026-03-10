from sqlalchemy import Column, Integer, String, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.db.base import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    source_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    destination_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    distance_km = Column(Integer, nullable=True)  # Optional: for analytics

    # Relationships
    source_airport = relationship("Airport", foreign_keys=[source_airport_id])
    destination_airport = relationship("Airport", foreign_keys=[destination_airport_id])