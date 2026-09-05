# api/auth/login , /api/auth/me 

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.employee import Employee
from schemas.auth import LoginRequest, TokenResponse, EmployeeOut
from utils.security import verify_password, create_access_token
from dependencies.auth import get_current_employee

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.email == credentials.email))
    employee = result.scalar_one_or_none()

    if not employee or not verify_password(credentials.password, employee.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if employee.is_deleted or employee.employment_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    token = create_access_token({"sub": employee.id, "role": employee.role})
    return TokenResponse(access_token=token, role=employee.role)


@router.get("/me", response_model=EmployeeOut)
async def get_me(current: Employee = Depends(get_current_employee)):
    return current