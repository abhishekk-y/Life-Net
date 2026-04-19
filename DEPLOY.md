# 🩸 LifeNet — Deployment Guide

Complete guide to deploy LifeNet (frontend + backend) for free online.

---

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account (free) → [mongodb.com/atlas](https://mongodb.com/atlas)
- GitHub account
- Accounts on Render (backend) and Vercel (frontend) — both free

---

## 🗄️ Step 1 — Set Up MongoDB Atlas (Free Cloud Database)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create Free Account**
2. Create a new **Free Cluster** (M0 — forever free)
3. Under **Database Access** → Add a new user (e.g. `lifenet_user` / strong password)
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere)
5. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://lifenet_user:<password>@cluster0.xxxxx.mongodb.net/lifenet?retryWrites=true&w=majority
   ```
6. Save this — you'll need it as `MONGODB_URI`

---

## ⚙️ Step 2 — Deploy Backend on Render (Free)

1. Go to [render.com](https://render.com) → **Sign in with GitHub**
2. Click **New → Web Service**
3. Connect your GitHub repo: `abhishekk-y/Life-Net`
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `lifenet-api` |
   | **Root Directory** | `server` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node index.js` |
   | **Plan** | Free |

5. Under **Environment Variables**, add:

   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://lifenet_user:<password>@cluster0.xxxxx.mongodb.net/lifenet
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-refresh-secret-change-this
   JWT_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   PORT=5000
   CLIENT_URL=https://lifenet.vercel.app
   ```

6. Click **Create Web Service** — Render will build and deploy (~2 min)
7. Your backend URL will be: `https://lifenet-api.onrender.com`

> ⚠️ **Free tier note**: Render free services spin down after 15 min inactivity. First request may take ~30 sec to wake up.

---

## 🌐 Step 3 — Deploy Frontend on Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → **Sign in with GitHub**
2. Click **Add New → Project**
3. Import your GitHub repo: `abhishekk-y/Life-Net`
4. Configure:

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `client` |
   | **Framework Preset** | `Vite` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

5. Under **Environment Variables**, add:

   ```
   VITE_API_URL=https://lifenet-api.onrender.com
   ```

6. Click **Deploy** — Vercel will build and deploy (~1 min)
7. Your frontend URL will be: `https://lifenet.vercel.app`

---

## 🔗 Step 4 — Connect Frontend to Backend

Update your `client/vite.config.js` for production — the `VITE_API_URL` env var handles this.

In `client/src/lib/api.js`, update the base URL:
```js
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';
```

Then go back to **Render** and update the `CLIENT_URL` env var to your Vercel URL.

---

## 🌱 Step 5 — Seed the Production Database

After deploying, seed the database so you have default admin credentials:

```bash
# Set env vars locally pointing to Atlas, then run:
MONGODB_URI="mongodb+srv://..." node server/utils/seed.js
```

Default credentials after seeding:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lifenet.com | admin |
| Hospital | hospital@lifenet.com | hospital123 |
| Blood Bank | bloodbank@lifenet.com | bloodbank123 |
| Procurement | procurement@lifenet.com | procurement123 |

---

## 🔄 Alternative: Deploy Both on Railway

[railway.app](https://railway.app) lets you deploy backend + MongoDB in one place.

1. New Project → **Deploy from GitHub**
2. Add MongoDB plugin (free 500MB)
3. Set root to `server`, set env vars
4. Railway auto-detects Node.js and deploys

---

## 🐳 Docker Deployment (VPS / DigitalOcean)

If you have a VPS (Ubuntu), use Docker Compose:

```bash
# On your VPS:
git clone https://github.com/abhishekk-y/Life-Net.git
cd Life-Net

# Create .env file in server/ with your Atlas URI
cp server/.env.example server/.env
# Edit server/.env

# Build and run
docker-compose up -d
```

`docker-compose.yml` (create at project root):
```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped

  frontend:
    build: ./client
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
```

---

## ✅ Quick Checklist

- [ ] MongoDB Atlas cluster created with user + network access
- [ ] Backend deployed on Render with all env vars
- [ ] Frontend deployed on Vercel with `VITE_API_URL` set
- [ ] `CLIENT_URL` on Render updated to Vercel URL
- [ ] Database seeded with `node server/utils/seed.js`
- [ ] Login tested at your Vercel URL

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | Check `CLIENT_URL` env var on Render matches your Vercel URL exactly |
| 401 on login | Make sure `JWT_SECRET` is set on Render |
| DB connection failed | Check MongoDB Atlas Network Access — allow `0.0.0.0/0` |
| Render 502 | Service is sleeping — wait 30 sec and retry |
| Blank page on Vercel | Check `VITE_API_URL` is set, rebuild |

---

*LifeNet — Smart Organ & Blood Management System*
