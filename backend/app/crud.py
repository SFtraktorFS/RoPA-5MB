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

def create_ropa(db: Session, ropa: schemas.ROPAForm, user_id: Optional[int] = None):
    created_at = datetime.utcnow()
    expiration_date = calculate_expiration_date(created_at, ropa.retention_period)
    
    db_ropa = models.ROPA(
        user_id=user_id,
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
    check_and_update_expired_records(db)
    return db.query(models.ROPA).offset(skip).limit(limit).all()

def get_ropa_by_id(db: Session, ropa_id: int):
    return db.query(models.ROPA).filter(models.ROPA.id == ropa_id).first()

def get_ropa_by_user_id(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ROPA).filter(models.ROPA.user_id == user_id).offset(skip).limit(limit).all()

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

def delete_ropa(db: Session, ropa_id: int):
    db_ropa = db.query(models.ROPA).filter(models.ROPA.id == ropa_id).first()
    if db_ropa:
        db.delete(db_ropa)
        db.commit()
    return db_ropa

# Approval CRUD Operations
def create_approval(db: Session, user_id: int, approval: schemas.ApprovalForm):
    db_approval = models.Approval(
        user_id=user_id,
        purpose=approval.purpose,
        data_subject=approval.data_subject,
        data_category=approval.data_category,
        legal_basis=approval.legal_basis,
        retention_period=approval.retention_period,
        approval_status="pending"
    )
    db.add(db_approval)
    db.commit()
    db.refresh(db_approval)
    return db_approval

def get_pending_approvals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Approval).filter(models.Approval.approval_status == "pending").offset(skip).limit(limit).all()

def get_approval_by_id(db: Session, approval_id: int):
    return db.query(models.Approval).filter(models.Approval.id == approval_id).first()

def approve_and_save_to_ropa(db: Session, approval_id: int):
    db_approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not db_approval:
        return None
    
    # Create ROPA record from approval
    ropa_data = schemas.ROPAForm(
        purpose=db_approval.purpose,
        data_subject=db_approval.data_subject,
        data_category=db_approval.data_category,
        legal_basis=db_approval.legal_basis,
        retention_period=db_approval.retention_period,
        status="active"
    )
    
    # Save to ROPA with user_id
    saved_ropa = create_ropa(db=db, ropa=ropa_data, user_id=db_approval.user_id)
    
    # Update approval status
    db_approval.approval_status = "approved"
    db.commit()
    db.refresh(db_approval)
    
    return {"approval": db_approval, "ropa": saved_ropa}

def reject_approval(db: Session, approval_id: int):
    db_approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if db_approval:
        db_approval.approval_status = "rejected"
        db.commit()
        db.refresh(db_approval)
    return db_approval

def get_user_approvals(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Approval).filter(models.Approval.user_id == user_id).offset(skip).limit(limit).all()
