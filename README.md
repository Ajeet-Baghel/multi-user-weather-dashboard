# Multi-User Weather Dashboard

Weather Desk is a full-stack assessment project with user authentication, isolated city dashboards, persistent favorites, live weather data, and an AI planning assistant.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT bearer tokens, bcrypt password hashing
- Weather API: Open-Meteo geocoding and forecast APIs
- AI: LangChain with OpenAI when `OPENAI_API_KEY` is configured, plus a deterministic fallback insight engine

I kept the preferred stack because it fits the problem well: Next.js gives a responsive app shell quickly, Express keeps API boundaries explicit, and MongoDB models map cleanly to user-owned city records. The trade-off is operating two deployable services instead of one monolith.

## Features

- Register, log in, restore session, and sign out
- Add multiple cities by name
- Fetch current weather and a short forecast dynamically
- Mark cities as favorites and keep them sorted/visible
- Enforce strict data isolation by scoping every city query to `req.user._id`
- AI planner that summarizes the user's saved weather context
- Custom feature: weather risk planning, which flags rain probability and the warmest city so the dashboard helps with decisions rather than only showing numbers

## Local Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set `MONGO_URI` and `JWT_SECRET` in `.env`. `OPENAI_API_KEY` is optional; without it the AI endpoint uses the fallback planner.

### Frontend

```bash
cd backend/frontend
cp .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The API defaults to `http://localhost:5000/api`.

## Architecture

The backend separates HTTP routing, controllers, Mongoose models, middleware, and external services:

- `routes/*` defines API surfaces
- `controllers/*` handles request flow and response shapes
- `models/*` owns persistence constraints
- `middleware/authMiddleware.js` verifies JWTs and attaches the authenticated user
- `services/weatherService.js` integrates Open-Meteo
- `services/aiAgent.js` integrates LangChain and fallback insight generation

The frontend is a small Next.js app with reusable components for auth, the dashboard, and city cards. It stores only the JWT and basic user profile in local storage, then validates the token with `/api/auth/me` on load.

## Authentication and Authorization

Passwords are hashed with bcrypt. Login and registration return a signed JWT containing the user id in `sub`. Protected routes require `Authorization: Bearer <token>`.

Authorization is enforced at the query layer. City reads, updates, and deletes always include both the city id and `user: req.user._id`, so a valid user cannot access another user's records even if they guess an id.

## AI Agent Design

The AI planner receives only the authenticated user's saved cities and weather data. With `OPENAI_API_KEY`, LangChain runs a concise weather-planning prompt through `ChatOpenAI`. If no key is present or the model call fails, the app falls back to deterministic logic that still provides useful recommendations.

This keeps the feature resilient during demos and avoids making core dashboard functionality dependent on AI availability.

## Deployment

Recommended deployment:

- Frontend: Vercel
- Backend: Render, Railway, Fly.io, or a container service
- Database: MongoDB Atlas

Environment variables should be configured in the hosting provider, not committed. Set `CLIENT_ORIGIN` on the API to the deployed frontend URL and `NEXT_PUBLIC_API_URL` on the frontend to the deployed API `/api` URL.

This repository is not deployed from this workspace because deployment credentials and provider access are not available here.

## Known Limitations

- No automated tests are included yet.
- Weather data is fetched live per dashboard load; a production version should add short-lived caching and rate-limit protection.
- The frontend uses local storage for the JWT. For a higher-security production app, prefer an HttpOnly secure cookie with CSRF protection.
- City disambiguation uses the first Open-Meteo geocoding result; a production UX should let users choose between matches.
