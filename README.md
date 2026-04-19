# 🩸 LifeNet — Smart Organ & Blood Management System

A production-grade, real-time healthcare emergency platform that connects hospitals, blood banks, and organ procurement centers to eliminate delays and save lives.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![React](https://img.shields.io/badge/react-19-blue)
![MongoDB](https://img.shields.io/badge/mongodb-8-green)

---

## 🎯 Features

### Core
- **Real-time Dashboard** — Live stats, charts, and activity feed
- **Organ Management** — Register, track, and match organs with smart algorithm
- **Blood Bank** — Full inventory with temperature monitoring and expiry alerts
- **Request Workflow** — Create → Match → Approve → Transfer → Complete
- **Emergency Alerts** — One-click broadcast to all connected centers via WebSocket

### Advanced
- 🧠 **Smart Matching Algorithm** — Rule-based scoring (blood compatibility, viability, age proximity, location)
- 🔔 **Real-time Notifications** — Socket.io push to every connected user
- 📊 **Analytics Dashboard** — 30-day trends, distribution charts (Recharts)
- 🌙 **Dark Futuristic UI** — Glassmorphism, glow effects, micro-animations
- 🧾 **Audit Logging** — Every action tracked with actor, target, and timestamp
- 🔐 **JWT Auth** — Access + Refresh tokens, httpOnly cookies, bcrypt hashing
- 🛡️ **Security** — Helmet, CORS, rate limiting, Zod validation, role-based auth
- 📁 **File Uploads** — Multer integration ready

---

## 🏗️ Architecture

```
lifenet/
├── client/                 # React 19 + Redux Toolkit + Tailwind CSS
│   ├── src/
│   │   ├── layouts/        # Dashboard layout
│   │   ├── pages/          # Login, Dashboard, Organs, Blood, Requests, Emergency
│   │   ├── redux/          # Feature slices (auth, organs, blood, requests, notifications)
│   │   ├── services/       # Axios API client with auto-refresh
│   │   └── socket/         # Socket.io client
│   └── index.html
│
├── server/                 # Node.js + Express + MongoDB
│   ├── config/             # DB connection, environment config
│   ├── controllers/        # Auth, Organ, Blood, Request, Dashboard
│   ├── middleware/          # Auth guard, validation, error handler
│   ├── models/             # User, Organ, BloodUnit, Request, AuditLog, Notification
│   ├── routes/             # RESTful API routes
│   ├── services/           # Matching algorithm, audit, notifications
│   ├── sockets/            # Socket.io server handlers
│   └── utils/              # JWT, logger, validators, seeder
│
└── docs/                   # Documentation
```

---

## 🔐 Roles & Permissions

| Role | Create Organ | Create Blood | Create Request | Approve | Transfer | Analytics |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| HOSPITAL | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| BLOOD_BANK | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| PROCUREMENT_CENTER | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone
```bash
git clone https://github.com/abhishekk-y/Life-Net.git
cd Life-Net
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env    # Edit with your MongoDB URI
npm install
npm run dev
```

### 3. Seed Database
```bash
node utils/seed.js
```

### 4. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

### 5. Open
Visit `http://localhost:5173`

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lifenet.com | admin123 |
| Hospital | hospital@lifenet.com | hospital123 |
| Blood Bank | bloodbank@lifenet.com | bloodbank123 |
| Procurement | procurement@lifenet.com | procurement123 |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/refresh` | Refresh token | Public |
| POST | `/api/auth/logout` | Logout | Protected |
| GET | `/api/auth/me` | Current user | Protected |
| GET | `/api/organs` | List organs | Protected |
| POST | `/api/organs` | Create organ | PC, Admin |
| POST | `/api/organs/match` | Smart match | Hospital, Admin |
| GET | `/api/blood` | List blood units | Protected |
| POST | `/api/blood` | Add blood unit | BB, Admin |
| GET | `/api/blood/summary` | Inventory summary | Protected |
| GET | `/api/requests` | List requests | Protected |
| POST | `/api/requests` | Create request | Hospital, Admin |
| PUT | `/api/requests/:id/approve` | Approve | Admin |
| PUT | `/api/requests/:id/transfer` | Mark transit | Admin, PC, BB |
| PUT | `/api/requests/:id/complete` | Complete | Admin, Hospital |
| PUT | `/api/requests/:id/reject` | Reject | Admin |
| GET | `/api/dashboard/stats` | Dashboard stats | Protected |
| GET | `/api/dashboard/analytics` | Chart data | Admin |
| GET | `/api/dashboard/activity` | Audit logs | Protected |

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

### Backend (Render/Railway)
- Set environment variables (`.env.example`)
- Point `MONGO_URI` to MongoDB Atlas
- Set `CLIENT_URL` to your Vercel domain
- Start command: `node index.js`

### Environment Variables
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
CLIENT_URL=https://your-app.vercel.app
```

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Redux Toolkit, Tailwind CSS, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (Access + Refresh), bcrypt |
| Real-time | Socket.io |
| Validation | Zod |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Winston |

---

## 📄 License

MIT © [abhishekk-y](https://github.com/abhishekk-y)
