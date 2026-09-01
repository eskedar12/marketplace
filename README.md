# ReGebeya Used Goods Marketplace

A peer-to-peer marketplace for buying and selling secondhand items —
electronics, furniture, appliances, vehicles, apparel — within local
Ethiopian communities. Built to replace fragmented, hard-to-search
Telegram-channel listings with a proper searchable, filterable web
platform.

**🔗 [Live Demo — ReGebeya](https://regebeya.onrender.com/)**

This repo is a monorepo with two apps:

```
Marketplace/
├── backend/    Node.js + Express + PostgreSQL REST API
└── frontend/   React + Vite + Tailwind web app
```

## Highlights

- Seller flow: onboarding/login, multi-photo listing upload, condition
tagging, city/neighborhood location, optional Fayda (Ethiopian
national ID) verification
- Buyer flow: keyword search, price/condition/location filters,
category browsing, favorites, cart, Chapa checkout
- Direct contact: in-app messaging + a phone "Call seller" button
- Trust & safety: listing reports, post-transaction seller ratings
- Extras: in-app notifications, a Gemini-backed page assistant,
bilingual UI, light/dark theming

## Quick start

Run both apps locally, each in its own terminal:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm install
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET at minimum
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to the backend's URL
npm run dev
```

Full setup details — database migrations, all environment variables,
API routes, and known gaps — live in each app's own README:

- [`backend/README.md`]\(./backend/README.md\)
- [`frontend/README.md`](./frontend/README.md)

## Tech stack

| Layer     | Stack |
|-----------|-------|
| Frontend    | React, Vite, Tailwind CSS, React Router, Axios |
| Backend      | Node.js, Express, PostgreSQL (no ORM, raw SQL via `pg`) |
| Auth           | JWT + bcrypt |
| Image storage    | Cloudinary |
| Payments           | Chapa |
| Identity verification | Fayda (Ethiopian national digital ID), mock mode by default |
