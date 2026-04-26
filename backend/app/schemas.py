from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ROPA (Record of Processing Activity) Schemas
class ROPAForm(BaseModel):
    purpose: str
    data_subject: str
    data_category: str

    # "consent" , "not_consent"
    legal_basis: str 
    # "active" , "inactive"

    retention_period: int
    status: str = "active"  

class ROPA(ROPAForm):
    id: int
    expiration_date: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None
