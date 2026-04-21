from sqlalchemy.orm import Session
from app import models, schemas
from typing import Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def calculate_expiration_date(created_at: datetime, retention_period: int) -> str:
    """Calculate expiration date by adding retention_period years to created_at"""
    try:
        expiration = created_at.replace(year=created_at.year + retention_period)
    except ValueError:
        # Handle leap year edge case (e.g., Feb 29)
        expiration = created_at.replace(year=created_at.year + retention_period, day=28)
    return expiration.isoformat()

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# User CRUD Operations
def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        name=user.name,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        update_data = user_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def create_ropa(db: Session, ropa: schemas.ROPAForm):
    created_at = datetime.utcnow()
    expiration_date = calculate_expiration_date(created_at, ropa.retention_period)
    
    db_ropa = models.ROPA(
        purpose=ropa.purpose,
        data_subject=ropa.data_subject,
        data_category=ropa.data_category,
        legal_basis=ropa.legal_basis,
        retention_period=ropa.retention_period,
        status=ropa.status,
        expiration_date=expiration_date,
        created_at=created_at
    )
    db.add(db_ropa)
    db.commit()
    db.refresh(db_ropa)
    return db_ropa

def get_ropa(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ROPA).offset(skip).limit(limit).all()

def get_ropa_by_id(db: Session, ropa_id: int):
    return db.query(models.ROPA).filter(models.ROPA.id == ropa_id).first()

def get_ropa_by_filters(
    db: Session,
    legal_basis: Optional[str] = None,
    status: Optional[str] = None,
    retention_period: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.ROPA)
    
    if legal_basis:
        query = query.filter(models.ROPA.legal_basis == legal_basis)
    if status:
        query = query.filter(models.ROPA.status == status)
    if retention_period is not None:
        query = query.filter(models.ROPA.retention_period < retention_period)
    
    return query.offset(skip).limit(limit).all()

def update_ropa(db: Session, ropa_id: int, ropa: schemas.ROPAForm):
    db_ropa = db.query(models.ROPA).filter(models.ROPA.id == ropa_id).first()
    if db_ropa:
        for key, value in ropa.dict().items():
            setattr(db_ropa, key, value)
        # Recalculate expiration_date if retention_period was updated
        if db_ropa.created_at:
            db_ropa.expiration_date = calculate_expiration_date(db_ropa.created_at, db_ropa.retention_period)
        db.commit()
        db.refresh(db_ropa)
    return db_ropa

def delete_ropa(db: Session, ropa_id: int):
    db_ropa = db.query(models.ROPA).filter(models.ROPA.id == ropa_id).first()
    if db_ropa:
        db.delete(db_ropa)
        db.commit()
    return db_ropa
