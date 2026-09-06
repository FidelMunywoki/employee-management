import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from config.database import get_db
from models.employee import Employee
from models.payslip import Payslip
from schemas.payslip import PayslipCreate, PayslipOut
from dependencies.auth import get_current_employee, require_admin

router = APIRouter()


@router.post("/", response_model=PayslipOut, status_code=status.HTTP_201_CREATED)
async def generate_payslip(
    payload: PayslipCreate,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    result = await db.execute(select(Employee).where(Employee.id == payload.employee_id))
    employee = result.scalar_one_or_none()
    if not employee or employee.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    basic_salary = employee.basic_salary
    net_salary = basic_salary + payload.allowances - payload.deductions

    payslip = Payslip(
        id=str(uuid.uuid4()),
        employee_id=payload.employee_id,
        month=payload.month,
        year=payload.year,
        basic_salary=basic_salary,
        allowances=payload.allowances,
        deductions=payload.deductions,
        net_salary=net_salary,
    )
    db.add(payslip)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A payslip already exists for this employee for that month and year",
        )

    await db.refresh(payslip)
    return payslip


@router.get("/me", response_model=list[PayslipOut])
async def get_my_payslips(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    result = await db.execute(
        select(Payslip)
        .where(Payslip.employee_id == current.id)
        .order_by(Payslip.year.desc(), Payslip.month.desc())
    )
    return result.scalars().all()


@router.get("/{payslip_id}", response_model=PayslipOut)
async def get_payslip(
    payslip_id: str,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    result = await db.execute(select(Payslip).where(Payslip.id == payslip_id))
    payslip = result.scalar_one_or_none()
    if not payslip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payslip not found")

    if current.role != "ADMIN" and payslip.employee_id != current.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own payslips",
        )

    return payslip


@router.get("/", response_model=list[PayslipOut])
async def list_all_payslips(
    employee_id: Optional[str] = Query(None),
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    query = select(Payslip)
    if employee_id:
        query = query.where(Payslip.employee_id == employee_id)
    if month:
        query = query.where(Payslip.month == month)
    if year:
        query = query.where(Payslip.year == year)

    result = await db.execute(query.order_by(Payslip.year.desc(), Payslip.month.desc()))
    return result.scalars().all()