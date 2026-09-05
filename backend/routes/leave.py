import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.employee import Employee
from models.leave import Leave
from schemas.leave import LeaveCreate, LeaveReview, LeaveOut, LeaveSummary
from dependencies.auth import get_current_employee, require_admin

router = APIRouter()


@router.post("/", response_model=LeaveOut, status_code=status.HTTP_201_CREATED)
async def apply_for_leave(
    payload: LeaveCreate,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    leave = Leave(
        id=str(uuid.uuid4()),
        employee_id=current.id,
        type=payload.type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        status="PENDING",
    )
    db.add(leave)
    await db.commit()
    await db.refresh(leave)
    return leave


@router.get("/me", response_model=list[LeaveOut])
async def get_my_leave_requests(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    result = await db.execute(
        select(Leave)
        .where(Leave.employee_id == current.id)
        .order_by(Leave.created_at.desc())
    )
    return result.scalars().all()


@router.get("/me/summary", response_model=LeaveSummary)
async def get_my_leave_summary(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    result = await db.execute(
        select(Leave).where(Leave.employee_id == current.id, Leave.status == "APPROVED")
    )
    approved = result.scalars().all()

    return LeaveSummary(
        sick_taken=sum(1 for l in approved if l.type == "SICK"),
        casual_taken=sum(1 for l in approved if l.type == "CASUAL"),
        annual_taken=sum(1 for l in approved if l.type == "ANNUAL"),
    )


@router.get("/", response_model=list[LeaveOut])
async def list_all_leave_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    employee_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    query = select(Leave)
    if status_filter:
        query = query.where(Leave.status == status_filter)
    if employee_id:
        query = query.where(Leave.employee_id == employee_id)

    result = await db.execute(query.order_by(Leave.created_at.desc()))
    return result.scalars().all()


@router.get("/summary", response_model=LeaveSummary)
async def get_org_leave_summary(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    result = await db.execute(select(Leave).where(Leave.status == "APPROVED"))
    approved = result.scalars().all()

    return LeaveSummary(
        sick_taken=sum(1 for l in approved if l.type == "SICK"),
        casual_taken=sum(1 for l in approved if l.type == "CASUAL"),
        annual_taken=sum(1 for l in approved if l.type == "ANNUAL"),
    )


@router.patch("/{leave_id}/review", response_model=LeaveOut)
async def review_leave_request(
    leave_id: str,
    payload: LeaveReview,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    result = await db.execute(select(Leave).where(Leave.id == leave_id))
    leave = result.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

    if leave.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This request was already {leave.status.lower()} and can't be reviewed again",
        )

    leave.status = payload.status
    leave.admin_comment = payload.comment

    await db.commit()
    await db.refresh(leave)
    return leave