import asyncio
from config.database import AsyncSessionLocal
from models.employee import Employee
from utils.security import hash_password
from sqlalchemy import select
import uuid

ADMIN_EMAIL = "admin@example.com"

async def seed():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Employee).where(Employee.email == ADMIN_EMAIL))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"Admin already exists ({ADMIN_EMAIL}) — skipping seed")
            return

        admin = Employee(
            id=str(uuid.uuid4()),
            first_name='Admin',
            last_name='User',
            email=ADMIN_EMAIL,
            hashed_password=hash_password('admin123'),
            department='Engineering',
            position='Administrator',
            role='ADMIN',
        )
        db.add(admin)
        await db.commit()
        print('Admin created')

if __name__ == "__main__":
    asyncio.run(seed())