# ⚡ Personal Brand OS — Production Ready

All-in-one creator dashboard. Built with MERN stack, Groq AI, Cloudinary, JWT auth, and a stunning landing page.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| AI | Groq |
| Storage | Cloudinary |
| Auth | JWT + bcryptjs |
| State | Zustand |
| Charts | Recharts |
| Calendar | FullCalendar |
| Email | Nodemailer |
| Deploy | Docker + Nginx |

## Features

- 🏠 **Landing Page** — Hero, features, pricing, testimonials, CTA
- 📊 **Dashboard** — Live analytics, charts, quick actions
- 📅 **Content Calendar** — Drag & schedule posts
- 💡 **Idea Board** — Kanban with drag & drop
- 📝 **Post Tracker** — 5-stage pipeline
- 🤝 **Brand Deals CRM** — Full pipeline management
- 📈 **Analytics** — Platform breakdown + charts
- 💰 **Income Tracker** — Goals + deal income
- 🤖 **AI Studio** — Groq-powered caption & idea gen
- 🔔 **Notifications** — In-app notification center
- 👤 **Profile Settings** — Avatar, niche, platforms, goals
- 🔐 **Auth** — Register, Login, JWT refresh, password reset

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# → Edit server/.env with your credentials

# 3. Start development
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

## Environment Variables

### server/.env
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/brandos
JWT_SECRET=your_very_long_random_secret_here
JWT_REFRESH_SECRET=another_very_long_random_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_key_from_console.groq.com
GROQ_MODEL=openai/gpt-oss-20b
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLIENT_URL=http://localhost:5173
LOGO_URL=http://localhost:5173/logo.png
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@brandos.app
```

### client/.env
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Production Deployment

### Docker
```bash
docker-compose up --build -d
```

### Manual (Render + Vercel)
1. Deploy `/server` to **Render** (set all env vars)
2. Deploy `/client` to **Vercel** (set `VITE_API_BASE_URL` to Render URL)

## API Reference

| Module | Method | Endpoint |
|--------|--------|----------|
| Auth | POST | /api/auth/register |
| Auth | POST | /api/auth/login |
| Auth | POST | /api/auth/refresh |
| Auth | POST | /api/auth/forgot-password |
| Auth | POST | /api/auth/reset-password/:token |
| Auth | GET/PUT | /api/auth/me |
| Posts | GET/POST | /api/posts |
| Posts | GET/PUT/DELETE | /api/posts/:id |
| Posts | PATCH | /api/posts/:id/status |
| Ideas | GET/POST | /api/ideas |
| Ideas | PUT/DELETE | /api/ideas/:id |
| Ideas | PATCH | /api/ideas/:id/move |
| Deals | GET/POST | /api/deals |
| Deals | GET/PUT/DELETE | /api/deals/:id |
| Deals | GET | /api/deals/summary |
| Analytics | GET/POST | /api/analytics |
| Analytics | GET | /api/analytics/summary |
| Notifications | GET | /api/notifications |
| Notifications | PATCH | /api/notifications/:id/read |
| Notifications | PATCH | /api/notifications/read-all |
| AI | POST | /api/ai/caption |
| AI | POST | /api/ai/ideas |
| AI | POST | /api/ai/hashtags |
| AI | POST | /api/ai/bio |
# brand-os
