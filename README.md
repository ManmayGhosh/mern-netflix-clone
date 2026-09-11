# Streamly — a Netflix-style streaming app (MERN)

A full-stack clone of the Netflix browsing experience, built with MongoDB, Express, React, and Node. Branded as "Streamly" rather than Netflix to avoid trademark issues — swap the name/branding freely once it's yours.

## What's included

- **Auth**: email/password signup & login with JWT, passwords hashed with bcrypt
- **Catalog**: movie model with genre, poster/banner art, and a playable video URL
- **Browse UI**: hero banner, horizontally-scrolling genre rows, trending row, "My List"
- **Search**: debounced title/description search (MongoDB text index)
- **Player**: modal video player using the native HTML5 `<video>` element
- **My List**: add/remove titles per user, persisted in MongoDB

The seed script generates a **100-title synthetic catalog** to stress-test the UI with realistic volume — row scrolling, grid density, genre spread, and search all behave very differently with 10 items vs. 100. Poster/banner art comes from [Picsum](https://picsum.photos)'s seeded endpoint, a stable placeholder CDN that can't 404 or hotlink-block the way the original YouTube thumbnails did — the art is intentionally unrelated to each title, it's there purely as a showpiece. Playback uses Google's public sample-video bucket (the same Blender Foundation shorts as before), cycled across all 100 entries. 15 of the 100 are marked `type: "series"` so the TV Shows tab has real content to filter to.

Swap in real metadata (e.g. from the TMDB API) and your own video URLs (S3, Mux, Cloudflare Stream...) for production.

## Project structure

```
netflix-clone/
├── backend/
│   ├── config/db.js          MongoDB connection
│   ├── models/                User.js, Movie.js (Mongoose schemas)
│   ├── controllers/           authController.js, movieController.js
│   ├── routes/                authRoutes.js, movieRoutes.js
│   ├── middleware/            auth.js (JWT check), errorHandler.js
│   ├── seed/seedMovies.js     Sample catalog seeder
│   └── server.js              Express app entrypoint
└── frontend/
    ├── src/
    │   ├── api/axios.js        Axios instance with auth header injection
    │   ├── context/AuthContext.jsx
    │   ├── pages/               Login, Signup, Browse
    │   ├── components/          Navbar, Banner, MovieRow, MovieCard, VideoModal
    │   └── styles/              index.css, auth.css, browse.css
    └── vite.config.js           Dev server + /api proxy to backend
```

## Setup

### Option A: Docker Compose (isolated, recommended)

Everything — MongoDB, the API, and the frontend dev server — runs in its own container, networked together by Compose. Nothing touches your host beyond Docker itself.

**Prerequisites:** Docker + Docker Compose (Docker Desktop includes both).

```bash
cp .env.example .env
# edit .env and set JWT_SECRET to a long random string

docker compose up --build
```

This starts three containers:
- `streamly-mongo` — MongoDB 7, data persisted in a named volume (`mongo-data`)
- `streamly-backend` — Express API on `http://localhost:5000`, auto-restarts on file changes via nodemon
- `streamly-frontend` — Vite dev server on `http://localhost:5173`, hot-reloads on file changes

Your local `backend/` and `frontend/` folders are bind-mounted into the containers, so edits on your machine take effect immediately — only `node_modules` stays inside the container (via anonymous/named volumes) so host and container dependency trees don't collide.

**Seed the catalog** (once the containers are up):
```bash
docker compose exec backend npm run seed
```

Then open `http://localhost:5173`.

**Other useful commands:**
```bash
docker compose logs -f backend     # tail backend logs
docker compose down                # stop and remove containers
docker compose down -v             # also wipe the mongo-data volume
docker compose up --build          # rebuild after changing package.json
```

**Production-style build:** `frontend/Dockerfile.prod` builds the static assets and serves them with nginx (which also proxies `/api/*` to the backend service) instead of running the Vite dev server. Swap it in via `docker compose build frontend --file frontend/Dockerfile.prod` or reference it directly in a separate `docker-compose.prod.yml` if you go that route — the dev compose file above is tuned for local iteration, not deployment.

### Option B: Run natively (no Docker)

Requires Node.js 18+ and a MongoDB instance — either [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier is fine) or a local `mongod`.

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your connection string, and JWT_SECRET to any long random string
npm run seed    # loads the sample catalog into MongoDB
npm run dev     # starts the API on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # starts the app on http://localhost:5173
```

Open `http://localhost:5173`, create an account, and browse.

## API reference

| Method | Route                        | Auth | Description                          |
|--------|-------------------------------|------|---------------------------------------|
| POST   | `/api/auth/register`          | –    | Create account, returns JWT           |
| POST   | `/api/auth/login`              | –    | Sign in, returns JWT                  |
| GET    | `/api/auth/me`                 | ✓    | Current user profile                  |
| GET    | `/api/movies`                  | –    | List movies (`?genre=`, `?type=`)     |
| GET    | `/api/movies/featured`         | –    | Random featured movie (for the hero)  |
| GET    | `/api/movies/trending`         | –    | Trending titles                       |
| GET    | `/api/movies/genres/list`      | –    | Distinct genre list                   |
| GET    | `/api/movies/search?q=`        | –    | Full-text search                      |
| GET    | `/api/movies/my-list`          | ✓    | Current user's saved list             |
| POST   | `/api/movies/:id/my-list`      | ✓    | Toggle a title in/out of My List      |
| GET    | `/api/movies/:id`               | –    | Single movie detail                   |

## Where to take it next

- **Real content**: hook the seeder (or an admin route) up to the [TMDB API](https://www.themoviedb.org/documentation/api) for metadata, and a video host (Mux, Cloudflare Stream, S3 + CloudFront) for playback
- **Profiles**: the `User` model already supports multiple profiles — build a profile-picker screen before Browse
- **Continue watching**: track playback position per user/title and add a row for it
- **Recommendations**: a simple starting point is "more like this" by shared genre; a real system would use watch history
- **Payments**: Stripe Billing for subscription tiers
- **Deployment**: backend to Render/Railway/Fly.io, frontend to Vercel/Netlify, MongoDB Atlas for the database


### Streamly — Full-Stack Netflix Clone
*React, Node.js, Express, MongoDB, Docker* | Sep 2026 – Present
🔗 [Live Demo](https://mern-netflix-clone-psi.vercel.app/) 

- Built and deployed a full-stack MERN streaming platform with **JWT-authenticated** accounts, live in production across a **3-service stack** (Vercel, Render, MongoDB Atlas)
- Containerized the entire dev environment with **Docker Compose**, orchestrating MongoDB, the Express API, and the Vite frontend with hot-reload across all 3 services
- Implemented full-text search, genre-based filtering, and a persistent per-user watchlist over a **100-title** synthetic catalog using MongoDB text indexes and a RESTful API
- Designed a custom **glassmorphism UI** in React, then independently diagnosed and resolved production-specific issues (CORS origin mismatches, SPA routing fallbacks, environment-variable scoping) to ship a fully working live deployment