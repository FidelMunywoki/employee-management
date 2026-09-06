import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base

if TYPE_CHECKING:
    from .employee import Employee


class Payslip(Base):
    __tablename__ = "payslips"
    __table_args__ = (
        UniqueConstraint("employee_id", "month", "year", name="uq_employee_payslip_period"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id: Mapped[str] = mapped_column(String, ForeignKey("employees.id"), nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    basic_salary: Mapped[float] = mapped_column(Float, nullable=False)
    allowances: Mapped[float] = mapped_column(Float, default=0)
    deductions: Mapped[float] = mapped_column(Float, default=0)
    net_salary: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    employee: Mapped["Employee"] = relationship("Employee", lazy="selectin")