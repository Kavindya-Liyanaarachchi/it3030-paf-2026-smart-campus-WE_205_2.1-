# Member 1 - Facilities & Assets Catalogue (Resources)

This note documents the Resource endpoints and examples implemented by Member 1.

## Base URL

`/api/resources`

## Endpoints

1. List/search resources
   - `GET /api/resources`
   - Query params (optional):
     - `type` (e.g., `LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `EQUIPMENT`)
     - `location` (string)
     - `minCapacity` (integer)
     - `status` (`ACTIVE`, `OUT_OF_SERVICE`)

2. Get resource by ID
   - `GET /api/resources/{id}`

3. Create resource (ADMIN only)
   - `POST /api/resources`

4. Update resource (ADMIN only)
   - `PUT /api/resources/{id}`

5. Delete resource (ADMIN only)
   - `DELETE /api/resources/{id}`

## Example Requests

Search resources:
```http
GET /api/resources?type=LAB&minCapacity=30&status=ACTIVE
```

Create resource:
```http
POST /api/resources
Content-Type: application/json

{
  "name": "Lecture Hall A",
  "type": "LECTURE_HALL",
  "capacity": 200,
  "location": "Main Campus Building 1",
  "availability": "Mon-Fri 08:00-18:00",
  "status": "ACTIVE",
  "description": "Large hall with AV system and tiered seating"
}
```

Update resource:
```http
PUT /api/resources/1
Content-Type: application/json

{
  "name": "Lecture Hall A",
  "type": "LECTURE_HALL",
  "capacity": 220,
  "location": "Main Campus Building 1",
  "availability": "Mon-Fri 08:00-18:00",
  "status": "ACTIVE",
  "description": "Updated capacity"
}
```

Delete resource:
```http
DELETE /api/resources/1
```
