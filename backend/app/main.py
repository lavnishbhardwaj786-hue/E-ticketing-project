import os
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.api.v1.websocket import router as ws_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Airplane E‑Ticketing API", lifespan=lifespan, redirect_slashes=False)

# Configure CORS for production
# In development, allow localhost; in production, restrict to specific frontend domain
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router)

@app.get("/")
def root():
    return {"message": "API is running"}
