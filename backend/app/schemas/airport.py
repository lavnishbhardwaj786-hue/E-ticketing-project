from pydantic import BaseModel


class AirportBase(BaseModel):
    name: str
    city: str
    country: str
    iata_code: str


class AirportCreate(AirportBase):
    pass


class AirportUpdate(BaseModel):
    name: str | None = None
    city: str | None = None
    country: str | None = None
    iata_code: str | None = None


class AirportOut(AirportBase):
    id: int

    class Config:
        from_attributes = True