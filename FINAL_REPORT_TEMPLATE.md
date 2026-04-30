# IT3030 Final Assignment Report

## Cover Page

- Course: Programming Applications and Frameworks (IT3030)
- Report: Final Assignment Report
- Group ID: `XXXX`
- Topic: `Smart Campus Operations Hub`
- Date: `XX.XX.XXXX`

### Group Members

| Student ID | Student Name |
|---|---|
| ITXXXXXXXX | Name 1 |
| ITXXXXXXXX | Name 2 |
| ITXXXXXXXX | Name 3 |
| ITXXXXXXXX | Name 4 |
| ITXXXXXXXX | Name 5 |

---

## 1. Introduction

Smart Campus Operations Hub is a full-stack campus operations platform that supports:

- Resource and facilities catalog management
- Resource booking with approval/rejection workflow
- Incident ticket creation and tracking with comments and image attachments
- In-app notifications with per-user notification preferences
- Authentication and authorization using Google OAuth2 and JWT

### Tech Stack

- Backend: Java 17, Spring Boot, Spring Security, Spring Data MongoDB
- Frontend: React 18, TypeScript, Vite, TanStack Query, Tailwind CSS
- Database: MongoDB
- API Documentation: Swagger/OpenAPI

---

## 2. Functional Requirements & Non-Functional Requirements

### Functional Requirements

1. User registration/login (local + Google OAuth2)
2. Role-based access control (`USER`, `ADMIN`, `MANAGER`, `TECHNICIAN`)
3. CRUD and search/filter for campus resources
4. Booking creation, conflict detection, review, and cancellation
5. Ticket creation, status update, assignment, comments, and attachments
6. Notifications feed, unread count, mark read/read-all
7. Notification preference management
8. Admin user management (view users, role update, enable/disable user)

### Non-Functional Requirements

1. Security: JWT authentication, protected APIs, role-based endpoint access
2. Usability: Responsive UI with route-level access protection
3. Performance: Client-side caching using React Query
4. Reliability: Global exception handling and validation on backend
5. Maintainability: Layered architecture (controller/service/repository), DTO-based API contracts

---

## 3. Overall Architecture Diagram

```text
+-------------------+         HTTPS          +-----------------------------+
|    Campus User    | ---------------------> |   React Frontend (Vite)     |
+-------------------+                        |   TypeScript + Tailwind      |
        |                                    +-----------------------------+
        | API docs /swagger-ui                          |
        v                                               | REST /api/* + JWT
+-------------------+                                   v
|    Swagger UI     |                        +-----------------------------+
+-------------------+ ---------------------> |      Spring Boot API        |
                                             | Security + Business Logic   |
                                             +-----------------------------+
                                                     |               |
                                                     | Read/Write    | Store files
                                                     v               v
                                           +----------------+   +-------------------+
                                           |    MongoDB     |   | Upload Storage    |
                                           |  smartcampus   |   | /uploads/tickets  |
                                           +----------------+   +-------------------+

OAuth2 flow:
+-----------------------------+       OAuth2 redirect       +----------------------+
|   React Frontend (Login)    | <-------------------------> |   Google OAuth2      |
+-----------------------------+                              +----------------------+
                 \_________________ via backend callback ___________________/
```

---

## 4. REST API Architecture Diagram

```text
+-------------------------+
| Client / Frontend       |
+-------------------------+
            |
            v
+-------------------------+
| Security Layer          |
| - SecurityConfig        |
| - JwtAuthenticationFilter
| - OAuth2UserService     |
| - OAuth2SuccessHandler  |
| - JwtTokenProvider      |
+-------------------------+
            |
            v
+-------------------------+
| Controller Layer        |
| - AuthController        |
| - ResourceController    |
| - BookingController     |
| - TicketController      |
| - NotificationController|
| - AdminController       |
+-------------------------+
            |
            v
+-------------------------+
| Service Layer           |
| - AuthService           |
| - ResourceService       |
| - BookingService        |
| - TicketService         |
| - NotificationService   |
| - NotificationPrefService
+-------------------------+
            |
            v
+-------------------------+
| Repository Layer        |
| - UserRepository        |
| - ResourceRepository    |
| - BookingRepository     |
| - IncidentTicketRepo    |
| - TicketCommentRepo     |
| - TicketAttachmentRepo  |
| - NotificationRepo      |
| - NotificationPrefRepo  |
+-------------------------+
            |
            v
+-------------------------+
| MongoDB                 |
| database: smartcampus   |
+-------------------------+
```

