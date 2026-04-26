from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from datetime import datetime

class ROPA(Base):
    __tablename__ = "ropa_records"

    id = Column(Integer, primary_key=True, index=True)
    purpose = Column(String, index=True)
    data_subject = Column(String, index=True)
    data_category = Column(String)
    legal_basis = Column(String, index=True)  # "consent" or "not_consent"
    retention_period = Column(Integer, index=True)
    status = Column(String, index=True, default="active")  # "active" or "inactive"
    expiration_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # Admin, DPO, Data Owner
    is_active = Column(Integer, default=1)
