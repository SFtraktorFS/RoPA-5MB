from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ROPA (Record of Processing Activity) Schemas
class ROPAForm(BaseModel):
    purpose: str
    data_subject: str
    data_category: str
    legal_basis: str 
    retention_period: int
    status: str = "pending" 
    # new ------ 
    data_controller: Optional[str] = None
    data_processor: Optional[str] = None
    data_sharing: Optional[str] = None
    security_measures: Optional[str] = None
    data_source: Optional[str] = None
    international_transfer: Optional[str] = None
    # end new ------
    reason: Optional[str] = None

class ROPA(ROPAForm):
    id: int
    expiration_date: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ROPAApprove(BaseModel):
    status: str # "active" or "inactive"
    reason: str

# User Schemas
class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    id: int
    username: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None
