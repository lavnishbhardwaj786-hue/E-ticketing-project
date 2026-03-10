from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.deps_auth import get_admin_user
from app.models.airport import Airport
from app.schemas.airport import AirportCreate, AirportUpdate, AirportOut

router = APIRouter(prefix="/airports", tags=["Airports"])

@router.post("/", response_model=AirportOut)
def create_airport(
    data: AirportCreate,
    db: Session = Depends(get_db),
    user = Depends(get_admin_user),
):
    existing = db.query(Airport).filter(Airport.iata_code == data.iata_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Airport with this IATA code already exists")

    airport = Airport(**data.model_dump())
    db.add(airport)
    db.commit()
    db.refresh(airport)
    return airport

@router.get("/", response_model=list[AirportOut])
def list_airports(db: Session = Depends(get_db)):
    return db.query(Airport).all()

@router.get("/{airport_id}", response_model=AirportOut)
def get_airport(airport_id: int, db: Session = Depends(get_db)):
    airport = db.query(Airport).filter(Airport.id == airport_id).first()
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    return airport

@router.put("/{airport_id}", response_model=AirportOut)
def update_airport(
    airport_id: int,
    data: AirportUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_admin_user),
):
    airport = db.query(Airport).filter(Airport.id == airport_id).first()
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(airport, key, value)

    db.commit()
    db.refresh(airport)
    return airport

@router.delete("/{airport_id}")
def delete_airport(
    airport_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_admin_user),
):
    airport = db.query(Airport).filter(Airport.id == airport_id).first()
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")

    db.delete(airport)
    db.commit()
    return {"message": "Airport deleted"}