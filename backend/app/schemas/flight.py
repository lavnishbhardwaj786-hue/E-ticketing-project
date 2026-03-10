from pydantic import BaseModel
from datetime import datetime


class FlightBase(BaseModel):
    flight_number: str
    route_id: int
    airline_id: int
    aircraft_id: int
    departure_time: datetime
    arrival_time: datetime
    base_price_economy: float
    base_price_business: float | None = None
    base_price_first: float | None = None


class FlightCreate(FlightBase):
    pass


class FlightUpdate(BaseModel):
    flight_number: str | None = None
    route_id: int | None = None
    airline_id: int | None = None
    aircraft_id: int | None = None
    departure_time: datetime | None = None
    arrival_time: datetime | None = None
    base_price_economy: float | None = None
    base_price_business: float | None = None
    base_price_first: float | None = None


class FlightOut(FlightBase):
    id: int

    class Config:
        from_attributes = True


# For search results (includes joined data)
class FlightSearchResult(BaseModel):
    id: int
    flight_number: str
    departure_time: datetime
    arrival_time: datetime
    base_price_economy: float
    base_price_business: float | None
    base_price_first: float | None
    available_seats: int
    airline_name: str
    airline_code: str
    aircraft_model: str
    origin_city: str
    origin_iata: str
    destination_city: str
    destination_iata: str