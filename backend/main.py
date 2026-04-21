from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from app.schemas import ROPAForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import engine, SessionLocal
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from typing import Optional

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"  # Change this to a secure key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Generator สําหรับจัดการ Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# JWT Token Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(username: str = Depends(verify_token), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def check_admin(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Admin access required.")
    return current_user

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return """
    <html>
        <head><title>CN334 Web App</title></head>
        <body>
            <h1>Welcome to CN334 Backend Development</h1>
            <p>Thitrathawat Buasongsai</p>
            <p>Port: 3340 is working!</p>
    </body>
    </html>
    """

@app.post("/")
async def create_data():
    return {"message": "Data received via POST method", "status": "success"}

# User Authentication Routes
@app.post("/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login endpoint that returns JWT token"""
    user = crud.get_user_by_username(db, username=user_credentials.username)
    if not user or not crud.verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User Management Routes
@app.post("/admin/create", response_model=schemas.UserResponse)
async def create_user(
    user: schemas.UserCreate,
    current_user = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Create new user (Admin only)"""
    existing_user = crud.get_user_by_username(db, username=user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = crud.create_user(db=db, user=user)
    return new_user

@app.delete("/delete/{user_id}")
async def delete_user(
    user_id: int,
    current_user = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Delete user (Admin only)"""
    user = crud.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    deleted_user = crud.delete_user(db=db, user_id=user_id)
    return {"status": "success", "message": "User deleted", "data": deleted_user}

@app.put("/edit/{user_id}", response_model=schemas.UserResponse)
async def edit_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Edit user (Admin only)"""
    user = crud.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = crud.update_user(db=db, user_id=user_id, user_update=user_update)
    return updated_user

# ROPA Routes
@app.post("/ropa")
async def create_ropa_record(form_data: schemas.ROPAForm, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"Received ROPA data: {form_data}")
    saved_data = crud.create_ropa(db=db, ropa=form_data)
    return {"status": "success", "message": "ROPA record created", "data": saved_data}

@app.get("/ropa")
async def read_ropa_records(skip: int = 0, limit: int = 100, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    ropa_records = crud.get_ropa(db, skip=skip, limit=limit)
    return {"status": "success", "data": ropa_records}

@app.get("/ropa/filter")
async def filter_ropa_records(
    legal_basis: str = None,
    status: str = None,
    retention_period: int = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filtered_records = crud.get_ropa_by_filters(
        db=db,
        legal_basis=legal_basis,
        status=status,
        retention_period=retention_period,
        skip=skip,
        limit=limit
    )
    return {"status": "success", "data": filtered_records}

@app.put("/ropa/edit/{ropa_id}", response_model=schemas.ROPA)
async def edit_ropa_record(ropa_id: int, ropa_update: schemas.ROPAForm, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Edit ROPA record"""
    ropa = crud.get_ropa_by_id(db, ropa_id=ropa_id)
    if not ropa:
        raise HTTPException(status_code=404, detail="ROPA record not found")
    
    updated_ropa = crud.update_ropa(db=db, ropa_id=ropa_id, ropa=ropa_update)
    return updated_ropa

@app.delete("/ropa/delete/{ropa_id}")
async def delete_ropa_record(ropa_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete ROPA record"""
    ropa = crud.get_ropa_by_id(db, ropa_id=ropa_id)
    if not ropa:
        raise HTTPException(status_code=404, detail="ROPA record not found")
    
    deleted_ropa = crud.delete_ropa(db=db, ropa_id=ropa_id)
    return {"status": "success", "message": "ROPA record deleted", "data": deleted_ropa}

# Approval Routes
@app.post("/user/approval", response_model=schemas.ApprovalResponse)
async def submit_approval_request(approval_form: schemas.ApprovalForm, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """User submits approval request for ROPA"""
    new_approval = crud.create_approval(db=db, user_id=current_user.id, approval=approval_form)
    return new_approval

@app.get("/admin/approval")
async def get_pending_approvals(skip: int = 0, limit: int = 100, current_user = Depends(check_admin), db: Session = Depends(get_db)):
    """Admin gets pending approvals"""
    approvals = crud.get_pending_approvals(db, skip=skip, limit=limit)
    return {"status": "success", "data": approvals}

@app.post("/admin/approval/{approval_id}")
async def handle_approval(approval_id: int, action: schemas.ApprovalAction, current_user = Depends(check_admin), db: Session = Depends(get_db)):
    """Admin approves or rejects approval request"""
    approval = crud.get_approval_by_id(db, approval_id=approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    if approval.approval_status != "pending":
        raise HTTPException(status_code=400, detail="Approval request already processed")
    
    if action.approval_status == "approved":
        result = crud.approve_and_save_to_ropa(db=db, approval_id=approval_id)
        return {"status": "success", "message": "Approval approved and saved to ROPA", "data": result}
    elif action.approval_status == "rejected":
        rejected_approval = crud.reject_approval(db=db, approval_id=approval_id)
        return {"status": "success", "message": "Approval rejected", "data": rejected_approval}
    else:
        raise HTTPException(status_code=400, detail="Invalid approval_status. Use 'approved' or 'rejected'")

@app.delete("/ropa/{ropa_id}")
async def delete_ropa_record(ropa_id: int, db: Session = Depends(get_db)):
    deleted_record = crud.delete_ropa(db=db, ropa_id=ropa_id)
    if not deleted_record:
        raise HTTPException(status_code=404, detail="ROPA record not found")
    return {"status": "success", "message": "ROPA record deleted", "data": {"id": ropa_id}}