### Main API Groups

- `/api/auth` (register, login, me, refresh, logout)
- `/api/resources` (catalog CRUD and filtering)
- `/api/bookings` (create, review, cancel, my/all)
- `/api/tickets` (create, update, assign, comments, attachments)
- `/api/notifications` (feed, unread, count, read, preferences)
- `/api/admin` (users, role update, enable/disable)

---

## 5. Frontend Architecture Diagram

```text
+----------------------+
| main.tsx             |
+----------------------+
          |
          v
+----------------------+
| App.tsx              |
| QueryClientProvider  |
| AuthProvider         |
| BrowserRouter        |
+----------------------+
          |
          v
+----------------------+
| ProtectedRoute       |
| (auth + role checks) |
+----------------------+
          |
          v
+----------------------+
| AppLayout            |
| Sidebar + Topbar     |
+----------------------+
          |
          v
+----------------------+
| Pages                |
| - Dashboard          |
| - Resources          |
| - Bookings           |
| - Tickets            |
| - Notifications      |
| - Admin              |
| - Profile            |
+----------------------+
          |
          v
+----------------------+      +----------------------+
| API Modules          | ---> | api/client.ts        |
| auth/resources/...   |      | Axios Interceptors   |
+----------------------+      +----------------------+
                                         |
                                         v
                              +----------------------+
                              | Spring Boot Backend  |
                              +----------------------+
```

### Key Frontend Modules

- `src/App.tsx` (routes + role guard)
- `src/contexts/AuthContext.tsx` (user session, login/logout, role checks)
- `src/api/client.ts` (Axios interceptors for JWT/refresh token)
- `src/api/*` (feature-wise API wrappers)
- `src/components/layout/AppLayout.tsx` (navigation shell)
- `src/pages/*` (module screens)

---

## 6. System Functions

Include each member's function/module and screenshots of relevant UI.

### Member 1

- Name/ID:
- Assigned functions:
- Backend endpoints implemented:
- Frontend screens implemented:
- Screenshot(s):

### Member 2

- Name/ID:
- Assigned functions:
- Backend endpoints implemented:
- Frontend screens implemented:
- Screenshot(s):

### Member 3

- Name/ID:
- Assigned functions:
- Backend endpoints implemented:
- Frontend screens implemented:
- Screenshot(s):

### Member 4

- Name/ID:
- Assigned functions:
- Backend endpoints implemented:
- Frontend screens implemented:
- Screenshot(s):

### Member 5

- Name/ID:
- Assigned functions:
- Backend endpoints implemented:
- Frontend screens implemented:
- Screenshot(s):

---

## 7. GitHub

- GitHub Repo link: `https://github.com/<org-or-user>/<repo>`
- OneDrive link (report/demo assets): `<paste-link>`
- Image of GitHub Commit Tree: `<insert image or link>`

### Optional Useful Commands

```bash
git shortlog -sn --all
git log --oneline --graph --decorate --all
```

---

## 8. References

1. Spring Boot Documentation - https://spring.io/projects/spring-boot
2. Spring Security Documentation - https://spring.io/projects/spring-security
3. React Documentation - https://react.dev
4. Vite Documentation - https://vitejs.dev
5. MongoDB Documentation - https://www.mongodb.com/docs/
6. TanStack Query Documentation - https://tanstack.com/query
7. OAuth 2.0 (RFC 6749) - https://www.rfc-editor.org/rfc/rfc6749
8. JSON Web Token (RFC 7519) - https://www.rfc-editor.org/rfc/rfc7519
