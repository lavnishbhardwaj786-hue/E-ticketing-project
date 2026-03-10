from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.airline import router as airline_router
from app.api.v1.airport import router as airport_router
from app.api.v1.aircraft import router as aircraft_router
from app.api.v1.route import router as route_router
from app.api.v1.flight import router as flight_router
from app.api.v1.booking import router as booking_router
from app.api.v1.payment import router as payment_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(airline_router)
api_router.include_router(airport_router)
api_router.include_router(aircraft_router)
api_router.include_router(route_router)
api_router.include_router(flight_router)
api_router.include_router(booking_router)
api_router.include_router(payment_router)


@api_router.get("/health")
def health_check():
    return {"status": "ok"}