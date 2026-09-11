# Employee Management System

Full-stack Employee Management System (EMS): a React/Vite frontend and a FastAPI + PostgreSQL backend, fully containerized with Docker Compose. Supports two roles — **ADMIN** and **EMPLOYEE** — with JWT authentication, role-based access control, and a full backend test suite.

## Tech Stack

**Backend**
- FastAPI, PostgreSQL (SQLAlchemy async + asyncpg), Alembic (manual migrations)
- JWT auth (python-jose) + bcrypt password hashing
- pytest, pytest-asyncio, httpx

**Frontend**
- React + Vite, React Router v6, Tailwind CSS v4
- Context-based auth (`AuthContext` / `useAuth`)
- Plain `fetch` wrapper (`src/api/client.js`) — no axios

**Infra**
- Docker Compose — three services: `db` (PostgreSQL), `backend` (FastAPI), `frontend` (Vite dev server)

---

## Project Structure

```
employee-management/
├── docker-compose.yml
├── .env                     # Compose-level secrets (Postgres creds) — gitignored
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── .env                 # gitignored
│   ├── .env.example
│   ├── main.py
│   ├── config/database.py
│   ├── models/               # employee, leave, payslip, attendance, settings
│   ├── schemas/               # Pydantic request/response models
│   ├── routes/                # auth, employees, attendance, leave, payslips, settings
│   ├── dependencies/auth.py   # get_current_employee, require_admin
│   ├── utils/security.py      # bcrypt hashing, JWT create/decode
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
└── frontend/
    ├── Dockerfile
    ├── .env                  # gitignored
    ├── .env.example
    └── src/
        ├── api/client.js            # fetch wrapper
        ├── context/
        │   ├── authContext.js       # plain context object
        │   ├── AuthContext.jsx      # AuthProvider
        │   └── useAuth.js           # hook
        ├── components/
        │   ├── ProtectedRoute.jsx   # requires a valid token
        │   ├── AdminRoute.jsx       # requires isAdmin, nested inside ProtectedRoute
        │   ├── LoginForm.jsx
        │   ├── Sidebar.jsx
        │   └── ... (Employee*, Attendance*, Leave*, Payslip*, Settings* components)
        └── pages/
            ├── Dashboard.jsx, Employee.jsx, Attendance.jsx,
            │   Leave.jsx, Payslips.jsx, Settings.jsx, PrintPayslip.jsx
            └── App.jsx
```

---

## Setup

There are **three separate env files**, each covering a different layer:

| File | Used by | Purpose |
|---|---|---|
| `./.env` (project root) | `docker-compose.yml` directly | Postgres credentials shared across `db` and `backend` |
| `backend/.env` | `backend/main.py` / `config/database.py` | Only read if you ever run the backend **outside** Docker (e.g. `python main.py` locally). Compose's `environment:` block always overrides this when running via `docker compose up`. |
| `frontend/.env` | Vite | `VITE_API_URL` — where the browser sends API requests |

### 1. Create the root `.env` (for Docker Compose)

```bash
cp .env.example .env
```

`.env.example`:
```env
POSTGRES_USER=ems_user
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=employee_management
```

Compose automatically loads a file literally named `.env` sitting next to `docker-compose.yml` — no `env_file:` directive needed. Every `${POSTGRES_USER}`-style reference in `docker-compose.yml` gets substituted from this file at `docker compose up` time. Verify the substitution landed correctly:
```bash
docker compose config
```

### 2. Create `backend/.env`

```bash
cp backend/.env.example backend/.env
```

`backend/.env.example`:
```env
PORT=4000
DATABASE_URL=postgresql+asyncpg://ems_user:yourpassword@db:5432/employee_management
TEST_DATABASE_URL=postgresql+asyncpg://ems_user:yourpassword@db:5432/employee_management_test
JWT_SECRET_KEY=changeme-generate-a-real-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Generate a real secret rather than using the placeholder:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Note: when running through Docker Compose, `DATABASE_URL` here is actually superseded by the `environment:` block in `docker-compose.yml` (built from the root `.env`'s Postgres values). Keep both files' credentials in sync manually, since they're two separate mechanisms pointing at the same database.

### 3. Create `frontend/.env`

```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env.example`:
```env
VITE_API_URL=http://localhost:4000/api
```

This must stay `localhost`, not a Docker service name like `backend` — it's baked into JS that runs in your **browser**, on your host machine, which has no knowledge of Docker's internal network. `localhost:4000` works because the backend's port is published to the host via `docker-compose.yml`'s `ports:` mapping.

### 4. Bring the whole stack up

```bash
docker compose up --build
```

This starts:
- `db` — PostgreSQL 16, persistent `pgdata` volume
- `backend` — FastAPI on port `4000`, source-mounted for live reload
- `frontend` — Vite dev server on port `5173`, source-mounted for hot reload (with a separate `frontend_node_modules` volume so the container's installed packages aren't clobbered by the host bind mount)

### 5. Apply migrations

```bash
docker compose exec backend alembic upgrade head
```

### 6. Seed an admin account

There's no public signup route — admins create all employee accounts. Bootstrap the first admin with a one-off seed script (see `seed_admin.py` pattern used during development), inserting directly via SQLAlchemy with a bcrypt-hashed password.

### 7. Verify

```bash
curl http://localhost:4000
# {"message":"Welcome to the Employee Management System API"}
```
- Backend interactive docs: `http://localhost:4000/docs`
- Frontend: open `http://localhost:5173`, log in with your seeded admin

