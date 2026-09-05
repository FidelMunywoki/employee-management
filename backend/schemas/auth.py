# LoginRequest, tokenResponse, tokenData, EmployeeOut ...

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class EmployeeOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    role: str
    department: str
    position: str

    model_config = {"from_attributes": True}
        