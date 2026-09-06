from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class EmployeeBrief(BaseModel):
    id: str
    first_name: str
    last_name: str
    department: str

    model_config = {"from_attributes": True}


class AttendanceOut(BaseModel):
    id: str
    employee_id: str
    attendance_date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str
    working_hours: Optional[float] = None
    day_type: Optional[str] = None
    employee: Optional[EmployeeBrief] = None

    model_config = {"from_attributes": True}


class AttendanceSummary(BaseModel):
    days_present: int
    late_arrivals: int
    avg_work_hours: float