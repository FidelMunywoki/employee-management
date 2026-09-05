# Employee Management System — Backend

FastAPI + PostgreSQL backend for the Employee Management System (EMS), containerized with Docker Compose. Supports two roles — **ADMIN** and **EMPLOYEE** — with JWT authentication, role-based access control, and a full test suite.

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL (via SQLAlchemy async + asyncpg)
- **Migrations:** Alembic (run manually)
- **Auth:** JWT (python-jose) + bcrypt password hashing
- **Testing:** pytest, pytest-asyncio, httpx
- **Containerization:** Docker Compose

## Project Structure

```
backend/
├── main.py                  # App entrypoint, router registration, lifespan
├── config/
│   └── database.py          # Engine, Base, get_db dependency, connect_db
├── models/                  # SQLAlchemy ORM models
│   ├── employee.py
│   ├── leave.py
│   ├── payslip.py
│   └── attendance.py
├── schemas/                 # Pydantic request/response schemas
│   ├── auth.py
│   ├── employee.py
│   ├── attendance.py
│   └── leave.py
├── routes/                  # API route handlers
│   ├── auth.py
│   ├── employees.py
│   ├── attendance.py
│   └── leave.py
├── dependencies/
│   └── auth.py               # get_current_employee, require_admin
├── utils/
│   └── security.py           # bcrypt hashing, JWT create/decode
├── alembic/                  # Migration scripts
├── tests/                    # pytest test suite
├── Dockerfile
└── requirements.txt
```

## Setup

### 1. Environment variables

Create a `.env` file in `backend/`:

```env
PORT=4000
DATABASE_URL=postgresql+asyncpg://ems_user:yourpassword@db:5432/employee_management
TEST_DATABASE_URL=postgresql+asyncpg://ems_user:yourpassword@db:5432/employee_management_test
JWT_SECRET_KEY=<generate with: python3 -c "import secrets; print(secrets.token_hex(32))">
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 2. Run with Docker Compose

From the project root (alongside `docker-compose.yml`):

```bash
docker compose up --build
```

This starts:
- `db` — PostgreSQL 16, with a persistent `pgdata` volume
- `backend` — FastAPI app on port `4000`

### 3. Apply migrations

```bash
docker compose exec backend alembic upgrade head
```

### 4. Seed an admin account

There's no public signup route — admins create all employee accounts. To bootstrap the first admin, run a one-off script (see `seed_admin.py` pattern used during development) or insert directly via the `/api/employees/` endpoint once you have one admin token.

### 5. Verify

```bash
curl http://localhost:4000
# {"message":"Welcome to the Employee Management System API"}
```

Interactive API docs are available at `http://localhost:4000/docs` (Swagger UI) once the server is running.

## Running Tests

Tests run against a **separate database** (`employee_management_test`), isolated from dev data via a rollback-per-test transaction pattern.

```bash
# One-time: create the test database
docker compose exec db psql -U ems_user -d postgres -c "CREATE DATABASE employee_management_test;"

# Run all tests
docker compose exec backend pytest -v

# Run one file
docker compose exec backend pytest tests/test_attendance.py -v

# Run tests matching a keyword
docker compose exec backend pytest -v -k "leave"
```

## Database Migrations

Migrations are managed **manually** with Alembic — no auto-run on startup.

```bash
# After changing a model, generate a migration
docker compose exec backend alembic revision --autogenerate -m "describe the change"

# Review the generated file in alembic/versions/ before applying

# Apply it
docker compose exec backend alembic upgrade head
```

## Authentication

All endpoints except `GET /` and `POST /api/auth/login` require a JWT sent as:

```
Authorization: Bearer <token>
```

Tokens are obtained via login and encode the employee's `id` (as `sub`) and `role`. Two access levels are enforced via dependencies:

- **Authenticated** (`get_current_employee`) — any valid, active employee
- **Admin** (`require_admin`) — role must be `ADMIN`

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Log in with email + password. Returns `access_token`, `token_type`, `role`. |
| GET | `/api/auth/me` | Authenticated | Get the current logged-in employee's profile. |

**Example — login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

### Employees — `/api/employees`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/employees/` | Admin | List all employees. Query params: `search` (name/email), `department`. |
| GET | `/api/employees/{id}` | Self or Admin | Get one employee's profile. |
| POST | `/api/employees/` | Admin | Create a new employee. Hashes the provided password; rejects duplicate email. |
| PATCH | `/api/employees/me` | Self | Update own `first_name`, `last_name`, `phone`, `bio` only. |
| PATCH | `/api/employees/{id}` | Admin | Full profile edit — email, department, position, salary, status, role. |
| DELETE | `/api/employees/{id}` | Admin | Soft delete (`is_deleted = true`). Admins can't delete their own account. |
| POST | `/api/employees/change-password` | Authenticated (self) | Change own password. Requires `current_password` + `new_password` (min 8 chars). |

**Example — create employee:**
```bash
curl -X POST http://localhost:4000/api/employees/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "password": "temp12345",
    "department": "Marketing",
    "position": "Marketing Associate"
  }'
```

---

### Attendance — `/api/attendance`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/attendance/clock-in` | Authenticated (self) | Clock in for today. `409` if already clocked in today (enforced by app check + DB unique constraint on `employee_id + attendance_date`). Marks `LATE` if after the cutoff time. |
| POST | `/api/attendance/clock-out` | Authenticated (self) | Clock out of today's open record. Computes `working_hours` and `day_type` (Full/Three Quarter/Half/Short Day). |
| GET | `/api/attendance/me` | Authenticated (self) | List own attendance history, most recent first. |
| GET | `/api/attendance/me/summary` | Authenticated (self) | Returns `days_present`, `late_arrivals`, `avg_work_hours`. |
| GET | `/api/attendance/` | Admin | List all attendance records. Optional `employee_id` filter. |

---

### Leave — `/api/leave`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/leave/` | Authenticated (self) | Apply for leave. `type` must be `ANNUAL`, `CASUAL`, or `SICK`; `end_date` can't be before `start_date`. Status starts as `PENDING`. |
| GET | `/api/leave/me` | Authenticated (self) | List own leave requests, most recent first. |
| GET | `/api/leave/me/summary` | Authenticated (self) | Days taken by type (`sick_taken`, `casual_taken`, `annual_taken`) — counts `APPROVED` only. |
| GET | `/api/leave/` | Admin | List all leave requests, with the requesting employee's info embedded. Optional `status` and `employee_id` filters. |
| GET | `/api/leave/summary` | Admin | Org-wide days taken by type, `APPROVED` only. |
| PATCH | `/api/leave/{id}/review` | Admin | Approve or reject a `PENDING` request, with an optional comment. Returns `400` if the request was already reviewed. |

**Example — review a leave request:**
```bash
curl -X PATCH http://localhost:4000/api/leave/<leave_id>/review \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED", "comment": "Enjoy your time off"}'
```

---

## Not Yet Implemented

- `/api/payslips` — list, generate, view detail (frontend currently runs on dummy data)
- Overlapping leave date validation
- Configurable late-arrival cutoff (currently hardcoded at 9:15 AM in `routes/attendance.py`)
- Rate limiting / brute-force protection on `/api/auth/login`

## Security Notes

- Passwords are hashed with bcrypt directly (no passlib) — see `utils/security.py`.
- JWTs are signed with `JWT_SECRET_KEY` (HS256) and expire after `ACCESS_TOKEN_EXPIRE_MINUTES`.
- All timestamps are stored timezone-aware (`TIMESTAMPTZ` in Postgres).
- `.env` is gitignored — never commit real secrets. Use `.env.example` as a template for collaborators.