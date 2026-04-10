# Smart Campus Operations Hub

A full-stack web platform for university campus management — facility bookings, asset catalogue, incident ticketing, notifications, and role-based access control.

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Backend   | Java 17 · Spring Boot 3.2 · Spring Security · Spring Data JPA |
| Auth      | OAuth 2.0 (Google Sign-In) · JWT (access + refresh tokens) |
| Database  | H2 (dev) / PostgreSQL (prod) |
| Frontend  | React 18 · TypeScript · Vite · TanStack Query |
| Styling   | Tailwind CSS · Radix UI primitives |
| API Docs  | SpringDoc OpenAPI / Swagger UI |

---

## Project Structure

```
smart-campus/
├── backend/                          # Spring Boot REST API
│   └── src/main/java/com/smartcampus/
│       ├── config/                   # Security config, Data seeder
│       ├── controller/               # REST controllers (5 modules)
│       ├── dto/request/              # Request DTOs with validation
│       ├── dto/response/             # Response DTOs
│       ├── entity/                   # JPA entities
│       ├── enums/                    # All enum types
│       ├── exception/                # Global exception handler + custom exceptions
│       ├── repository/               # Spring Data JPA repositories
│       ├── security/                 # JWT provider, OAuth2 handlers, UserDetails
│       └── service/                  # Business logic (4 core services)
│
└── frontend/                         # React SPA
    └── src/
        ├── api/                      # Axios API clients (one per domain)
        ├── components/layout/        # AppLayout with sidebar
        ├── contexts/                 # AuthContext (JWT + user state)
        ├── pages/                    # All page components
        ├── types/                    # TypeScript type definitions
        └── utils/                    # Date formatters, badge helpers
```

---



## Modules Implemented

### Module A – Facilities & Assets Catalogue
- Full CRUD for resources (Lecture Halls, Labs, Meeting Rooms, Equipment)
- Metadata: type, capacity, location, building, floor, availability windows, status
- Status management: `ACTIVE` / `OUT_OF_SERVICE` / `MAINTENANCE`
- Search + filter by type, capacity, location, status (JPA Specification)
- Paginated results

### Module B – Booking Management
- Create booking requests (date, time range, purpose, attendees)
- Conflict detection query — no overlapping approved/pending bookings
- Workflow: `PENDING → APPROVED / REJECTED`, approved can be `CANCELLED`
- Admin review with optional note
- Users see own bookings; admins see all with filters

### Module C – Maintenance & Incident Ticketing
- Create tickets with category, description, priority, contact details
- Image attachments (up to 3 per ticket, multipart upload)
- Workflow: `OPEN → IN_PROGRESS → RESOLVED → CLOSED` (+ `REJECTED`)
- Technician assignment by admin/manager
- Comment system with edit/delete ownership rules
- Resolution notes and rejection reasons

### Module D – Notifications
- Async notifications for: booking approved/rejected/cancelled, ticket status change, ticket assigned, new comment
- Notification panel with unread count badge
- Mark individual or all-as-read
- Polling every 30 seconds

### Module E – Authentication & Authorization
- Google OAuth 2.0 login via Spring Security
- JWT issued after successful OAuth2, redirect to frontend with token
- Refresh token support
- Roles: `USER`, `ADMIN`, `MANAGER`, `TECHNICIAN`
- Method-level security (`@PreAuthorize`) on all sensitive endpoints
- Frontend route guards per role

---

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+
- Google Cloud project with OAuth2 credentials

### 1. Configure Google OAuth2