---

## Running Backend Tests

```bash
docker compose exec db psql -U ems_user -d postgres -c "CREATE DATABASE employee_management_test;"  # one-time
docker compose exec backend pytest -v
docker compose exec backend pytest tests/test_attendance.py -v   # one file
docker compose exec backend pytest -v -k "leave"                 # by keyword
```

Tests run against a separate database, isolated per-test via a rollback transaction pattern (`NullPool` + `join_transaction_mode="create_savepoint"` to avoid asyncpg event-loop/connection conflicts).

## Database Migrations

Managed manually with Alembic — no auto-run on startup.

```bash
docker compose exec backend alembic revision --autogenerate -m "describe the change"
# review the generated file in alembic/versions/
docker compose exec backend alembic upgrade head
```

---

## Backend Authentication

All endpoints except `GET /` and `POST /api/auth/login` require:
```
Authorization: Bearer <token>
```

Tokens encode the employee's `id` (`sub`) and `role`. Two dependency-based access levels:
- **Authenticated** (`get_current_employee`) — any valid, active employee
- **Admin** (`require_admin`) — role must be `ADMIN`

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Log in with email + password. Returns `access_token`, `token_type`, `role`. |
| GET | `/api/auth/me` | Authenticated | Get the current logged-in employee's profile. |

### Employees — `/api/employees`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/employees/` | Admin | List and search all employees. Query params: `search`, `department`. |
| GET | `/api/employees/{id}` | Self or Admin | Get one employee's profile. |
| POST | `/api/employees/` | Admin | Create a new employee (hashes password, rejects duplicate email). |
| PATCH | `/api/employees/me` | Self | Update own **bio only**. |
| PATCH | `/api/employees/{id}` | Admin | Full profile edit — name, email, position, bio, department, salary, status, role. |
| DELETE | `/api/employees/{id}` | Admin | Soft delete. Admins can't delete their own account. |
| POST | `/api/employees/change-password` | Authenticated (self) | Requires current password, min 8 chars. |

**Permission model:** Admin can view/search everyone and update any employee's name, email, position, bio (plus department/salary/status/role). Employee can only update their own bio and change their own password.

### Attendance — `/api/attendance`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/attendance/clock-in` | Authenticated (self) | `409` if already clocked in today (app check + DB unique constraint). Marked `LATE` per the configured cutoff (Settings). |
| POST | `/api/attendance/clock-out` | Authenticated (self) | Computes `working_hours` and `day_type`. |
| GET | `/api/attendance/me` | Authenticated (self) | Own history, most recent first. |
| GET | `/api/attendance/me/summary` | Authenticated (self) | `days_present`, `late_arrivals`, `avg_work_hours`. |
| GET | `/api/attendance/` | Admin | All records, with embedded employee info. Optional `employee_id` filter. |

### Leave — `/api/leave`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/leave/` | Authenticated (self) | Apply for leave (`ANNUAL`/`CASUAL`/`SICK`). Status starts `PENDING`. |
| GET | `/api/leave/me` | Authenticated (self) | Own requests. |
| GET | `/api/leave/me/summary` | Authenticated (self) | Days taken by type, `APPROVED` only. |
| GET | `/api/leave/` | Admin | All requests with employee info embedded. Optional `status`, `employee_id` filters. |
| GET | `/api/leave/summary` | Admin | Org-wide days taken by type. |
| PATCH | `/api/leave/{id}/review` | Admin | Approve/reject a `PENDING` request with optional comment. `400` if already reviewed. |

### Payslips — `/api/payslips`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payslips/` | Admin | Generate a payslip. `basic_salary` pulled from the employee's current profile. `409` on duplicate employee/month/year. |
| GET | `/api/payslips/me` | Authenticated (self) | Own payslips. |
| GET | `/api/payslips/{id}` | Self or Admin | Full breakdown. Employees can only view their own. |
| GET | `/api/payslips/` | Admin | All payslips. Optional `employee_id`, `month`, `year` filters. |

