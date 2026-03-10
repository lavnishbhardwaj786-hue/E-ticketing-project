from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.airline import Airline
from app.schemas.airline import AirlineCreate, AirlineUpdate, AirlineOut
from app.api.deps_auth import get_admin_user

router = APIRouter(prefix="/airlines", tags=["Airlines"])

@router.post("/", response_model=AirlineOut)
def create_airline(
    data: AirlineCreate,
    db: Session = Depends(get_db),
    user = Depends(get_admin_user),
):
    existing = db.query(Airline).filter(
        (Airline.name == data.name) | (Airline.code == data.code)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Airline already exists")

    airline = Airline(**data.model_dump())

    db.add(airline)
    db.commit()
    db.refresh(airline)
    return airline

@router.get("/", response_model=list[AirlineOut])
def list_airlines(
    db: Session = Depends(get_db),
):
    return db.query(Airline).all()

@router.get("/{airline_id}", response_model=AirlineOut)
def get_airline(
    airline_id: int,
    db: Session = Depends(get_db),
):
    airline = db.query(Airline).get(airline_id)

    if not airline:
        raise HTTPException(status_code=404, detail="Airline not found")

    return airline

@router.put("/{airline_id}", response_model=AirlineOut)
def update_airline(
    airline_id: int,
    data: AirlineUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    airline = db.query(Airline).get(airline_id)

    if not airline:
        raise HTTPException(status_code=404, detail="Airline not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(airline, key, value)

    db.commit()
    db.refresh(airline)
    return airline

@router.delete("/{airline_id}")
def delete_airline(
    airline_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    airline = db.query(Airline).get(airline_id)

    if not airline:
        raise HTTPException(status_code=404, detail="Airline not found")

    db.delete(airline)
    db.commit()
    return {"message": "Airline deleted"}

