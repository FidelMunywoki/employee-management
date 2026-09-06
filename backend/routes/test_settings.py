async def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


async def test_get_settings_returns_defaults(client, employee_token):
    response = await client.get("/api/settings/", headers=await auth_headers(employee_token))
    assert response.status_code == 200
    data = response.json()
    assert data["late_cutoff_hour"] == 9
    assert data["late_cutoff_minute"] == 15
    assert data["annual_leave_days"] == 21


async def test_get_settings_readable_by_any_authenticated_user(client, admin_token, employee_token):
    admin_resp = await client.get("/api/settings/", headers=await auth_headers(admin_token))
    employee_resp = await client.get("/api/settings/", headers=await auth_headers(employee_token))
    assert admin_resp.status_code == 200
    assert employee_resp.status_code == 200


async def test_update_settings_requires_admin(client, employee_token):
    response = await client.patch(
        "/api/settings/",
        headers=await auth_headers(employee_token),
        json={"late_cutoff_hour": 10},
    )
    assert response.status_code == 403


async def test_admin_update_settings(client, admin_token, admin_user):
    response = await client.patch(
        "/api/settings/",
        headers=await auth_headers(admin_token),
        json={"late_cutoff_hour": 10, "late_cutoff_minute": 30, "annual_leave_days": 25},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["late_cutoff_hour"] == 10
    assert data["late_cutoff_minute"] == 30
    assert data["annual_leave_days"] == 25
    assert data["updated_by"] == admin_user.id


async def test_update_settings_partial_leaves_other_fields_unchanged(client, admin_token):
    first = await client.patch(
        "/api/settings/", headers=await auth_headers(admin_token), json={"sick_leave_days": 10}
    )
    assert first.json()["sick_leave_days"] == 10
    original_annual = first.json()["annual_leave_days"]

    second = await client.patch(
        "/api/settings/", headers=await auth_headers(admin_token), json={"casual_leave_days": 5}
    )
    assert second.status_code == 200
    assert second.json()["sick_leave_days"] == 10  # untouched by the second PATCH
    assert second.json()["annual_leave_days"] == original_annual


async def test_invalid_cutoff_hour_rejected(client, admin_token):
    response = await client.patch(
        "/api/settings/", headers=await auth_headers(admin_token), json={"late_cutoff_hour": 25}
    )
    assert response.status_code == 422


async def test_negative_leave_days_rejected(client, admin_token):
    response = await client.patch(
        "/api/settings/", headers=await auth_headers(admin_token), json={"annual_leave_days": -5}
    )
    assert response.status_code == 422