### Settings — `/api/settings`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/settings/` | Authenticated | Read org config (late-arrival cutoff, leave day allowances). |
| PATCH | `/api/settings/` | Admin | Update any subset of settings. Tracks `updated_by`/`updated_at`. |

---

## Frontend Integration

### Auth flow

- `src/context/authContext.js` — plain `createContext(null)`
- `src/context/AuthContext.jsx` — `AuthProvider`: holds `token`/`user` state, persists the JWT to `localStorage` (`ems_token`), exposes `login()`, `logout()`, and derives `isAdmin` from `user.role === "ADMIN"`. On mount, if a token exists it calls `GET /api/auth/me` to restore the session; an invalid/expired token is cleared automatically.
- `src/context/useAuth.js` — `useContext(AuthContext)` hook, throws if used outside the provider.
- `src/api/client.js` — thin `fetch` wrapper (`api.get/post/patch/delete`) that attaches `Authorization: Bearer <token>` and surfaces backend error messages (`detail`) as thrown `Error`s.

### Route guards

- `ProtectedRoute.jsx` — wraps the whole `Layout` route tree; redirects to `/login` if there's no token.
- `AdminRoute.jsx` — nested inside `ProtectedRoute` around `/employee`; redirects a logged-in non-admin to `/dashboard` (not `/login`, since their session is valid — they just lack permission).
- Login is a single unified page (`/login`) — there's no separate admin/employee portal picker. Whoever logs in is routed by their **real** JWT role, not by which "portal" they used.

### Backend ↔ frontend field mapping

The backend returns snake_case (`first_name`, `basic_salary`, `employment_status`). The frontend's existing presentational components (`EmployeeCard`, `LeaveTable`, `PayslipCard`, etc.) were already built around camelCase + `_id`. Rather than rewrite those components, each page defines a small `fromApi()` mapper at the top of the file that translates one direction, right after the fetch — so the mapping boundary is centralized per-page and the presentational components stay backend-agnostic.

### Pages wired to real endpoints

All of the following now call the backend instead of `dummy*Data` from `assets.jsx`, and read `isAdmin` from `useAuth()` instead of a hardcoded constant:

- **Dashboard** — admin stats computed client-side from `/employees/`, `/attendance/`, `/leave/?status=PENDING`; employee stats from `/attendance/me`, `/leave/me`, `/payslips/me`.
- **Employee** (admin-only, gated by `AdminRoute`) — full CRUD against `/employees/`.
- **Attendance** — separate `EmployeeAttendance` (self clock-in/out, derived from real data so it survives a refresh) and `AdminAttendance` (org-wide table, no clock button) components, routed by role.
- **Leave** — separate `EmployeeLeave` (apply, view own) and `AdminLeave` (review/approve/reject) components.
- **Payslips** — separate `EmployeePayslips` (view own) and `AdminPayslips` (generate, view all) components.
- **Settings** — separate `EmployeeSettings` (bio + own password) and `AdminSettings` (search/edit any employee's public profile, in-place list update after save, + own password) components.
- **PrintPayslip** — fetches by ID via `GET /api/payslips/{id}`; sits outside the `Layout`/sidebar route tree but has its own manual auth check (redirects to `/login` if no token once auth finishes loading).

---

## Not Yet Implemented

- Leave allowance enforcement — `/api/leave` doesn't reject an application that would exceed the configured `*_leave_days` limits; those settings are informational only for now
- Overlapping leave date validation
- Rate limiting / brute-force protection on `/api/auth/login`
- Admin-initiated password reset (only self-service change-password exists; the admin Edit Employee modal's password field was removed pending this)
- Server-side search/filter on the Employee list page (currently fetches all employees and filters client-side)
- Dashboard and Attendance admin stats are computed client-side from full record lists rather than via a dedicated aggregate endpoint — fine at current scale, worth revisiting if employee count grows large
- Production-style frontend build (current `frontend/Dockerfile` runs the Vite **dev server** — hot-reload, unminified — not a static build served via nginx)

## Security Notes

- Passwords hashed with bcrypt directly (no passlib) — see `backend/utils/security.py`.
- JWTs signed with `JWT_SECRET_KEY` (HS256), expire after `ACCESS_TOKEN_EXPIRE_MINUTES`.
- All timestamps stored timezone-aware (`TIMESTAMPTZ` in Postgres).
- All three `.env` files (root, `backend/`, `frontend/`) are gitignored — never commit real secrets. Use the corresponding `.env.example` files as templates.
- JWT is stored in `localStorage` on the frontend — acceptable for this project's scope; be aware this is more XSS-exposed than an httpOnly cookie would be if this ever handles more sensitive data.