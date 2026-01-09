# UI → API mapping

Below is a mapping of frontend UI features to backend endpoints (source file in backend indicated).

- Login
  - Endpoint: `POST /auth/login`
  - Method: POST
  - Payload: { "email": string, "password": string }
  - Response: { status: 'success', token, user_id, role, doctor_id?, patient_id? }
  - Backend file: `medical-api/server/controllers/auth.py` (@bp.post('/login'))

- Verify session
  - Endpoint: `GET /auth/verify`
  - Method: GET
  - Payload: none (Authorization: Bearer <token>)
  - Response: { status: 'success', user_id, role }
  - Backend file: `medical-api/server/controllers/auth.py` (@bp.get('/verify'))
  - Note: This endpoint currently returns HTTP 500 due to an issue in the backend submodule (attribute access mismatch). The frontend intentionally does not call `/auth/verify` and instead relies on `POST /auth/login` response and `GET /auth/me` to obtain user details.

- Current user
  - Endpoint: `GET /auth/me`
  - Method: GET
  - Payload: none
  - Response: { status: 'success', user }
  - Backend file: `medical-api/server/controllers/auth.py` (@bp.get('/me'))

- Doctor appointments (all)
  - Endpoint: `GET /appointment/doctor/<doctor_id>`
  - Method: GET
  - Payload: none
  - Response: { status: 'success', appointments: [...] }
  - Backend file: `medical-api/server/controllers/appointment.py` (@bp.get('/doctor/<int:doctor_id>'))

- Patient upcoming appointments
  - Endpoint: `GET /appointment/patient/<patient_id>/upcoming`
  - Method: GET
  - Payload: none
  - Response: { status: 'success', appointments: [...] }
  - Backend file: `medical-api/server/controllers/appointment.py` (@bp.get('/patient/<int:patient_id>/upcoming'))

- Appointment details
  - Endpoint: `GET /appointment/<appointment_id>`
  - Method: GET
  - Payload: none
  - Response: { status: 'success', appointment }
  - Backend file: `medical-api/server/controllers/appointment.py` (@bp.get('/<int:appointment_id>'))

- Complete appointment
  - Endpoint: `PATCH /appointment/<appointment_id>/complete`
  - Method: PATCH
  - Payload: none
  - Response: { status: 'success', completed_appointment_id }
  - Backend file: `medical-api/server/controllers/appointment.py` (@bp.patch('/<int:appointment_id>/complete'))

- Cancel appointment
  - Endpoint: `PATCH /appointment/<appointment_id>/cancel`
  - Method: PATCH
  - Payload: none
  - Response: { status: 'success', cancelled_appointment_id }
  - Backend file: `medical-api/server/controllers/appointment.py` (@bp.patch('/<int:appointment_id>/cancel'))

- Doctor availability
  - Endpoint: `GET /availability/doctor/<doctor_id>`
  - Method: GET
  - Payload: none
  - Response: { status: 'success', availability: [...] }
  - Backend file: `medical-api/server/controllers/availability.py` (@bp.get('/doctor/<int:doctor_id>'))

- Availabilities by specialization+date
  - Endpoint: `GET /availability?specialization=...&date=YYYY-MM-DD`
  - Method: GET
  - Payload: query params
  - Response: { status: 'success', availabilities: [...] }
  - Backend file: `medical-api/server/controllers/availability.py` (@bp.get('/'))

- Pending users (admin)
  - Endpoint: `GET /user/pending`
  - Method: GET
  - Payload: none
  - Response: { status: 'success', pending_users: [...] }
  - Backend file: `medical-api/server/controllers/user.py` (@bp.get('/pending'))

- Activate user (admin)
  - Endpoint: `PATCH /user/<user_id>/activate`
  - Method: PATCH
  - Payload: none
  - Response: { status: 'success', activated_user_id }
  - Backend file: `medical-api/server/controllers/user.py` (@bp.patch('/<int:user_id>/activate'))

- Delete user
  - Endpoint: `DELETE /user/<user_id>`
  - Method: DELETE
  - Payload: none
  - Response: { status: 'success', deleted_user }
  - Backend file: `medical-api/server/controllers/user.py` (@bp.delete('/<int:user_id>'))

- Get doctor by user id
  - Endpoint: `GET /user/doctor/<user_id>`
  - Method: GET
  - Response: { status: 'success', doctor }
  - Backend file: `medical-api/server/controllers/user.py` (@bp.get('/doctor/<int:user_id>'))

- Get patient by user id
  - Endpoint: `GET /user/patient/<user_id>`
  - Method: GET
  - Response: { status: 'success', patient }
  - Backend file: `medical-api/server/controllers/user.py` (@bp.get('/patient/<int:user_id>'))


## Known limitations
- Feature: "Start visit" (frontend previously had a mock "Start" action). There is no dedicated backend endpoint to "start" an appointment — only `complete` and `cancel` exist. Action was removed from UI.
- Feature: Merge user accounts / complex admin mock flows — backend does not provide a merge endpoint. UI merge functionality was disabled.
- Feature: Client-side mock demo users — replaced with real auth flow; demo credentials text remains for convenience but do not affect logic.

If you want any UI feature that lacks a backend endpoint restored, we must either implement it in backend (not allowed per constraints) or hide/remove the UI control (done where applicable).
