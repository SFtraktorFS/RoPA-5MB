from fastapi import Depends,FastAPI
from fastapi.responses import HTMLResponse
from app.schemas import ROPAForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import engine, SessionLocal

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

@app.post("/ropa")
async def create_ropa_record(form_data: schemas.ROPAForm, db: Session = Depends(get_db)):
    print(f"Received ROPA data: {form_data}")
    saved_data = crud.create_ropa(db=db, ropa=form_data)
    return {"status": "success", "message": "ROPA record created", "data": saved_data}

@app.get("/ropa")
async def read_ropa_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    ropa_records = crud.get_ropa(db, skip=skip, limit=limit)
    return {"status": "success", "data": ropa_records}

@app.get("/ropa/filter")
async def filter_ropa_records(
    legal_basis: str = None,
    status: str = None,
    retention_period: int = None,
    skip: int = 0,
    limit: int = 100,
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





