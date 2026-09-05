from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class AttendanceOut(BaseModel):
    id: str
    employee_id: str
    attendance_date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str
    working_hours: Optional[float] = None
    day_type: Optional[str] = None

    model_config = {"from_attributes": True}


class AttendanceSummary(BaseModel):
    days_present: int
    late_arrivals: int
    avg_work_hours: float