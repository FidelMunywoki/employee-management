async def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Generate ----------

async def test_generate_payslip_as_admin(client, admin_token, employee_user):
    response = await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": employee_user.id, "month": 3, "year": 2026, "allowances": 200, "deductions": 20},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["basic_salary"] == employee_user.basic_salary
    assert data["net_salary"] == employee_user.basic_salary + 200 - 20
    assert data["employee"]["id"] == employee_user.id


async def test_generate_payslip_forbidden_for_non_admin(client, employee_token, employee_user):
    response = await client.post(
        "/api/payslips/",
        headers=await auth_headers(employee_token),
        json={"employee_id": employee_user.id, "month": 3, "year": 2026},
    )
    assert response.status_code == 403


async def test_generate_payslip_nonexistent_employee(client, admin_token):
    response = await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": "does-not-exist", "month": 3, "year": 2026},
    )
    assert response.status_code == 404


async def test_generate_duplicate_payslip_same_period_rejected(client, admin_token, employee_user):
    first = await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": employee_user.id, "month": 4, "year": 2026},
    )
    assert first.status_code == 201

    second = await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": employee_user.id, "month": 4, "year": 2026},
    )
    assert second.status_code == 409


async def test_generate_payslip_invalid_month_rejected(client, admin_token, employee_user):
    response = await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": employee_user.id, "month": 13, "year": 2026},
    )
    assert response.status_code == 422


# ---------- Self view ----------

async def test_get_my_payslips(client, admin_token, employee_token, employee_user):
    await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": employee_user.id, "month": 5, "year": 2026},
    )

    response = await client.get("/api/payslips/me", headers=await auth_headers(employee_token))
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_get_own_payslip_detail(client, admin_token, employee_token, employee_user):
    create_resp = await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": employee_user.id, "month": 6, "year": 2026},
    )
    payslip_id = create_resp.json()["id"]

    response = await client.get(
        f"/api/payslips/{payslip_id}", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 200


async def test_get_other_employees_payslip_forbidden(client, admin_token, employee_token, admin_user):
    create_resp = await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": admin_user.id, "month": 6, "year": 2026},
    )
    payslip_id = create_resp.json()["id"]

    response = await client.get(
        f"/api/payslips/{payslip_id}", headers=await auth_headers(employee_token)
    )
    assert response.status_code == 403


async def test_get_nonexistent_payslip(client, admin_token):
    response = await client.get(
        "/api/payslips/does-not-exist", headers=await auth_headers(admin_token)
    )
    assert response.status_code == 404


# ---------- Admin list ----------

async def test_list_all_payslips_requires_admin(client, employee_token):
    response = await client.get("/api/payslips/", headers=await auth_headers(employee_token))
    assert response.status_code == 403


async def test_list_all_payslips_as_admin(client, admin_token, employee_user):
    await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": employee_user.id, "month": 7, "year": 2026},
    )

    response = await client.get("/api/payslips/", headers=await auth_headers(admin_token))
    assert response.status_code == 200
    assert len(response.json()) >= 1


async def test_list_payslips_filter_by_month_year(client, admin_token, employee_user):
    await client.post(
        "/api/payslips/",
        headers=await auth_headers(admin_token),
        json={"employee_id": employee_user.id, "month": 8, "year": 2026},
    )

    response = await client.get(
        "/api/payslips/?month=8&year=2026", headers=await auth_headers(admin_token)
    )
    assert response.status_code == 200
    assert all(p["month"] == 8 and p["year"] == 2026 for p in response.json())