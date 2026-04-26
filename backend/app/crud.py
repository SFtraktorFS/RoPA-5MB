from sqlalchemy.orm import Session
from app import models, schemas
from typing import Optional
from datetime import datetime, timedelta

def calculate_expiration_date(created_at: datetime, retention_period: int) -> str:
    """Calculate expiration date by adding retention_period years to created_at"""
    try:
        expiration = created_at.replace(year=created_at.year + retention_period)
    except ValueError:
        # Handle leap year edge case (e.g., Feb 29)
        expiration = created_at.replace(year=created_at.year + retention_period, day=28)
    return expiration.isoformat()

def check_and_update_expired_records(db: Session):
    """Check for expired records and update their status to inactive"""
    now = datetime.utcnow()
    expired_records = db.query(models.ROPA).filter(
        models.ROPA.status == "active",
        models.ROPA.expiration_date.isnot(None)
    ).all()
    
    for record in expired_records:
        try:
            expiration_dt = datetime.fromisoformat(record.expiration_date)
            if expiration_dt < now:
                record.status = "inactive"
        except (ValueError, TypeError):
            # Skip if expiration_date is invalid
            continue
    
    db.commit()

def create_ropa(db: Session, ropa: schemas.ROPAForm):
    created_at = datetime.utcnow()
    expiration_date = calculate_expiration_date(created_at, ropa.retention_period)
    
    db_ropa = models.ROPA(
        purpose=ropa.purpose,
        data_subject=ropa.data_subject,
        data_category=ropa.data_category,
        legal_basis=ropa.legal_basis,
        retention_period=ropa.retention_period,
        status="pending",
        reason=ropa.reason,
        expiration_date=expiration_date,
        created_at=created_at
    )
    db.add(db_ropa)
    db.commit()
    db.refresh(db_ropa)
    return db_ropa

def get_ropa(db: Session, skip: int = 0, limit: int = 100):
    check_and_update_expired_records(db)
    return db.query(models.ROPA).offset(skip).limit(limit).all()

def get_ropa_by_filters(
    db: Session,
    legal_basis: Optional[str] = None,
    status: Optional[str] = None,
    retention_period: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    check_and_update_expired_records(db)
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

def approve_ropa(db: Session, ropa_id: int, approval: schemas.ROPAApprove):
    db_ropa = db.query(models.ROPA).filter(models.ROPA.id == ropa_id).first()
    if db_ropa:
        db_ropa.status = approval.status
        db_ropa.reason = approval.reason
        db.commit()
        db.refresh(db_ropa)
    return db_ropa

def delete_ropa(db: Session, ropa_id: int):
    db_ropa = db.query(models.ROPA).filter(models.ROPA.id == ropa_id).first()
    if db_ropa:
        db.delete(db_ropa)
        db.commit()
    return db_ropa

# User CRUD
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    from app.auth import get_password_hash
    db_user = models.User(
        username=user.username,
        hashed_password=get_password_hash(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        if user.username is not None:
            db_user.username = user.username
        if user.role is not None:
            db_user.role = user.role
        if user.is_active is not None:
            db_user.is_active = 1 if user.is_active else 0
        if user.password is not None:
            from app.auth import get_password_hash
            db_user.hashed_password = get_password_hash(user.password)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
