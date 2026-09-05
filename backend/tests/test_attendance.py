import asyncio
import uuid
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import delete

from main import app
from config.database import get_db
from models.attendance import Attendance
from models.employee import Employee
from utils.security import hash_password
from tests.conftest import TestSessionLocal


async def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


async def test_clock_in_success(client, employee_token):
    response = await client.post(
        "/api/attendance/clock-in", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 201
    data = response.json()
    assert data["check_out"] is None
    assert data["status"] in ("PRESENT", "LATE")


async def test_clock_in_twice_same_day_rejected(client, employee_token):
    first = await client.post(
        "/api/attendance/clock-in", headers=await auth_headers(employee_token)
    )
    assert first.status_code == 201

    second = await client.post(
        "/api/attendance/clock-in", headers=await auth_headers(employee_token)
    )
    assert second.status_code == 409


@pytest_asyncio.fixture
async def concurrent_client():
    """A client whose get_db override hands out a brand-new session (and
    thus a brand-new physical connection, since NullPool never reuses one)
    per request — unlike the shared `client` fixture's single db_session.
    This is what actually allows two requests to run truly concurrently
    against the database, which is the whole point of this test."""

    async def override_get_db():
        async with TestSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


async def test_concurrent_clock_in_only_creates_one_record(concurrent_client):
    # This test can't reuse the shared employee_user/employee_token fixtures —
    # those live inside a transaction that's only ever rolled back, never
    # really committed, so they're invisible to the separate connections
    # concurrent_client uses. We create and commit a real employee row here,
    # visible across connections, and clean up both rows manually afterward.
    employee_id = str(uuid.uuid4())
    async with TestSessionLocal() as session:
        employee = Employee(
            id=employee_id,
            first_name="Race",
            last_name="Tester",
            email="race.tester@test.com",
            hashed_password=hash_password("racepass123"),
            department="Engineering",
            position="QA",
            role="EMPLOYEE",
            employment_status="ACTIVE",
        )
        session.add(employee)
        await session.commit()

    login_resp = await concurrent_client.post(
        "/api/auth/login",
        json={"email": "race.tester@test.com", "password": "racepass123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    results = await asyncio.gather(
        concurrent_client.post("/api/attendance/clock-in", headers=headers),
        concurrent_client.post("/api/attendance/clock-in", headers=headers),
    )

    statuses = sorted(r.status_code for r in results)
    assert statuses == [201, 409]

    # Manual cleanup — this test bypasses rollback-based isolation entirely
    async with TestSessionLocal() as session:
        await session.execute(delete(Attendance).where(Attendance.employee_id == employee_id))
        await session.execute(delete(Employee).where(Employee.id == employee_id))
        await session.commit()


async def test_clock_out_without_clock_in_rejected(client, employee_token):
    response = await client.post(
        "/api/attendance/clock-out", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 400


async def test_clock_in_then_out(client, employee_token):
    clock_in_resp = await client.post(
        "/api/attendance/clock-in", headers=await auth_headers(employee_token)
    )
    assert clock_in_resp.status_code == 201

    clock_out_resp = await client.post(
        "/api/attendance/clock-out", headers=await auth_headers(employee_token)
    )
    assert clock_out_resp.status_code == 200
    data = clock_out_resp.json()
    assert data["check_out"] is not None
    assert data["working_hours"] is not None
    assert data["day_type"] is not None


async def test_get_my_attendance(client, employee_token):
    await client.post("/api/attendance/clock-in", headers=await auth_headers(employee_token))

    response = await client.get(
        "/api/attendance/me", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_attendance_summary_empty(client, employee_token):
    response = await client.get(
        "/api/attendance/me/summary", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 200
    data = response.json()
    assert data == {"days_present": 0, "late_arrivals": 0, "avg_work_hours": 0.0}


async def test_attendance_summary_after_clock_cycle(client, employee_token):
    await client.post("/api/attendance/clock-in", headers=await auth_headers(employee_token))
    await client.post("/api/attendance/clock-out", headers=await auth_headers(employee_token))

    response = await client.get(
        "/api/attendance/me/summary", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 200
    data = response.json()
    assert data["days_present"] == 1
    assert data["avg_work_hours"] >= 0


async def test_list_all_attendance_requires_admin(client, employee_token):
    response = await client.get(
        "/api/attendance/", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 403


async def test_list_all_attendance_as_admin(client, admin_token, employee_token):
    await client.post("/api/attendance/clock-in", headers=await auth_headers(employee_token))

    response = await client.get(
        "/api/attendance/", headers=await auth_headers(admin_token)
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


async def test_filter_attendance_by_employee(client, admin_token, employee_token, employee_user):
    await client.post("/api/attendance/clock-in", headers=await auth_headers(employee_token))

    response = await client.get(
        f"/api/attendance/?employee_id={employee_user.id}",
        headers=await auth_headers(admin_token),
    )
    assert response.status_code == 200
    for record in response.json():
        assert record["employee_id"] == employee_user.id