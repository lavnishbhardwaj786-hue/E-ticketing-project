from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.api.v1.websocket import router as ws_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(title="Airplane E‑Ticketing API", lifespan=lifespan)

app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router)

@app.get("/")
def root():
    return {"message": "API is running"}