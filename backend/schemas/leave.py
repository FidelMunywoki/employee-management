from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class LeaveCreate(BaseModel):
    type: str  # ANNUAL | CASUAL | SICK
    start_date: date
    end_date: date
    reason: str

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        allowed = {"ANNUAL", "CASUAL", "SICK"}
        if v not in allowed:
            raise ValueError(f"type must be one of {allowed}")
        return v

    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, v, info):
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("end_date can't be before start_date")
        return v


class LeaveReview(BaseModel):
    status: str  # APPROVED | REJECTED
    comment: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        allowed = {"APPROVED", "REJECTED"}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


class EmployeeBrief(BaseModel):
    id: str
    first_name: str
    last_name: str
    department: str

    model_config = {"from_attributes": True}


class LeaveOut(BaseModel):
    id: str
    employee_id: str
    type: str
    start_date: date
    end_date: date
    reason: str
    status: str
    admin_comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    employee: Optional[EmployeeBrief] = None

    model_config = {"from_attributes": True}


class LeaveSummary(BaseModel):
    sick_taken: int
    casual_taken: int
    annual_taken: int