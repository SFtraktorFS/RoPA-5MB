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
