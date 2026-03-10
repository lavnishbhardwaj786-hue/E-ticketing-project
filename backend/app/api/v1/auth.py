# ✅ app/api/v1/auth.py — FIXED VERSION
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.core.security import hash_password, verify_password, create_access_token
from app.services.logging_service import log_user_activity

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize router (must come BEFORE using @router decorators)
router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    db_user = User(
        name=user.name,
        email=user.email,
        username=user.username,
        password_hash=hash_password(user.password),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
@limiter.limit("5/minute")  # Rate limit: 5 attempts per minute
async def login(
        request: Request,
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.username == form_data.username).first()

    if not db_user or not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.username})

    # Log login activity
    await log_user_activity(
        user_id=db_user.id,
        action_type="login",
        description=f"User {db_user.username} logged in",
        ip_address=request.client.host if request.client else None
    )

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }