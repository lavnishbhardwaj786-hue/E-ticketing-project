from pydantic import BaseModel
from typing import Any


class AircraftBase(BaseModel):
    model: str
    total_capacity: int
    seat_map: dict[str, Any]  # JSON data


class AircraftCreate(AircraftBase):
    pass


class AircraftUpdate(BaseModel):
    model: str | None = None
    total_capacity: int | None = None
    seat_map: dict[str, Any] | None = None


class AircraftOut(AircraftBase):
    id: int

    class Config:
        from_attributes = True