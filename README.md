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

