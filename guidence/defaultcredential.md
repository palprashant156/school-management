curl -X POST http://localhost:4000/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password123", "email": "admin@example.com", "firstName": "Admin", "lastName": "User"}'