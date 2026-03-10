from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.deps_auth import get_admin_user
from app.models.aircraft import Aircraft
from app.schemas.aircraft import AircraftCreate, AircraftUpdate, AircraftOut

router = APIRouter(prefix="/aircraft", tags=["Aircraft"])

@router.post("/", response_model=AircraftOut)
def create_aircraft(
    data: AircraftCreate,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user),
):
    aircraft = Aircraft(**data.model_dump())
    db.add(aircraft)
    db.commit()
    db.refresh(aircraft)
    return aircraft

@router.get("/", response_model=list[AircraftOut])
def list_aircraft(db: Session = Depends(get_db)):
    return db.query(Aircraft).all()

@router.get("/{aircraft_id}", response_model=AircraftOut)
def get_aircraft(aircraft_id: int, db: Session = Depends(get_db)):
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    return aircraft

@router.put("/{aircraft_id}", response_model=AircraftOut)
def update_aircraft(
    aircraft_id: int,
    data: AircraftUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user),
):
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(aircraft, key, value)
    db.commit()
    db.refresh(aircraft)
    return aircraft

@router.delete("/{aircraft_id}")
def delete_aircraft(
    aircraft_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user),
):
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    db.delete(aircraft)
    db.commit()
    return {"message": "Aircraft deleted"}