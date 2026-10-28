# LifeNet API reference

Base path: `/api`. Local development uses `http://localhost:5000/api`.

Protected requests use `Authorization: Bearer <access_token>`. Sign-in also issues an HTTP-only refresh cookie; keep browser requests credentialed so the session can renew. Provider accounts must be approved by a LifeNet administrator before protected provider workflows are available. Most successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": ..., "errors": [...] }`.

## Accounts

| Method | Path | Access |
| --- | --- | --- |
| POST | `/auth/register` | Public; patient or provider application |
| POST | `/auth/login` | Public |
| POST | `/auth/password/reset-request` | Public; generic response and single-use email reset link when an active account matches |
| POST | `/auth/password/reset` | Public; consumes an unexpired reset token and revokes the refresh session |
| POST | `/auth/email/verify` | Public; consumes an unexpired, single-use email verification token |
| POST | `/auth/email/resend-verification` | Public; generic response and verification email when an active account needs it |
| POST | `/auth/refresh` | Refresh cookie |
| POST | `/auth/logout` | Public/session cleanup |
| GET | `/auth/me` | Signed-in user |
| POST | `/auth/password` | Signed-in user; verifies current password, changes it, and rotates the refresh session |
| PUT | `/auth/profile` | Signed-in user; updates name, phone, and contact address |

## Blood and organ coordination

| Method | Path | Access |
| --- | --- | --- |
| GET, POST | `/blood` | Signed-in users; create: blood bank or admin |
| GET | `/blood/summary` | Blood bank, hospital, admin |
| POST | `/blood/match` | Hospital, admin |
| GET, PUT, DELETE | `/blood/:id` | Signed-in read; update: owning blood bank or admin; delete: admin |
| GET, POST | `/organs` | Admin, hospital, procurement center; create: procurement center or admin |
| POST | `/organs/match` | Hospital, admin |
| GET, PUT, DELETE | `/organs/:id` | Signed-in read; update: owning procurement center or admin; delete: admin |
| GET, POST | `/requests` | Signed-in read; create: hospital or admin |
| POST | `/requests/:id/match` | Admin, hospital, blood bank, procurement center |
| POST | `/requests/:id/assign` | Admin or relevant resource center |
| PUT | `/requests/:id/approve` | Admin |
| PUT | `/requests/:id/transfer` | Admin or assigned center |
| PUT | `/requests/:id/complete` | Admin or requesting hospital |
| PUT | `/requests/:id/reject` | Admin |
| PUT | `/requests/:id/cancel` | Admin or requesting hospital |

## Providers and appointments

| Method | Path | Access |
| --- | --- | --- |
| GET | `/doctors` | Signed-in user |
| GET | `/doctors/profile/me` | Doctor |
| PUT | `/doctors/profile` | Doctor |
| GET | `/doctors/slots/me` | Doctor |
| POST | `/doctors/slots` | Doctor |
| DELETE | `/doctors/slots/:slotId` | Owning doctor |
| GET | `/doctors/:doctorId/slots` | Signed-in user |
| GET | `/appointments` | Patient’s or doctor’s appointments; admin can review all |
| POST | `/appointments` | Patient |
| PATCH | `/appointments/:id` | Patient, assigned doctor, admin (allowed workflow actions only) |
| GET | `/centers` | Signed-in user; admin can view applications |
| GET | `/centers/hospitals` | Signed-in user; approved, active hospitals only; supports `search` and `city` |
| PATCH | `/centers/:id/verification` | Admin |

## Pharmacy and supply orders

| Method | Path | Access |
| --- | --- | --- |
| GET | `/pharmacies/listings` | Signed-in user |
| GET | `/pharmacies/listings/mine` | Pharmacy |
| POST, PUT | `/pharmacies/listings` or `/pharmacies/listings/:id` | Pharmacy |
| GET | `/pharmacies/orders` | Patient’s or pharmacy’s orders; admin can review all |
| POST | `/pharmacies/orders` | Patient |
| PATCH | `/pharmacies/orders/:id` | Patient, owning pharmacy, admin (allowed workflow actions only) |
| GET | `/suppliers/listings` | Admin, hospital, pharmacy, blood bank, procurement center, supplier |
| GET | `/suppliers/listings/mine` | Supplier |
| POST, PUT | `/suppliers/listings` or `/suppliers/listings/:id` | Supplier |
| GET | `/suppliers/orders` | Buyer or supplier’s orders; admin can review all |
| POST | `/suppliers/orders` | Hospital, pharmacy, blood bank, procurement center |
| PATCH | `/suppliers/orders/:id` | Buyer, supplier, admin (allowed workflow actions only) |

## Dashboard and notifications

| Method | Path | Access |
| --- | --- | --- |
| GET | `/dashboard/stats` | Signed-in user; scoped by role |
| GET | `/dashboard/activity` | Signed-in user; scoped by actor except admin |
| GET | `/dashboard/analytics` | Admin |
| GET | `/dashboard/notifications` | Signed-in user; recipient-scoped, supports `page` and `limit` |
| PUT | `/dashboard/notifications/read` | Signed-in user; recipient-scoped; `{ "ids": [] }` marks all unread |
| GET | `/api/health` | Public readiness check; returns 503 if MongoDB is unavailable |

Read endpoints support pagination where implemented. Endpoint access roles are enforced by the server even when the UI hides a route. The organ and blood matching endpoints return operational shortlists only; they do not make clinical decisions.
