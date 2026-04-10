# Member 1 - How to Run Resources Module

This note summarizes how to run and test the Resources (Facilities & Assets) module.

## Backend (Spring Boot)

From repository root:

```bash
cd backend
mvn spring-boot:run
```

The API runs at:
`http://localhost:8080`

## Resource Endpoints

Base URL: `/api/resources`

Example:
```http
GET http://localhost:8080/api/resources?type=LAB&minCapacity=20
```

## Frontend (React)

From repository root:

```bash
cd frontend
npm install
npm run dev
```

The UI runs at:
`http://localhost:5173`

## Notes

If you changed database config, update `backend/src/main/resources/application.yml` accordingly.
