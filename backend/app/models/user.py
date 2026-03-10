from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)  # NEW
    id_number = Column(String(50), nullable=True)     # NEW
    id_type = Column(String(20), nullable=True)       # NEW (passport/national_id/drivers_license)
    is_admin = Column(Boolean, default=False)         # NEW