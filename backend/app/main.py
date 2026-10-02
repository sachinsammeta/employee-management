from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.employee import router as employee_router


app = FastAPI(
    title="Employee Management API",
    description="Backend API for Employee Management Application",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(employee_router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "Employee Management API is running"
    }