Create a project at [console.cloud.google.com](https://console.cloud.google.com), enable the Google+ API, and create OAuth2 credentials.

Add authorized redirect URI:
```
http://localhost:8080/login/oauth2/code/google
```

### 2. Backend Setup

```bash
cd backend

# Set environment variables (or edit application.yml directly for dev)
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
export JWT_SECRET=YourSuperLongSecretKeyAtLeast256BitsForHMACSHA256

# Run
./mvnw spring-boot:run
```

Backend starts at: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`  
H2 Console: `http://localhost:8080/h2-console`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: `http://localhost:5173`

---

## API Endpoints Summary

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/oauth2/authorization/google` | Initiate Google login |

### Resources (Module A)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/resources` | Public | Search/filter resources |
| GET | `/api/resources/{id}` | Public | Get resource detail |
| POST | `/api/resources` | ADMIN/MANAGER | Create resource |
| PUT | `/api/resources/{id}` | ADMIN/MANAGER | Update resource |
| PATCH | `/api/resources/{id}/status` | ADMIN/MANAGER | Update status |
| DELETE | `/api/resources/{id}` | ADMIN | Delete resource |

### Bookings (Module B)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | USER+ | Create booking request |
| GET | `/api/bookings/my` | USER+ | My bookings |
| GET | `/api/bookings` | ADMIN/MANAGER | All bookings (filtered) |
| GET | `/api/bookings/{id}` | USER+ | Get booking |
| POST | `/api/bookings/{id}/review` | ADMIN/MANAGER | Approve/Reject |
| POST | `/api/bookings/{id}/cancel` | USER+ | Cancel booking |

### Tickets (Module C)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tickets` | USER+ | Create ticket |
| POST | `/api/tickets/{id}/attachments` | USER+ | Upload image |
| PATCH | `/api/tickets/{id}` | ADMIN/MANAGER/TECH | Update status/assign |
| GET | `/api/tickets/my` | USER+ | My tickets |
| GET | `/api/tickets/assigned` | TECH+ | Assigned tickets |
| GET | `/api/tickets` | ADMIN/MANAGER/TECH | All tickets |
| GET | `/api/tickets/{id}` | USER+ | Ticket detail |
| POST | `/api/tickets/{id}/comments` | USER+ | Add comment |
| PUT | `/api/tickets/comments/{id}` | OWNER | Edit comment |
| DELETE | `/api/tickets/comments/{id}` | OWNER/ADMIN | Delete comment |

### Notifications (Module D)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | USER+ | All notifications |
| GET | `/api/notifications/unread` | USER+ | Unread only |
| GET | `/api/notifications/count` | USER+ | Unread count |
| PATCH | `/api/notifications/{id}/read` | USER+ | Mark as read |
| POST | `/api/notifications/read-all` | USER+ | Mark all read |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | ADMIN/MANAGER | List all users |
| PATCH | `/api/admin/users/{id}/role` | ADMIN | Update user role |
| PATCH | `/api/admin/users/{id}/toggle` | ADMIN | Enable/disable user |

---

## Production Deployment

### Switch to PostgreSQL

In `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/smartcampus
    driver-class-name: org.postgresql.Driver
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: validate  # use Flyway/Liquibase in prod
```

### Environment Variables (Production)
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=<256-bit random string>
FRONTEND_URL=https://your-domain.com
DB_URL=jdbc:postgresql://...
DB_USER=...
DB_PASSWORD=...
UPLOAD_DIR=/var/app/uploads
```

### Frontend Build
```bash
cd frontend
npm run build
# Deploy dist/ to your CDN or static server
```

---

## Default Seeded Users

| Email | Role | Purpose |
|-------|------|---------|
| admin@smartcampus.edu | ADMIN | Full access |
| manager@smartcampus.edu | MANAGER | Facility management |
| tech@smartcampus.edu | TECHNICIAN | Ticket resolution |
| student@smartcampus.edu | USER | Standard access |

> Note: These users exist in the DB but login requires Google OAuth2. In dev, any Google account that signs in gets `USER` role by default. Promote to ADMIN via the H2 console or the admin panel.

---

## Key Design Decisions

1. **JWT + OAuth2 hybrid**: Spring Security handles the OAuth2 dance; a JWT is issued on success and stored in localStorage. This keeps the API stateless.

2. **Layered architecture**: Controller → Service → Repository. No business logic in controllers or entities.

3. **JPA Specification for dynamic queries**: Booking and Ticket search uses `JpaSpecificationExecutor` for clean, composable filters without N query methods.

4. **Async notifications**: `@Async` on `NotificationService.sendNotification` so ticket/booking updates don't block the response.

5. **Conflict detection**: A single JPQL query checks for overlapping bookings in the same resource/date window, covering all edge cases.

6. **Comment ownership**: Backend enforces author check on edit; admin can delete any comment.

7. **TanStack Query**: All API state is managed via React Query with 30s stale time. No Redux needed.
