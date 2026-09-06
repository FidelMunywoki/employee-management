from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class SettingsUpdate(BaseModel):
    late_cutoff_hour: Optional[int] = None
    late_cutoff_minute: Optional[int] = None
    annual_leave_days: Optional[int] = None
    casual_leave_days: Optional[int] = None
    sick_leave_days: Optional[int] = None

    @field_validator("late_cutoff_hour")
    @classmethod
    def validate_hour(cls, v):
        if v is not None and not 0 <= v <= 23:
            raise ValueError("late_cutoff_hour must be between 0 and 23")
        return v

    @field_validator("late_cutoff_minute")
    @classmethod
    def validate_minute(cls, v):
        if v is not None and not 0 <= v <= 59:
            raise ValueError("late_cutoff_minute must be between 0 and 59")
        return v

    @field_validator("annual_leave_days", "casual_leave_days", "sick_leave_days")
    @classmethod
    def validate_nonnegative(cls, v):
        if v is not None and v < 0:
            raise ValueError("leave day allowances can't be negative")
        return v


class SettingsOut(BaseModel):
    late_cutoff_hour: int
    late_cutoff_minute: int
    annual_leave_days: int
    casual_leave_days: int
    sick_leave_days: int
    updated_at: datetime
    updated_by: Optional[str] = None

    model_config = {"from_attributes": True}