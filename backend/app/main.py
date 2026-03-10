from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.api.v1.websocket import router as ws_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Airplane E‑Ticketing API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router)

@app.get("/")
def root():
    return {"message": "API is running"}