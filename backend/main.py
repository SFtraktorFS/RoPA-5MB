from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app import models, schemas, crud, auth
from app.database import engine, SessionLocal
from datetime import timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Generator สําหรับจัดการ Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication Dependencies
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based Dependencies
def check_role(required_roles: list):
    async def role_checker(current_user: models.User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"The user doesn't have enough privileges. Required roles: {required_roles}"
            )
        return current_user
    return role_checker

# Startup event to seed users
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    # Check if users exist, if not, create them
    users_to_create = [
        {"username": "admin", "password": "123456", "role": "Admin"},
        {"username": "dpo", "password": "123456", "role": "DPO"},
        {"username": "dataowner", "password": "123456", "role": "Data Owner"},
    ]
    for user_data in users_to_create:
        if not crud.get_user_by_username(db, user_data["username"]):
            crud.create_user(db, schemas.UserCreate(**user_data))
    db.close()

@app.post("/login", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "id": user.id,
        "username": user.username,
        "role": user.role
    }

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

# Protected Routes Examples
@app.post("/ropa")
async def create_ropa_record(
    form_data: schemas.ROPAForm, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin", "Data Owner"]))
):
    print(f"Received ROPA data: {form_data}")
    saved_data = crud.create_ropa(db=db, ropa=form_data)
    return {"status": "success", "message": "ROPA record created", "data": saved_data}

@app.get("/ropa")
async def read_ropa_records(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    ropa_records = crud.get_ropa(db, skip=skip, limit=limit)
    return {"status": "success", "data": ropa_records}

@app.get("/ropa/filter")
async def filter_ropa_records(
    legal_basis: str = None,
    status: str = None,
    retention_period: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
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

@app.delete("/ropa/{ropa_id}")
async def delete_ropa_record(
    ropa_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin"]))
):
    deleted_record = crud.delete_ropa(db=db, ropa_id=ropa_id)
    if not deleted_record:
        raise HTTPException(status_code=404, detail="ROPA record not found")
    return {"status": "success", "message": "ROPA record deleted", "data": {"id": ropa_id}}

@app.put("/ropa/{ropa_id}")
async def update_ropa_record(
    ropa_id: int, 
    form_data: schemas.ROPAForm, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin", "DPO"]))
):
    updated_record = crud.update_ropa(db=db, ropa_id=ropa_id, ropa=form_data)
    if not updated_record:
        raise HTTPException(status_code=404, detail="ROPA record not found")
    return {"status": "success", "message": "ROPA record updated", "data": updated_record}

@app.post("/ropa/{ropa_id}/approve")
async def approve_ropa_record(
    ropa_id: int, 
    approval_data: schemas.ROPAApprove, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin", "DPO"]))
):
    updated_record = crud.approve_ropa(db=db, ropa_id=ropa_id, approval=approval_data)
    if not updated_record:
        raise HTTPException(status_code=404, detail="ROPA record not found")
    return {"status": "success", "message": f"ROPA record {approval_data.status}", "data": updated_record}

# User Management Routes (Admin only)
@app.get("/users")
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin"]))
):
    users = crud.get_users(db, skip=skip, limit=limit)
    return {"status": "success", "data": users}

@app.post("/users")
async def create_user(
    user_data: schemas.UserCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin"]))
):
    if crud.get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = crud.create_user(db=db, user=user_data)
    return {"status": "success", "message": "User created", "data": new_user}

@app.put("/users/{user_id}")
async def update_user(
    user_id: int, 
    user_data: schemas.UserUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin"]))
):
    updated_user = crud.update_user(db=db, user_id=user_id, user=user_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": "User updated", "data": updated_user}

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["Admin"]))
):
    deleted_user = crud.delete_user(db=db, user_id=user_id)
    if not deleted_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": "User deleted", "data": {"id": user_id}}





