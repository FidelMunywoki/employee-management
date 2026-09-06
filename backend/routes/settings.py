from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.employee import Employee
from models.settings import OrganizationSettings
from schemas.settings import SettingsUpdate, SettingsOut
from dependencies.auth import get_current_employee, require_admin

router = APIRouter()


async def get_or_create_settings(db: AsyncSession) -> OrganizationSettings:
    result = await db.execute(
        select(OrganizationSettings).where(OrganizationSettings.id == "singleton")
    )
    settings = result.scalar_one_or_none()

    if not settings:
        settings = OrganizationSettings(id="singleton")
        db.add(settings)
        await db.commit()
        await db.refresh(settings)

    return settings


@router.get("/", response_model=SettingsOut)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(get_current_employee),
):
    # Readable by everyone — the frontend needs this to show leave
    # allowances/policy info even on employee-facing pages.
    return await get_or_create_settings(db)


@router.patch("/", response_model=SettingsOut)
async def update_settings(
    payload: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current: Employee = Depends(require_admin),
):
    settings = await get_or_create_settings(db)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(settings, field, value)

    settings.updated_by = current.id

    await db.commit()
    await db.refresh(settings)
    return settings