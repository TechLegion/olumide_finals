import requests
import sys

API_BASE = "http://localhost:5011/api"

def main():
    print("Starting integration test...")

    # 1. Login Admin
    print("\n--- 1. Logging in as Admin ---")
    admin_login_payload = {
        "email": "admin@redeemers.edu.ng",
        "password": "Admin@123!"
    }
    r = requests.post(f"{API_BASE}/auth/login", json=admin_login_payload)
    if r.status_code != 200:
        print(f"FAIL: Admin login failed: {r.status_code} - {r.text}")
        sys.exit(1)
    admin_data = r.json()
    admin_token = admin_data["token"]
    print("SUCCESS: Admin logged in!")

    # 2. Register a Technician (via Admin)
    print("\n--- 2. Registering Technician (via Admin) ---")
    tech_payload = {
        "name": "Tech User",
        "email": "tech@redeemers.edu.ng",
        "password": "TechPassword123!",
        "role": 1, # UserRole.Technician
        "matricNumber": ""
    }
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.post(f"{API_BASE}/auth/register-staff", json=tech_payload, headers=headers)
    if r.status_code not in (200, 201):
        # Maybe already exists? Let's check text
        if "exists" in r.text.lower():
            print("SUCCESS: Technician already exists (from previous run).")
        else:
            print(f"FAIL: Tech registration failed: {r.status_code} - {r.text}")
            sys.exit(1)
    else:
        print("SUCCESS: Technician registered!")

    # 3. Register a Student
    print("\n--- 3. Registering Student ---")
    student_payload = {
        "name": "Student User",
        "email": "student@redeemers.edu.ng",
        "password": "StudentPassword123!",
        "matricNumber": "RUN/CMP/22/00001"
    }
    r = requests.post(f"{API_BASE}/auth/register", json=student_payload)
    if r.status_code not in (200, 201):
        if "exists" in r.text.lower():
            print("SUCCESS: Student already exists.")
        else:
            print(f"FAIL: Student registration failed: {r.status_code} - {r.text}")
            sys.exit(1)
    else:
        print("SUCCESS: Student registered!")

    # 4. Login Student
    print("\n--- 4. Logging in as Student ---")
    student_login_payload = {
        "email": "student@redeemers.edu.ng",
        "password": "StudentPassword123!"
    }
    r = requests.post(f"{API_BASE}/auth/login", json=student_login_payload)
    if r.status_code != 200:
        print(f"FAIL: Student login failed: {r.status_code} - {r.text}")
        sys.exit(1)
    student_data = r.json()
    student_token = student_data["token"]
    print("SUCCESS: Student logged in!")

    # 5. Get List of Technicians (verify list endpoint)
    print("\n--- 5. Fetching Technicians List as Admin ---")
    r = requests.get(f"{API_BASE}/auth/technicians", headers={"Authorization": f"Bearer {admin_token}"})
    if r.status_code != 200:
        print(f"FAIL: Fetching technicians failed: {r.status_code} - {r.text}")
        sys.exit(1)
    techs_list = r.json()
    print(f"SUCCESS: Technicians fetched: {techs_list}")
    
    # Get the ID of tech@redeemers.edu.ng
    tech_user_id = None
    for tech in techs_list:
        if tech["email"] == "tech@redeemers.edu.ng":
            tech_user_id = tech["userId"]
            break
    if not tech_user_id:
        print("FAIL: Could not find registered technician in list.")
        sys.exit(1)

    # 6. Create Ticket as Student
    print("\n--- 6. Creating Maintenance Ticket as Student ---")
    # For ticket creation, it accepts FromForm (multipart/form-data)
    # Let's send a dummy image if we can, or none since ImageUrl is optional/nullable in the model.
    # Wait, in the controller: request.Title, Description, RoomNumber are required. Hostel and Category are integers.
    form_data = {
        "title": "Leaking Pipe in Bathroom",
        "description": "The pipe in block A room 10 bathroom is leaking heavily.",
        "hostel": 0, # Adeboye Hall
        "roomNumber": "A10",
        "category": 0 # Plumbing
    }
    # Let's see if Image is optional or required in CreateTicketRequest DTO
    student_headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.post(f"{API_BASE}/tickets", data=form_data, headers=student_headers)
    if r.status_code not in (200, 201):
        print(f"FAIL: Ticket creation failed: {r.status_code} - {r.text}")
        sys.exit(1)
    ticket_data = r.json()
    ticket_id = ticket_data["ticketId"]
    print(f"SUCCESS: Ticket created with ID: {ticket_id}!")

    # 7. Assign Ticket to Technician as Admin
    print("\n--- 7. Assigning Ticket to Technician ---")
    assign_payload = {
        "technicianId": tech_user_id
    }
    r = requests.put(f"{API_BASE}/tickets/{ticket_id}/assign", json=assign_payload, headers=headers)
    if r.status_code != 200:
        print(f"FAIL: Ticket assignment failed: {r.status_code} - {r.text}")
        sys.exit(1)
    assigned_ticket = r.json()
    print(f"SUCCESS: Ticket assigned: {assigned_ticket}")

    # 8. Login Technician
    print("\n--- 8. Logging in as Technician ---")
    tech_login_payload = {
        "email": "tech@redeemers.edu.ng",
        "password": "TechPassword123!"
    }
    r = requests.post(f"{API_BASE}/auth/login", json=tech_login_payload)
    if r.status_code != 200:
        print(f"FAIL: Tech login failed: {r.status_code} - {r.text}")
        sys.exit(1)
    tech_data = r.json()
    tech_token = tech_data["token"]
    print("SUCCESS: Technician logged in!")

    # 9. Resolve Ticket as Technician
    print("\n--- 9. Resolving Ticket as Technician ---")
    resolve_payload = {
        "status": "Resolved"
    }
    tech_headers = {"Authorization": f"Bearer {tech_token}"}
    r = requests.patch(f"{API_BASE}/tickets/{ticket_id}/status", json=resolve_payload, headers=tech_headers)
    if r.status_code != 200:
        print(f"FAIL: Ticket resolution failed: {r.status_code} - {r.text}")
        sys.exit(1)
    resolved_ticket = r.json()
    print(f"SUCCESS: Ticket resolved: {resolved_ticket}")

    print("\n===============================")
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("===============================")

if __name__ == "__main__":
    main()
