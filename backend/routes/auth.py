# api/auth/login , /api/auth/me 

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.employee import Employee

import os
import secrets as secrets_module
import uuid
from schemas.auth import LoginRequest, TokenResponse, EmployeeOut, SetupAdminRequest
from utils.security import verify_password, hash_password, create_access_token
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

@router.post("/setup-admin", response_model=EmployeeOut)
async def setup_admin(
    payload: SetupAdminRequest,
    x_setup_secret: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    expected_secret = os.getenv("ADMIN_SETUP_SECRET")
    if not expected_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin setup is not configured on this deployment",
        )

    # Constant-time comparison — a plain == here would leak timing
    # information an attacker could use to guess the secret character by character
    if not secrets_module.compare_digest(x_setup_secret, expected_secret):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid setup secret",
        )

    result = await db.execute(select(Employee).where(Employee.email == payload.email))
    employee = result.scalar_one_or_none()

    if employee:
        # Upsert: fixes exactly the broken-hash scenario — resets the
        # password on an existing record rather than failing on duplicate email
        employee.hashed_password = hash_password(payload.password)
        employee.role = "ADMIN"
        employee.employment_status = "ACTIVE"
        employee.is_deleted = False
    else:
        employee = Employee(
            id=str(uuid.uuid4()),
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            department=payload.department,
            position=payload.position,
            role="ADMIN",
            employment_status="ACTIVE",
        )
        db.add(employee)

    await db.commit()
    await db.refresh(employee)
    return employee