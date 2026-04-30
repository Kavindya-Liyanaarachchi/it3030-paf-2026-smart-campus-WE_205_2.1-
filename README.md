# Smart Campus Operations Hub

SmartCampus is a full-stack web platform for campus operations management:
- Facilities and asset catalog
- Booking workflow with approval and rejection
- Incident ticketing with attachments and comments
- In-app notifications and preferences
- Authentication and role-based authorization

## Repository
- GitHub: `https://github.com/Kavindya-Liyanaarachchi/it3030-paf-2026-smart-campus-WE_205_2.1-.git`

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2.3, Spring Security, Spring Data MongoDB |
| Auth | Google OAuth2 and JWT (access and refresh token flow) |
| Database | MongoDB |
| Frontend | React 18, TypeScript, Vite, TanStack Query |
| Styling | Tailwind CSS |
| API Docs | SpringDoc OpenAPI (Swagger UI) |

## Project Structure

```text
SmartCampus/
|-- backend/
|   |-- src/main/java/com/smartcampus/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- entity/
|   |   |-- enums/
|   |   |-- exception/
|   |   |-- repository/
|   |   |-- security/
|   |   `-- service/
|   `-- src/main/resources/application.yml
|-- frontend/
|   |-- src/api/
|   |-- src/components/
|   |-- src/contexts/
|   |-- src/pages/
|   |-- src/types/
|   `-- src/utils/
`-- docker-compose.yml
```

## Implemented Modules

### Module A: Facilities and Assets Catalogue
- Resource CRUD
- Resource type and status filtering
- Search and pagination

### Module B: Booking Management
- Booking creation for resources
- Conflict detection for overlapping bookings
- Review workflow by admin and manager
- Booking cancellation

### Module C: Maintenance and Incident Ticketing
- Ticket creation with category and priority
- Attachment upload (multipart)
- Ticket status updates and technician assignment
- Ticket comment add, edit, and delete

### Module D: Notifications
- Notification feed and unread count
- Mark one or all notifications as read
- Notification preferences management

### Module E: Authentication and Authorization
- OAuth2 login with Google
- JWT-based API authentication
- Role-based access (`USER`, `ADMIN`, `MANAGER`, `TECHNICIAN`)
- Route and endpoint protection

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register local account |
| POST | `/login` | Login local account |
| GET | `/me` | Get current user |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout user |

### Resources (`/api/resources`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Public |
| GET | `/{id}` | Public |
| POST | `/` | ADMIN, MANAGER |
| PUT | `/{id}` | ADMIN, MANAGER |
| PATCH | `/{id}/status` | ADMIN, MANAGER |
| DELETE | `/{id}` | ADMIN |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Authenticated |
| GET | `/my` | Authenticated |
| GET | `/{id}` | Authenticated |
| GET | `/` | ADMIN, MANAGER |
| POST | `/{id}/review` | ADMIN, MANAGER |
| POST | `/{id}/cancel` | Authenticated |

### Tickets (`/api/tickets`)
| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Authenticated |
| POST | `/{id}/attachments` | Authenticated |
| PATCH | `/{id}` | ADMIN, MANAGER, TECHNICIAN |
| GET | `/my` | Authenticated |
| GET | `/assigned` | ADMIN, MANAGER, TECHNICIAN |
| GET | `/` | ADMIN, MANAGER, TECHNICIAN |
| GET | `/{id}` | Authenticated |
| POST | `/{id}/comments` | Authenticated |
| PUT | `/comments/{commentId}` | Authenticated (owner rule in service) |
| DELETE | `/comments/{commentId}` | Authenticated (owner or admin rule in service) |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Authenticated |
| GET | `/unread` | Authenticated |
| GET | `/count` | Authenticated |
| PATCH | `/{id}/read` | Authenticated |
| POST | `/read-all` | Authenticated |
| GET | `/preferences` | Authenticated |
| PUT | `/preferences` | Authenticated |

### Admin (`/api/admin`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/users` | ADMIN, MANAGER |
| PATCH | `/users/{id}/role` | ADMIN |
| PATCH | `/users/{id}/toggle` | ADMIN |

## Frontend Routes and UI Components

Defined in `frontend/src/App.tsx` and `frontend/src/components/layout/AppLayout.tsx`.

- `/login` -> LoginPage
- `/oauth2/redirect` -> OAuth2RedirectPage
- `/dashboard` -> DashboardPage
- `/resources` -> ResourcesPage
- `/resources/:id` -> ResourceDetailPage
- `/bookings` -> BookingsPage
- `/bookings/new` -> NewBookingPage
- `/tickets` -> TicketsPage
- `/tickets/new` -> NewTicketPage
- `/tickets/:id` -> TicketDetailPage
- `/notifications` -> NotificationsPage
- `/profile` -> ProfilePage
- `/admin` -> AdminPage (ADMIN, MANAGER only)

## Team Contribution Mapping

Based on current Git history (`git shortlog -sn --all`) in this repository:

| Member | Implemented Backend Endpoints | Implemented UI Components |
|---|---|---|
| Kavindya Liyanaarachchi | Auth, Resources, Bookings, Tickets, Notifications, Admin controllers | App routing/layout and all current page components |

If additional members contributed, add them here with commit evidence before final submission.

## Local Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB (local or remote)
- Google OAuth2 credentials

### 1. Configure environment variables

PowerShell example:

```powershell
$env:GOOGLE_CLIENT_ID="your-google-client-id"
$env:GOOGLE_CLIENT_SECRET="your-google-client-secret"
$env:JWT_SECRET="your-very-long-jwt-secret"
$env:MONGODB_URI="mongodb://localhost:27017/smartcampus"
$env:FRONTEND_URL="http://localhost:5173"
```

### 2. Run backend

```powershell
cd backend
mvn spring-boot:run
```

Backend URLs:
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Run frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:
- `http://localhost:5173`

## Docker

`docker-compose.yml` starts backend and frontend services.  
Provide a reachable MongoDB using `MONGODB_URI` when running containers.

## Submission Notes

- Include:
  - Public or evaluator-accessible GitHub repository
  - Final report PDF
  - Running demonstration
  - Evidence screenshots or short video link
- Naming required by module brief:
  - Report: `IT3030_PAF_Assignment_2026_GroupXX.pdf`
  - Repository: `it3030-paf-2026-smart-campus-groupXX`
- Do not include compiled dependencies or build artifacts in submission zip:
  - `frontend/node_modules`
  - `backend/target`

## Current Evidence Files

- `images/UserLevel.png`

