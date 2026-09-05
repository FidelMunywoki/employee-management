async def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Apply ----------

async def test_apply_for_leave(client, employee_token):
    response = await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={
            "type": "ANNUAL",
            "start_date": "2026-12-01",
            "end_date": "2026-12-05",
            "reason": "Family trip",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "PENDING"
    assert data["type"] == "ANNUAL"


async def test_apply_invalid_type_rejected(client, employee_token):
    response = await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={
            "type": "BEREAVEMENT",
            "start_date": "2026-12-01",
            "end_date": "2026-12-05",
            "reason": "N/A",
        },
    )
    assert response.status_code == 422


async def test_apply_end_before_start_rejected(client, employee_token):
    response = await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={
            "type": "SICK",
            "start_date": "2026-12-05",
            "end_date": "2026-12-01",
            "reason": "N/A",
        },
    )
    assert response.status_code == 422


# ---------- Self list / summary ----------

async def test_get_my_leave_requests(client, employee_token):
    await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "CASUAL", "start_date": "2026-11-01", "end_date": "2026-11-02", "reason": "Errand"},
    )

    response = await client.get("/api/leave/me", headers=await auth_headers(employee_token))
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_my_leave_summary_only_counts_approved(client, employee_token):
    await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "SICK", "start_date": "2026-11-01", "end_date": "2026-11-02", "reason": "Flu"},
    )

    response = await client.get("/api/leave/me/summary", headers=await auth_headers(employee_token))
    assert response.status_code == 200
    # Still PENDING, not yet approved — should not count toward "taken"
    assert response.json() == {"sick_taken": 0, "casual_taken": 0, "annual_taken": 0}


# ---------- Admin list / summary ----------

async def test_list_all_leave_requires_admin(client, employee_token):
    response = await client.get("/api/leave/", headers=await auth_headers(employee_token))
    assert response.status_code == 403


async def test_list_all_leave_as_admin_includes_employee_info(client, admin_token, employee_token, employee_user):
    await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "ANNUAL", "start_date": "2026-10-01", "end_date": "2026-10-03", "reason": "Trip"},
    )

    response = await client.get("/api/leave/", headers=await auth_headers(admin_token))
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["employee"]["id"] == employee_user.id
    assert data[0]["employee"]["first_name"] == "Jane"


async def test_list_leave_filter_by_status(client, admin_token, employee_token):
    await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "SICK", "start_date": "2026-09-01", "end_date": "2026-09-02", "reason": "Cold"},
    )

    response = await client.get("/api/leave/?status=PENDING", headers=await auth_headers(admin_token))
    assert response.status_code == 200
    assert all(l["status"] == "PENDING" for l in response.json())


async def test_org_leave_summary_requires_admin(client, employee_token):
    response = await client.get("/api/leave/summary", headers=await auth_headers(employee_token))
    assert response.status_code == 403


# ---------- Review ----------

async def test_admin_approve_leave(client, admin_token, employee_token):
    apply_resp = await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "CASUAL", "start_date": "2026-08-01", "end_date": "2026-08-02", "reason": "Personal"},
    )
    leave_id = apply_resp.json()["id"]

    response = await client.patch(
        f"/api/leave/{leave_id}/review",
        headers=await auth_headers(admin_token),
        json={"status": "APPROVED", "comment": "Enjoy your time off"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "APPROVED"
    assert data["admin_comment"] == "Enjoy your time off"


async def test_admin_reject_leave_without_comment(client, admin_token, employee_token):
    apply_resp = await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "SICK", "start_date": "2026-08-01", "end_date": "2026-08-02", "reason": "N/A"},
    )
    leave_id = apply_resp.json()["id"]

    response = await client.patch(
        f"/api/leave/{leave_id}/review",
        headers=await auth_headers(admin_token),
        json={"status": "REJECTED"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "REJECTED"
    assert response.json()["admin_comment"] is None


async def test_review_forbidden_for_non_admin(client, employee_token):
    apply_resp = await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "ANNUAL", "start_date": "2026-08-01", "end_date": "2026-08-02", "reason": "N/A"},
    )
    leave_id = apply_resp.json()["id"]

    response = await client.patch(
        f"/api/leave/{leave_id}/review",
        headers=await auth_headers(employee_token),
        json={"status": "APPROVED"},
    )
    assert response.status_code == 403


async def test_cannot_review_already_reviewed_leave(client, admin_token, employee_token):
    apply_resp = await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "CASUAL", "start_date": "2026-08-01", "end_date": "2026-08-02", "reason": "N/A"},
    )
    leave_id = apply_resp.json()["id"]

    first_review = await client.patch(
        f"/api/leave/{leave_id}/review",
        headers=await auth_headers(admin_token),
        json={"status": "APPROVED"},
    )
    assert first_review.status_code == 200

    second_review = await client.patch(
        f"/api/leave/{leave_id}/review",
        headers=await auth_headers(admin_token),
        json={"status": "REJECTED"},
    )
    assert second_review.status_code == 400


async def test_review_nonexistent_leave(client, admin_token):
    response = await client.patch(
        "/api/leave/does-not-exist/review",
        headers=await auth_headers(admin_token),
        json={"status": "APPROVED"},
    )
    assert response.status_code == 404


async def test_review_invalid_status_value(client, admin_token, employee_token):
    apply_resp = await client.post(
        "/api/leave/",
        headers=await auth_headers(employee_token),
        json={"type": "SICK", "start_date": "2026-08-01", "end_date": "2026-08-02", "reason": "N/A"},
    )
    leave_id = apply_resp.json()["id"]

    response = await client.patch(
        f"/api/leave/{leave_id}/review",
        headers=await auth_headers(admin_token),
        json={"status": "MAYBE"},
    )
    assert response.status_code == 422