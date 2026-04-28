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
    status = Column(String, index=True, default="pending")  # "pending", "active", "inactive"
    
    # New PDPA Fields
    data_controller = Column(String, nullable=True)
    data_processor = Column(String, nullable=True)
    data_sharing = Column(String, nullable=True)
    security_measures = Column(String, nullable=True)
    data_source = Column(String, nullable=True)
    international_transfer = Column(String, nullable=True)
    
    reason = Column(String, nullable=True)
    expiration_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # Admin, DPO, Data Owner
    is_active = Column(Integer, default=1)
