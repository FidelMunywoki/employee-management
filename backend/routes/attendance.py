from datetime import datetime, timezone, date
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from config.database import get_db
from models.employee import Employee
from models.attendance import Attendance
from schemas.attendance import AttendanceOut, AttendanceSummary
from dependencies.auth import get_current_employee, require_admin

router = APIRouter()

LATE_CUTOFF_HOUR = 9
LATE_CUTOFF_MINUTE = 15


def compute_day_type(working_hours: float) -> str:
    if working_hours >= 8:
        return "Full Day"
    if working_hours >= 6:
        return "Three Quarter Day"
    if working_hours >= 4:
        return "Half Day"
    return "Short Day"


@router.post("/clock-in", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
async def clock_in(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    today = date.today()

    existing = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == current.id,
            Attendance.attendance_date == today,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You've already clocked in today",
        )

    now = datetime.now(timezone.utc)
    is_late = (now.hour, now.minute) > (LATE_CUTOFF_HOUR, LATE_CUTOFF_MINUTE)

    record = Attendance(
        id=str(uuid.uuid4()),
        employee_id=current.id,
        attendance_date=today,
        check_in=now,
        check_out=None,
        status="LATE" if is_late else "PRESENT",
        working_hours=None,
        day_type=None,
    )
    db.add(record)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You've already clocked in today",
        )

    await db.refresh(record)
    return record


@router.post("/clock-out", response_model=AttendanceOut)
async def clock_out(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    today = date.today()

    result = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == current.id,
            Attendance.attendance_date == today,
            Attendance.check_out.is_(None),
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You haven't clocked in today, or already clocked out",
        )

    now = datetime.now(timezone.utc)
    check_in = record.check_in
    if check_in.tzinfo is None:
        # Defensive: any rows created before this migration may still be naive
        check_in = check_in.replace(tzinfo=timezone.utc)

    elapsed_hours = (now - check_in).total_seconds() / 3600

    record.check_out = now
    record.working_hours = round(elapsed_hours, 2)
    record.day_type = compute_day_type(elapsed_hours)

    await db.commit()
    await db.refresh(record)
    return record


@router.get("/me", response_model=list[AttendanceOut])
async def get_my_attendance(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    result = await db.execute(
        select(Attendance)
        .where(Attendance.employee_id == current.id)
        .order_by(Attendance.attendance_date.desc())
    )
    return result.scalars().all()


@router.get("/me/summary", response_model=AttendanceSummary)
async def get_my_attendance_summary(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    result = await db.execute(
        select(Attendance).where(Attendance.employee_id == current.id)
    )
    records = result.scalars().all()

    days_present = sum(1 for r in records if r.status in ("PRESENT", "LATE"))
    late_arrivals = sum(1 for r in records if r.status == "LATE")

    completed = [r for r in records if r.working_hours is not None]
    avg_hours = (
        round(sum(r.working_hours for r in completed) / len(completed), 2)
        if completed
        else 0.0
    )

    return AttendanceSummary(
        days_present=days_present,
        late_arrivals=late_arrivals,
        avg_work_hours=avg_hours,
    )


@router.get("/", response_model=list[AttendanceOut])
async def list_all_attendance(
    employee_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    query = select(Attendance)
    if employee_id:
        query = query.where(Attendance.employee_id == employee_id)

    result = await db.execute(query.order_by(Attendance.attendance_date.desc()))
    return result.scalars().all()