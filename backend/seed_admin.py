import asyncio
from config.database import AsyncSessionLocal
from models.employee import Employee
from utils.security import hash_password
import uuid

async def seed():
    async with AsyncSessionLocal() as db:
        admin = Employee(
            id=str(uuid.uuid4()),
            first_name='Admin',
            last_name='User',
            email='admin@example.com',
            hashed_password=hash_password('put password here'),
            department='Engineering',
            position='Administrator',
            role='ADMIN',
        )
        db.add(admin)
        await db.commit()
        print('Admin created')

asyncio.run(seed())


# docker cp seed_admin.py employee-management-backend-1:/app/seed_admin.py
# docker compose exec backend python3 seed_admin.py
