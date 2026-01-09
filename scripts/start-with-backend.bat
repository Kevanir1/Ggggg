@echo off
REM Start backend docker-compose (in medical-api) and then frontend (vite)
cd medical-api
docker-compose up -d
cd ..
npm run dev
