import pytest


@pytest.mark.asyncio
async def test_login_success(client, admin_user):
    response = await client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "adminpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "ADMIN"


async def test_login_wrong_password(client, admin_user):
    response = await client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


async def test_login_nonexistent_email(client):
    response = await client.post(
        "/api/auth/login",
        json={"email": "ghost@test.com", "password": "whatever123"},
    )
    assert response.status_code == 401


async def test_get_me_requires_token(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401


async def test_get_me_with_valid_token(client, admin_token):
    response = await client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "admin@test.com"