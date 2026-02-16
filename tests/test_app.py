import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_and_unregister():
    test_email = "pytestuser@mergington.edu"
    activity = "Chess Club"
    # Ensure not already registered
    client.post(f"/activities/{activity}/unregister", json={"email": test_email})
    # Sign up
    response = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert response.status_code == 200
    # Duplicate signup should fail
    response_dup = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert response_dup.status_code == 400
    # Unregister
    response_unreg = client.post(f"/activities/{activity}/unregister", json={"email": test_email})
    assert response_unreg.status_code == 200
    # Unregister again should fail
    response_unreg2 = client.post(f"/activities/{activity}/unregister", json={"email": test_email})
    assert response_unreg2.status_code == 404
