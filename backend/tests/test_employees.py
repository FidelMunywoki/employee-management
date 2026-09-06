async def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- List ----------

async def test_list_employees_requires_admin(client, employee_token):
    response = await client.get("/api/employees/", headers=await auth_headers(employee_token))
    assert response.status_code == 403


async def test_list_employees_as_admin(client, admin_token, employee_user):
    response = await client.get("/api/employees/", headers=await auth_headers(admin_token))
    assert response.status_code == 200
    emails = [e["email"] for e in response.json()]
    assert "jane@test.com" in emails


async def test_list_employees_search_filter(client, admin_token, employee_user):
    response = await client.get(
        "/api/employees/?search=jane", headers=await auth_headers(admin_token)
    )
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["email"] == "jane@test.com"


# ---------- Create ----------

async def test_create_employee_as_admin(client, admin_token):
    response = await client.post(
        "/api/employees/",
        headers=await auth_headers(admin_token),
        json={
            "first_name": "New",
            "last_name": "Hire",
            "email": "newhire@test.com",
            "password": "temppass123",
            "department": "Sales",
            "position": "Sales Rep",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newhire@test.com"
    assert "password" not in data
    assert "hashed_password" not in data


async def test_create_employee_forbidden_for_non_admin(client, employee_token):
    response = await client.post(
        "/api/employees/",
        headers=await auth_headers(employee_token),
        json={
            "first_name": "New",
            "last_name": "Hire",
            "email": "shouldfail@test.com",
            "password": "temppass123",
            "department": "Sales",
            "position": "Sales Rep",
        },
    )
    assert response.status_code == 403


async def test_create_employee_duplicate_email(client, admin_token, employee_user):
    response = await client.post(
        "/api/employees/",
        headers=await auth_headers(admin_token),
        json={
            "first_name": "Duplicate",
            "last_name": "Person",
            "email": "jane@test.com",  # already exists via employee_user fixture
            "password": "temppass123",
            "department": "Sales",
            "position": "Sales Rep",
        },
    )
    assert response.status_code == 409


# ---------- Get single ----------

async def test_get_own_profile(client, employee_token, employee_user):
    response = await client.get(
        f"/api/employees/{employee_user.id}", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 200


async def test_get_other_profile_forbidden(client, employee_token, admin_user):
    response = await client.get(
        f"/api/employees/{admin_user.id}", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 403


async def test_get_nonexistent_employee(client, admin_token):
    response = await client.get(
        "/api/employees/does-not-exist", headers=await auth_headers(admin_token)
    )
    assert response.status_code == 404


# ---------- Update (self) ----------

async def test_update_own_bio(client, employee_token):
    response = await client.patch(
        "/api/employees/me",
        headers=await auth_headers(employee_token),
        json={"bio": "Updated bio"},
    )
    assert response.status_code == 200
    assert response.json()["bio"] == "Updated bio"


async def test_self_update_cannot_change_name_or_phone(client, employee_token, employee_user):
    response = await client.patch(
        "/api/employees/me",
        headers=await auth_headers(employee_token),
        json={"first_name": "Hacked", "last_name": "Name", "phone": "555-0000", "bio": "Legit bio"},
    )
    assert response.status_code == 200
    data = response.json()
    # Extra fields are silently dropped by the narrowed schema — only bio applies
    assert data["bio"] == "Legit bio"
    assert data["first_name"] == employee_user.first_name
    assert data["last_name"] == employee_user.last_name
    assert data["phone"] == employee_user.phone


async def test_self_update_cannot_change_salary(client, employee_token):
    # EmployeeUpdateSelf schema has no basic_salary field at all, so extra
    # fields are silently ignored by Pydantic rather than raising — this
    # test documents that expectation.
    response = await client.patch(
        "/api/employees/me",
        headers=await auth_headers(employee_token),
        json={"basic_salary": 999999},
    )
    assert response.status_code == 200
    assert response.json()["basic_salary"] != 999999


# ---------- Update (admin) ----------

async def test_admin_update_employee(client, admin_token, employee_user):
    response = await client.patch(
        f"/api/employees/{employee_user.id}",
        headers=await auth_headers(admin_token),
        json={"position": "Senior Marketing Associate", "employment_status": "INACTIVE"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["position"] == "Senior Marketing Associate"
    assert data["employment_status"] == "INACTIVE"


async def test_admin_update_forbidden_for_employee(client, employee_token, admin_user):
    response = await client.patch(
        f"/api/employees/{admin_user.id}",
        headers=await auth_headers(employee_token),
        json={"position": "Hacked Title"},
    )
    assert response.status_code == 403


# ---------- Delete ----------

async def test_admin_delete_employee(client, admin_token, employee_user):
    response = await client.delete(
        f"/api/employees/{employee_user.id}", headers=await auth_headers(admin_token)
    )
    assert response.status_code == 204

    # Soft-deleted employee should no longer appear in a lookup
    follow_up = await client.get(
        f"/api/employees/{employee_user.id}", headers=await auth_headers(admin_token)
    )
    assert follow_up.status_code == 404


async def test_admin_cannot_delete_own_account(client, admin_token, admin_user):
    response = await client.delete(
        f"/api/employees/{admin_user.id}", headers=await auth_headers(admin_token)
    )
    assert response.status_code == 400


async def test_delete_forbidden_for_non_admin(client, employee_token, admin_user):
    response = await client.delete(
        f"/api/employees/{admin_user.id}", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 403


# ---------- Change password ----------

async def test_change_own_password(client, employee_token):
    response = await client.post(
        "/api/employees/change-password",
        headers=await auth_headers(employee_token),
        json={"current_password": "janepass123", "new_password": "newpass456"},
    )
    assert response.status_code == 204


async def test_change_password_wrong_current(client, employee_token):
    response = await client.post(
        "/api/employees/change-password",
        headers=await auth_headers(employee_token),
        json={"current_password": "wrongpass", "new_password": "newpass456"},
    )
    assert response.status_code == 401


async def test_change_password_too_short(client, employee_token):
    response = await client.post(
        "/api/employees/change-password",
        headers=await auth_headers(employee_token),
        json={"current_password": "janepass123", "new_password": "short"},
    )
    assert response.status_code == 422