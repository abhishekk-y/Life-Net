# LifeNet API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-backend.onrender.com/api`

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Rate Limits
- General API: 100 requests / 15 minutes per IP
- Auth endpoints: 20 requests / 15 minutes per IP

## Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

## Endpoints
See README.md for the complete API reference table.
