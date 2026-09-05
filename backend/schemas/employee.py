from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    department: str
    position: str
    basic_salary: float = 0
    allowances: float = 0
    deductions: float = 0
    role: str = "EMPLOYEE"  # EMPLOYEE | ADMIN
    bio: Optional[str] = None
    join_date: Optional[date] = None


class EmployeeUpdateAdmin(BaseModel):
    # Admin editing any employee's full profile — all fields optional so
    # partial PATCH requests only touch what the admin actually changed
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    basic_salary: Optional[float] = None
    allowances: Optional[float] = None
    deductions: Optional[float] = None
    employment_status: Optional[str] = None  # ACTIVE | INACTIVE
    role: Optional[str] = None
    bio: Optional[str] = None
    join_date: Optional[date] = None


class EmployeeUpdateSelf(BaseModel):
    # Employee editing their own profile — deliberately excludes email,
    # salary, department, role, status: those stay admin-only
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class EmployeeOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department: str
    position: str
    basic_salary: float
    allowances: float
    deductions: float
    employment_status: str
    role: str
    bio: Optional[str] = None
    join_date: Optional[date] = None
    image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}