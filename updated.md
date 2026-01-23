Before you begin, make sure you have completed the following steps from the previous guide:

   1. The backend application is running.
   2. Postman is set up with a collection and an environment.
   3. You have created an admin user and have the admin's ACCESS_TOKEN.

  1. Create Teacher and Student Users

  To test the different access levels, you will need users with teacher and student roles. Use the admin's ACCESS_TOKEN to create these users.

  Create a Teacher User

   1. Request:
       * Method: POST
       * URL: {{API_URL}}/users
       * Authorization: Bearer {{ACCESS_TOKEN}} (admin's token)
       * Body: (raw, JSON)

   1         {
   2             "username": "teacher",
   3             "email": "teacher@example.com",
   4             "password": "password",
   5             "firstName": "Teacher",
   6             "lastName": "User",
   7             "role": "teacher"
   8         }
   2. Response: You should get a 201 Created response. Note down the id of the created user from the response body.

  Create a Student User

   1. Request:
       * Method: POST
       * URL: {{API_URL}}/users
       * Authorization: Bearer {{ACCESS_TOKEN}} (admin's token)
       * Body: (raw, JSON)

   1         {
   2             "username": "student",
   3             "email": "student@example.com",
   4             "password": "password",
   5             "firstName": "Student",
   6             "lastName": "User",
   7             "role": "student"
   8         }
   2. Response: You should get a 201 Created response. Note down the id of the created user.

  2. Log In and Get Access Tokens

  Now, log in as the newly created teacher and student to get their access tokens.

  Log In as Teacher

   1. Request:
       * Method: POST
       * URL: {{API_URL}}/auth/login
       * Body: (raw, JSON)
   1         {
   2             "username": "teacher",
   3             "password": "password"
   4         }
   2. Tests Script: In the "Tests" tab of the Postman request, add the following script to save the teacher's access token:

   1     const response = pm.response.json();
   2     pm.environment.set('TEACHER_ACCESS_TOKEN', response.access_token);
   3. Send the request. The teacher's access token will be saved to the TEACHER_ACCESS_TOKEN environment variable.

  Log In as Student

   1. Request:
       * Method: POST
       * URL: {{API_URL}}/auth/login
       * Body: (raw, JSON)
   1         {
   2             "username": "student",
   3             "password": "password"
   4         }
   2. Tests Script: In the "Tests" tab, add the following script:
   1     const response = pm.response.json();
   2     pm.environment.set('STUDENT_ACCESS_TOKEN', response.access_token);
   3. Send the request. The student's access token will be saved to the STUDENT_ACCESS_TOKEN environment variable.

  You now have three access tokens: ACCESS_TOKEN (admin), TEACHER_ACCESS_TOKEN, and STUDENT_ACCESS_TOKEN.

  3. Testing the School Management API Endpoints

  Now you can test the school controller endpoints with the different roles.

  Classes

   * Create a Class (Admin or Teacher)
       * Method: POST
       * URL: {{API_URL}}/school/classes
       * Authorization: Bearer {{ACCESS_TOKEN}} or {{TEACHER_ACCESS_TOKEN}}
       * Body: (raw, JSON)
   1         {
   2             "class_name": "Class 10",
   3             "section": "A"
   4         }
       * Expected Response: 201 Created. Note down the id of the created class.
       * Test with Student: Try this request with the STUDENT_ACCESS_TOKEN. You should get a 403 Forbidden error.

   * Get All Classes (Admin, Teacher, or Student)
       * Method: GET
       * URL: {{API_URL}}/school/classes
       * Authorization: Bearer {{ACCESS_TOKEN}}, {{TEACHER_ACCESS_TOKEN}}, or {{STUDENT_ACCESS_TOKEN}}
       * Expected Response: 200 OK with a list of all classes.

  Students

   * Create a Student (Admin or Teacher)
       * You need the id of the student user and the id of the class you created.
       * Method: POST
       * URL: {{API_URL}}/school/students
       * Authorization: Bearer {{ACCESS_TOKEN}} or {{TEACHER_ACCESS_TOKEN}}
       * Body: (raw, JSON)

   1         {
   2             "roll_no": "101",
   3             "user": { "id": "student-user-id" },
   4             "class": { "id": "class-id" }
   5         }
       * Expected Response: 201 Created.
       * Test with Student: Try with STUDENT_ACCESS_TOKEN. Expect 403 Forbidden.

   * Get All Students (Admin or Teacher)
       * Method: GET
       * URL: {{API_URL}}/school/students
       * Authorization: Bearer {{ACCESS_TOKEN}} or {{TEACHER_ACCESS_TOKEN}}
       * Expected Response: 200 OK with a list of students.
       * Test with Student: Try with STUDENT_ACCESS_TOKEN. Expect 403 Forbidden.

  Teachers

   * Create a Teacher (Admin only)
       * You need the id of the teacher user you created.
       * Method: POST
       * URL: {{API_URL}}/school/teachers
       * Authorization: Bearer {{ACCESS_TOKEN}}
       * Body: (raw, JSON)

   1         {
   2             "subject": "Physics",
   3             "user": { "id": "teacher-user-id" }
   4         }
       * Expected Response: 201 Created.
       * Test with Teacher/Student: Try with TEACHER_ACCESS_TOKEN or STUDENT_ACCESS_TOKEN. Expect 403 Forbidden.

   * Get All Teachers (Admin or Teacher)
       * Method: GET
       * URL: {{API_URL}}/school/teachers
       * Authorization: Bearer {{ACCESS_TOKEN}} or {{TEACHER_ACCESS_TOKEN}}
       * Expected Response: 200 OK with a list of teachers.
       * Test with Student: Try with STUDENT_ACCESS_TOKEN. Expect 403 Forbidden.

  Attendance and Marks

  Follow a similar pattern for testing the attendance and marks endpoints, using the appropriate access tokens for each role as defined in your controller.

  By following these steps, you can thoroughly test the role-based access control for your school management features.

> guide me how to do this as well  Follow a similar pattern for testing the attendance and marks endpoints, using the appropriate access tokens for each
  role as defined in your controller.

    By following these steps, you can thoroughly test the role-based access control for your school management features.

✦ Of course. Here is the detailed guide for testing the attendance and marks endpoints with different user roles in Postman.

  4. Testing Attendance and Marks Endpoints

  You will need the access tokens for your admin, teacher, and student users (ACCESS_TOKEN, TEACHER_ACCESS_TOKEN, STUDENT_ACCESS_TOKEN) and the ID of the
  student you created earlier.

  Attendance

  Based on your controller, creating attendance is restricted to admins and teachers, while viewing attendance is open to all three roles.

   * Create Attendance Record (Admin or Teacher)
       1. Request:
           * Method: POST
           * URL: {{API_URL}}/school/attendance
           * Authorization: Use the Bearer Token for an admin ({{ACCESS_TOKEN}}) or a teacher ({{TEACHER_ACCESS_TOKEN}}).
           * Body: (raw, JSON). Replace "student-id" with the actual ID of the student you created.

   1             {
   2                 "attendance_date": "2026-01-21",
   3                 "status": "Present",
   4                 "student": { "id": "student-id" }
   5             }
       2. Expected Response: 201 Created. This confirms that admins and teachers can create attendance records.
       3. Test with Student (Forbidden):
           * Duplicate the request above.
           * Change the Authorization to use the student's Bearer Token ({{STUDENT_ACCESS_TOKEN}}).
           * Send the request. You should receive a 403 Forbidden error, confirming that students cannot mark attendance.

   * Get All Attendance Records (Admin, Teacher, or Student)
       1. Request:
           * Method: GET
           * URL: {{API_URL}}/school/attendance
           * Authorization: Use the Bearer Token for an admin, teacher, or student.
       2. Expected Response: 200 OK with a list of all attendance records in the response body.
       3. Verification: Test this endpoint with each of the three access tokens (ACCESS_TOKEN, TEACHER_ACCESS_TOKEN, and STUDENT_ACCESS_TOKEN) to ensure all
          three roles can successfully view the data.

  Marks

  Similarly, creating marks is restricted to admins and teachers, while viewing them is allowed for all roles.

   * Create a Mark Record (Admin or Teacher)
       1. Request:
           * Method: POST
           * URL: {{API_URL}}/school/marks
           * Authorization: Use the Bearer Token for an admin ({{ACCESS_TOKEN}}) or a teacher ({{TEACHER_ACCESS_TOKEN}}).
           * Body: (raw, JSON). Replace "student-id" with the student's actual ID.
   1             {
   2                 "subject": "Physics",
   3                 "marks": 95,
   4                 "student": { "id": "student-id" }
   5             }
       2. Expected Response: 201 Created. This confirms that admins and teachers can assign marks.
       3. Test with Student (Forbidden):
           * Duplicate the request.
           * Change the Authorization to use the student's Bearer Token ({{STUDENT_ACCESS_TOKEN}}).
           * Send the request. You should receive a 403 Forbidden error.

   * Get All Mark Records (Admin, Teacher, or Student)
       1. Request:
           * Method: GET
           * URL: {{API_URL}}/school/marks
           * Authorization: Use the Bearer Token for an admin, teacher, or student.
       2. Expected Response: 200 OK with a list of all mark records.
       3. Verification: Test this endpoint with all three access tokens to confirm that each role can view the marks.

  By following these steps, you can be confident that the role-based access control for your attendance and marks features is implemented correctly and
  securely.





  App

   * GET /

  Auth

   * POST /auth/login
   * POST /auth/register
   * POST /auth/logout (Requires token)
   * POST /auth/refresh (Requires refresh token)
   * GET /auth/profile (Requires token)

  Users

   * POST /users (Requires 'admin' role)
   * GET /users (Requires 'admin' role)
   * GET /users/profile (Requires 'admin' or 'user' role)
   * GET /users/:id (Requires 'admin' role)
   * PATCH /users/:id (Requires 'admin' role)
   * DELETE /users/:id (Requires 'admin' role)

  Roles

   * POST /roles (Requires 'admin' role)
   * GET /roles (Requires 'admin' role)
   * GET /roles/:id (Requires 'admin' role)
   * PUT /roles/:id (Requires 'admin' role)
   * DELETE /roles/:id (Requires 'admin' role)

  School

   * GET /school/classes (Requires 'admin', 'teacher', or 'student' role)
   * POST /school/classes (Requires 'admin' role)
   * GET /school/students (Requires 'admin' or 'teacher' role)
   * POST /school/students (Requires 'admin' or 'teacher' role)
   * GET /school/teachers (Requires 'admin' or 'teacher' role)
   * POST /school/teachers (Requires 'admin' role)
   * GET /school/attendance (Requires 'admin', 'teacher', or 'student' role)
   * POST /school/attendance (Requires 'admin' or 'teacher' role)
   * GET /school/marks (Requires 'admin', 'teacher', or 'student' role)
   * POST /school/marks (Requires 'admin' or 'teacher' role)

Step 1: Create a Student

  Send a POST request to http://localhost:4000/school/students with the following headers and body. I'm using the existing prashant user.

   * Headers:
       * Content-Type: application/json
       * Authorization: Bearer <your_jwt_token> (Use a valid admin/teacher token)
   * Body:

   1     {
   2       "roll_no": "STD101",
   3       "user": {
   4         "id": "3d1ed02b-1f5a-48c5-9441-cb024107b16e"
   5       }
   6     }

  From the response, copy the `id` of the newly created student.

  ---

  Step 2: Create Marks for the New Student

  Now, use the student id you just copied to create the marks. Send a POST request to http://localhost:4000/school/marks.

   * Headers:
       * Content-Type: application/json
       * Authorization: Bearer <your_jwt_token>
   * Body:

   1     [
   2       {
   3         "subject": "Physics",
   4         "marks": 95,
   5         "student_id": "1"
   6       }
   7     ]





   Here's a breakdown of how to test the new teacher creation and mark deletion features in Postman.

  Part 1: How to Test Teacher Creation

  This test will create a new User with a 'teacher' role and a corresponding Teacher profile in one API call.

   1. Get an Admin Token:
       * First, you need a JWT from an admin user. You can get this by logging in via the POST http://localhost:4000/auth/login endpoint with an admin's
         credentials. Copy the access_token from the response.

   2. Set up the Request in Postman:
       * Method: POST
       * URL: http://localhost:4000/school/teachers

   3. Configure Authorization:
       * Go to the Authorization tab.
       * Select Bearer Token from the Type dropdown.
       * Paste the admin access_token you copied into the Token field on the right.

   4. Configure the Body:
       * Go to the Body tab.
       * Select the raw radio button.
       * Choose JSON from the dropdown that appears on the right.
       * Paste the following JSON into the text area. Remember to use a unique username and email that doesn't already exist in your database.

   1     {
   2       "username": "new.teacher1",
   3       "email": "new.teacher1@example.com",
   4       "password": "password123",
   5       "firstName": "John",
   6       "lastName": "Doe",
   7       "subject": "Physics"
   8     }

   5. Send the Request:
       * Click the Send button.

   6. Check the Response:
       * You should receive a 201 Created status code.
       * The response body will contain the details of the newly created teacher, linked to their new user profile.

  ---

  Part 2: How to Test Deleting a Mark

  This test will delete a specific mark record from the database.

   1. Get a Mark ID and a Token:
       * First, you need the id of a mark you want to delete. You can get a list of all marks and their IDs by making a GET request to
         http://localhost:4000/school/marks.
       * You will also need a JWT from an admin or teacher user.

   2. Set up the Request in Postman:
       * Method: DELETE
       * URL: http://localhost:4000/school/marks/:id
       * Replace :id in the URL with the actual id of the mark you want to delete. For example: http://localhost:4000/school/marks/3

   3. Configure Authorization:
       * Go to the Authorization tab.
       * Select Bearer Token and paste in your admin or teacher token.

   4. Send the Request:
       * Click the Send button. No request body is needed.

   5. Check the Response:
       * On Success: You should get a 200 OK status code, and the body will contain the data of the mark that was just deleted.
       * If ID Doesn't Exist: If you try to delete a mark with an ID that isn't in the database, you should get a 404 Not Found status code and an error
         message like "Mark with ID 3 not found".