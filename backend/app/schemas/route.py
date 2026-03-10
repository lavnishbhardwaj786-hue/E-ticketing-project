from pydantic import BaseModel


class RouteBase(BaseModel):
    source_airport_id: int
    destination_airport_id: int
    distance_km: int | None = None


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    source_airport_id: int | None = None
    destination_airport_id: int | None = None
    distance_km: int | None = None


class RouteOut(RouteBase):
    id: int

    class Config:
        from_attributes = True