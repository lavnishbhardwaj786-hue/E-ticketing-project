from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.deps_auth import get_admin_user
from app.models.route import Route
from app.schemas.route import RouteCreate, RouteUpdate, RouteOut

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.post("/", response_model=RouteOut)
def create_route(
    data: RouteCreate,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user),
):
    existing = db.query(Route).filter(
        Route.source_airport_id == data.source_airport_id,
        Route.destination_airport_id == data.destination_airport_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Route between these airports already exists")
    route = Route(**data.model_dump())
    db.add(route)
    db.commit()
    db.refresh(route)
    return route

@router.get("/", response_model=list[RouteOut])
def list_routes(db: Session = Depends(get_db)):
    return db.query(Route).all()

@router.get("/{route_id}", response_model=RouteOut)
def get_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.put("/{route_id}", response_model=RouteOut)
def update_route(
    route_id: int,
    data: RouteUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user),
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(route, key, value)
    db.commit()
    db.refresh(route)
    return route

@router.delete("/{route_id}")
def delete_route(
    route_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_admin_user),
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()
    return {"message": "Route deleted"}