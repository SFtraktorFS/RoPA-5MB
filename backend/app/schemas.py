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
        orm_mode = True

# User Schemas
class UserCreate(BaseModel):
    username: str
    name: str
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

class User(BaseModel):
    id: int
    username: str
    name: str
    role: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    role: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
# 