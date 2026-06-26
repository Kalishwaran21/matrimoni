# Atamio Matrimony

Atamio Matrimony is a full-stack MERN matrimony platform with profile management, match search, partner preferences, interests, real-time chat, subscriptions, notifications, and an admin panel.

## Stack

- Client: React, Vite, Tailwind CSS, React Router, Axios, Socket.io client
- Server: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Socket.io
- Integrations: Cloudinary for photos, Razorpay for subscriptions

## Local setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create environment files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

3. Fill MongoDB, JWT, Cloudinary, and Razorpay values in `server/.env`.

4. Start both apps:

```bash
npm run dev
```

Client runs on `http://localhost:5173` and server runs on `http://localhost:5000`.

## Deployment

- Client: deploy `client` to Vercel with `VITE_API_URL` and `VITE_SOCKET_URL`.
- Server: deploy `server` to Railway or Render with the variables from `server/.env.example`.
- Database: use MongoDB Atlas and set `MONGO_URI`.
