Development
===========

Run backend (Docker) and frontend together:

- npm script (recommended):

	```markdown
	Development
	===========

	Run backend (Docker) and frontend together:

	- npm script (recommended):

		```bash
		npm run dev:with-api
		```

	- Windows (batch):

		```powershell
		scripts\\start-with-backend.bat
		```

	Notes:
	- The backend lives in `./medical-api` and is intended to be run via Docker Compose. Do not modify files inside `./medical-api`.
	- If you need to seed the database, read `./medical-api/README.MD` for seeding instructions.

	Manual smoke test (2 min)
	-------------------------
	Quick verification steps to confirm frontend ↔ backend ↔ DB are working locally:

	1. Start backend (from repo root):

	```bash
	cd medical-api
	docker compose up -d --build
	```

	2. Start frontend (repo root):

	```bash
	npm install
	npm run dev
	```

	3. Login as seeded patient (open app at http://localhost:8080 and use DevTools → Network):
	   - POST `/auth/login` → HTTP 200, response contains `token`, `user_id`, and `patient_id`
	   - GET `/auth/me` → HTTP 200, returns `user` object
	   - GET `/appointment/patient/<patient_id>/upcoming` → HTTP 200, returns appointments list
	   - Note: `GET /auth/verify` is known to return 500 in the backend submodule, and the frontend intentionally does not call it.

	These steps exercise a full end-to-end flow: authentication, user lookup, and appointment queries. If anything fails, inspect `medical-api` container logs and DB state.

	```

