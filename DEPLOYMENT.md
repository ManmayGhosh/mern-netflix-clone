# Deploying Streamly

Three pieces, three free-tier-friendly hosts:

| Piece | Host | Why |
|---|---|---|
| MongoDB | [MongoDB Atlas](https://www.mongodb.com/atlas) | Managed, free M0 tier, no server to maintain |
| Backend (Express API) | [Render](https://render.com) | Deploys straight from GitHub, free web service tier, easy env vars |
| Frontend (static build) | [Vercel](https://vercel.com) | Built for Vite/React, instant CDN + SSL, generous free tier |

This isn't the only combination that works — Railway or Fly.io are fine Render alternatives, Netlify is a fine Vercel alternative — but this trio has the least setup friction.

You'll need your code in a **GitHub repo** first, since both Render and Vercel deploy by connecting to a repo.

```bash
cd netflix-clone
git init
git add .
git commit -m "Initial commit"
gh repo create streamly --public --source=. --push   # or push to a repo you created on github.com
```

---

## 1. Database — MongoDB Atlas

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas), create a new project, then **Build a Database** → pick the free **M0** tier.
2. **Database Access** → add a database user with a password (not your Atlas login — a separate DB user).
3. **Network Access** → add IP address `0.0.0.0/0` (allow from anywhere). Render's IPs aren't static on the free tier, so this is the practical option; Atlas still requires the username/password to connect.
4. Once the cluster is up, click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Add your database name before the `?`: `.../netflix-clone?retryWrites=true...`

Keep this string handy — it's your `MONGO_URI`.

---

## 2. Backend — Render

1. [render.com](https://render.com) → **New → Web Service** → connect your GitHub repo.
2. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance type**: Free
3. **Environment** tab, add:
   | Key | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string — generate one with `openssl rand -base64 32` |
   | `CLIENT_URL` | leave as `http://localhost:5173` for now, you'll update this after step 3 |
   | `NODE_ENV` | `production` |
4. Deploy. Once it's live, Render gives you a URL like `https://streamly-api.onrender.com`. Confirm it's up: visit `https://streamly-api.onrender.com/api/health` — should return `{"status":"ok"}`.
5. **Seed the production database** — from the Render dashboard, open the **Shell** tab for your service and run:
   ```bash
   npm run seed
   ```
   (Or run it locally once, pointing `MONGO_URI` in your local `.env` at the same Atlas cluster.)

> **Free tier note:** Render's free web services spin down after ~15 minutes of inactivity and take ~30–50s to wake back up on the next request. Fine for a demo/portfolio project; for something that needs to always respond instantly, upgrade to a paid instance (~$7/mo) or use Railway/Fly.io instead.

---

## 3. Frontend — Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the same GitHub repo.
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://streamly-api.onrender.com/api` (your Render URL from step 2, + `/api`) |
4. Deploy. Vercel gives you a URL like `https://streamly.vercel.app`.

---

## 4. Close the loop — update CORS

Now that you have your real frontend URL, go back to **Render → your backend service → Environment**, and set:

```
CLIENT_URL=https://streamly.vercel.app
```

(You can list more than one, comma-separated, e.g. `https://streamly.vercel.app,http://localhost:5173` if you still want local dev to work against the same deployed backend.)

Save — Render will redeploy automatically. Open your Vercel URL, sign up, and you should be browsing your live catalog.

---

## Custom domain (optional)

Both Vercel and Render support custom domains with automatic SSL, free:
- **Vercel**: Project → Settings → Domains → add your domain, update your DNS records as instructed.
- **Render**: Service → Settings → Custom Domains → same idea.

If you point a custom domain at the frontend (e.g. `streamly.yourdomain.com`), remember to add that exact domain to `CLIENT_URL` on the backend too, or CORS will block it.

---

## Checklist if something doesn't work

- **Blank page / network errors in browser console**: check `VITE_API_URL` is set correctly on Vercel and that you redeployed after adding it (env var changes need a redeploy to take effect in a static build).
- **CORS errors**: the `CLIENT_URL` on Render must exactly match your frontend's origin, including `https://` and no trailing slash.
- **"Cannot connect to MongoDB"**: double check the Atlas Network Access list includes `0.0.0.0/0`, and that the password in `MONGO_URI` doesn't contain characters that need URL-encoding (`@`, `:`, `/` etc. — regenerate the DB user password without special characters if unsure).
- **Empty catalog after deploy**: you likely deployed but didn't run `npm run seed` against the production database — see step 2.5.
