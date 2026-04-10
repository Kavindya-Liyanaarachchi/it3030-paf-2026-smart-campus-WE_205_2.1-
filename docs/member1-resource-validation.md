# Member 1 - Resource Validation Notes

This note summarizes the expected validation rules for resource creation and updates.

## Required Fields

1. `name` (string, not blank)
2. `type` (enum)
3. `capacity` (number, positive)
4. `location` (string, not blank)
5. `availability` (string, not blank)
6. `status` (enum)

## Enum Values

`type`:
- `LECTURE_HALL`
- `LAB`
- `MEETING_ROOM`
- `EQUIPMENT`

`status`:
- `ACTIVE`
- `OUT_OF_SERVICE`

## Notes

If invalid payloads are sent, the API should respond with a `400 Bad Request`
and a clear validation error message from the global exception handler.
