import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from config.database import connect_db
import models  # ensures all models are registered with Base before create_all runs
from routes import auth, employees, attendance, leave, payslips, settings

# from routes import auth, employees, payslips, leave, attendance

load_dotenv()

PORT = int(os.getenv("PORT", 4000))


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield


app = FastAPI(title="Employee Management System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Welcome to the Employee Management System API"}


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(payslips.router, prefix="/api/payslips", tags=["payslips"])
app.include_router(leave.router, prefix="/api/leave", tags=["leave"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["attendance"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)