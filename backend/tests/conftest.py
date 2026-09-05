import os
import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from main import app
from config.database import Base, get_db
from models.employee import Employee
from utils.security import hash_password

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

# NullPool: never reuse a connection across tests. asyncpg connections are
# bound to the event loop that created them, and pytest-asyncio can give
# different tests different loops — a pooled connection from a closed loop
# causes "another operation is in progress" errors. NullPool sidesteps this
# by opening a brand-new physical connection every time one is requested.
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    expire_on_commit=False,
    join_transaction_mode="create_savepoint",
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Create all tables once before the test session, drop them after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture
async def db_session():
    """Fresh session per test, wrapped in an outer transaction that always
    rolls back. join_transaction_mode='create_savepoint' makes the app's own
    session.commit() calls use SAVEPOINTs instead of trying to open a second
    top-level transaction on the same connection — without this, asyncpg
    raises 'another operation is in progress' the moment a route handler
    calls commit()."""
    async with test_engine.connect() as conn:
        await conn.begin()
        session = TestSessionLocal(bind=conn)

        yield session

        await session.close()
        await conn.rollback()


@pytest_asyncio.fixture
async def client(db_session):
    """HTTP client wired to the test app, with the real DB dependency
    swapped out for our transactional test session."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def admin_user(db_session):
    admin = Employee(
        id=str(uuid.uuid4()),
        first_name="Admin",
        last_name="User",
        email="admin@test.com",
        hashed_password=hash_password("adminpass123"),
        department="Engineering",
        position="Administrator",
        role="ADMIN",
        employment_status="ACTIVE",
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture
async def employee_user(db_session):
    employee = Employee(
        id=str(uuid.uuid4()),
        first_name="Jane",
        last_name="Doe",
        email="jane@test.com",
        hashed_password=hash_password("janepass123"),
        department="Marketing",
        position="Marketing Associate",
        role="EMPLOYEE",
        employment_status="ACTIVE",
    )
    db_session.add(employee)
    await db_session.commit()
    await db_session.refresh(employee)
    return employee


@pytest_asyncio.fixture
async def admin_token(client, admin_user):
    response = await client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "adminpass123"},
    )
    return response.json()["access_token"]


@pytest_asyncio.fixture
async def employee_token(client, employee_user):
    response = await client.post(
        "/api/auth/login",
        json={"email": "jane@test.com", "password": "janepass123"},
    )
    return response.json()["access_token"]