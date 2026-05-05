# KorUz / Optom Korea — Monorepo PWA

Cosmetics inventory PWA (Korea → Uzbekistan): Ionic mobile client + NestJS API.

## Structure

| Path | Description |
|------|-------------|
| `apps/mobile` | React 19 + Ionic 8 (Vite), PWA |
| `apps/api` | NestJS + Mongoose |
| `packages/types` | Shared TypeScript interfaces |

## Local development

```bash
pnpm install
pnpm dev:mobile   # http://localhost:5173
pnpm dev:api      # http://localhost:4000
pnpm build:all
```

## Deployment (Contabo VPS)

Production layout on the server: `/opt/optomkorea` (API dist, mobile static build, `packages/types`, persistent `uploads/`). nginx serves the SPA and `/uploads/`, and proxies `/api/` to the Nest app on port 4000. MongoDB runs on the same host as a **single-node replica set `rs0`** (required for transactions).

### One-time server bootstrap

From your machine (repo root), after SSH key access as root works:

```bash
ssh root@194.163.181.22 'bash -s' < scripts/setup-server.sh
```

Optional: override the IP embedded in nginx `server_name` if it changes:

```bash
SERVER_IP=203.0.113.10 ssh root@YOUR_HOST 'bash -s' < scripts/setup-server.sh
```

### GitHub Actions

Workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml). It builds on `ubuntu-latest`, writes `apps/api/.env` from secrets, rsyncs artifacts to the VPS, runs `pnpm install --filter @koruz/api... --prod`, and `pm2 startOrReload` using [apps/api/ecosystem.config.cjs](apps/api/ecosystem.config.cjs).

**Repository secrets**

| Secret | Purpose |
|--------|---------|
| `SSH_HOST` | VPS hostname/IP |
| `SSH_USER` | SSH user (e.g. `root`) |
| `SSH_PRIVATE_KEY` | Private key (PEM) |
| `JWT_SECRET` | JWT signing |
| `JWT_EXPIRES_IN` | JWT TTL (e.g. `7d`) |
| `TELEGRAM_BOT_TOKEN` | Telegram login verification |
| `TELEGRAM_BOT_NAME` | Vite `VITE_TELEGRAM_BOT_NAME` at mobile build time |
| `CLIENT_URL` | CORS origin (`http://YOUR_IP` until HTTPS, then `https://optomkoreya.uz`) |
| `MONGODB_DB_NAME` | Database name (e.g. `optom_korea`) |

`PORT` (4000) and `MONGODB_URI` (local replica set) are set in the workflow; uploads stay under `/opt/optomkorea/uploads` and are not overwritten by deploy.

### HTTPS after DNS

When `optomkoreya.uz` points at the VPS:

```bash
certbot --nginx -d optomkoreya.uz -d www.optomkoreya.uz --non-interactive --agree-tos -m YOUR_EMAIL --redirect
```

Then set GitHub secret `CLIENT_URL` to `https://optomkoreya.uz` and re-run the deploy workflow.

### Verify

```bash
curl -sS -o /dev/null -w "%{http_code}" http://194.163.181.22/api/products
```

Expect `200` (or another successful code if the route requires auth). Open `http://194.163.181.22/` for the SPA.

## Telegram Mini App (in-app fullscreen)

The mobile app loads [Telegram Web App JS](https://core.telegram.org/bots/webapps) and, when `WebApp.initData` is present, calls `POST /api/auth/telegram-webapp` with `{ initData }` (signature algorithm differs from the Login Widget). The SPA expands the sheet, disables vertical swipe-to-dismiss where supported, enables close confirmation, and maps Telegram’s BackButton to `history.goBack()` on non-tab-root routes.

**BotFather (after deploy)**

1. `/setmenubutton` → your bot → Web App URL `https://optomkoreya.uz/` (or `/` only; the app redirects Telegram users without a JWT to `/auth` for auto-login).
2. `/newapp` → short name (e.g. `kor`) → same Web App URL → shareable link `https://t.me/<bot_username>/kor`.

`/setdomain` must remain the bare hostname (e.g. `optomkoreya.uz`) for the Login Widget in normal browsers.
