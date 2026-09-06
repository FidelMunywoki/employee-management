from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class PayslipCreate(BaseModel):
    employee_id: str
    month: int
    year: int
    allowances: float = 0
    deductions: float = 0

    @field_validator("month")
    @classmethod
    def validate_month(cls, v):
        if not 1 <= v <= 12:
            raise ValueError("month must be between 1 and 12")
        return v

    @field_validator("year")
    @classmethod
    def validate_year(cls, v):
        if v < 2000 or v > 2100:
            raise ValueError("year looks out of range")
        return v


class EmployeeBrief(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    position: str
    department: str

    model_config = {"from_attributes": True}


class PayslipOut(BaseModel):
    id: str
    employee_id: str
    month: int
    year: int
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float
    created_at: datetime
    updated_at: datetime
    employee: Optional[EmployeeBrief] = None

    model_config = {"from_attributes": True}