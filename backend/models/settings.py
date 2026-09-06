from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from config.database import Base


class OrganizationSettings(Base):
    __tablename__ = "organization_settings"

    # Fixed id — there is intentionally only ever one row in this table.
    id: Mapped[str] = mapped_column(String, primary_key=True, default="singleton")

    late_cutoff_hour: Mapped[int] = mapped_column(Integer, default=9)
    late_cutoff_minute: Mapped[int] = mapped_column(Integer, default=15)

    annual_leave_days: Mapped[int] = mapped_column(Integer, default=21)
    casual_leave_days: Mapped[int] = mapped_column(Integer, default=7)
    sick_leave_days: Mapped[int] = mapped_column(Integer, default=14)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    updated_by: Mapped[str] = mapped_column(String, nullable=True)