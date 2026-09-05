from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from config.database import get_db
from models.employee import Employee
from schemas.employee import (
    EmployeeCreate,
    EmployeeUpdateAdmin,
    EmployeeUpdateSelf,
    ChangePasswordRequest,
    EmployeeOut,
)
from utils.security import hash_password, verify_password
from dependencies.auth import get_current_employee, require_admin

router = APIRouter()


@router.get("/", response_model=list[EmployeeOut])
async def list_employees(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    query = select(Employee).where(Employee.is_deleted == False)

    if department:
        query = query.where(Employee.department == department)

    if search:
        term = f"%{search.lower()}%"
        query = query.where(
            or_(
                Employee.first_name.ilike(term),
                Employee.last_name.ilike(term),
                Employee.email.ilike(term),
            )
        )

    result = await db.execute(query.order_by(Employee.created_at.desc()))
    return result.scalars().all()


@router.get("/{employee_id}", response_model=EmployeeOut)
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    if current.role != "ADMIN" and current.id != employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile",
        )

    result = await db.execute(
        select(Employee).where(Employee.id == employee_id, Employee.is_deleted == False)
    )
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


@router.post("/", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
async def create_employee(
    payload: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    result = await db.execute(select(Employee).where(Employee.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee with this email already exists",
        )

    new_employee = Employee(
        id=str(uuid.uuid4()),
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        phone=payload.phone,
        department=payload.department,
        position=payload.position,
        basic_salary=payload.basic_salary,
        allowances=payload.allowances,
        deductions=payload.deductions,
        role=payload.role,
        bio=payload.bio,
        join_date=payload.join_date,
        employment_status="ACTIVE",
    )
    db.add(new_employee)
    await db.commit()
    await db.refresh(new_employee)
    return new_employee


@router.patch("/me", response_model=EmployeeOut)
async def update_own_profile(
    payload: EmployeeUpdateSelf,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(current, field, value)

    await db.commit()
    await db.refresh(current)
    return current


@router.patch("/{employee_id}", response_model=EmployeeOut)
async def update_employee(
    employee_id: str,
    payload: EmployeeUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    result = await db.execute(
        select(Employee).where(Employee.id == employee_id, Employee.is_deleted == False)
    )
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    updates = payload.model_dump(exclude_unset=True)

    if "email" in updates and updates["email"] != employee.email:
        existing = await db.execute(select(Employee).where(Employee.email == updates["email"]))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Another employee already uses this email",
            )

    for field, value in updates.items():
        setattr(employee, field, value)

    await db.commit()
    await db.refresh(employee)
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    if employee_id == current.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't delete your own account",
        )

    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    employee.is_deleted = True
    await db.commit()


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_own_password(
    payload: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    if not verify_password(payload.current_password, current.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 8 characters",
        )

    current.hashed_password = hash_password(payload.new_password)
    await db.commit()