# Development

## Setup

```bash
npm install
```

Node is required. The repo does not pin a Node version in `package.json` or `.nvmrc`. TODO / NEEDS VERIFICATION: the exact Node version used in production.

Copy env from the example if you do not already have `.env`:

```bash
cp .env.example .env
```

## Run locally

```bash
npm run dev
```

Script: `vite` (`package.json`). `vite.config.js` asks for port **5173**. If that port is taken, Vite prints the next port.

Open the URL Vite prints. Sign-in is `POST /auth/login` through the proxy. Do not put passwords in docs, tickets, or source.

The dev process must be allowed to reach `API_ORIGIN` in `vite.config.js`. A sandboxed process fails the proxy with `EPERM` / 502 even when the API is healthy.

## Build

```bash
npm run build
```

Output: `dist/`. `dist/` is gitignored. This is a static SPA. Nothing in the repo serves it.

```bash
npm run preview
```

Serves the production build locally (`vite preview`).

## Test

There is no test script, no `tests/` directory, and no Playwright/Vitest config. Do not claim a unit test run passed.

Check a change by running the app and walking the affected route. For invoice work that is: sidebar Invoice (not under Sales) → list → filter → open a quote → open `/invoices/new?type=invoice` → confirm Stock and Patients still load.

## Lint

```bash
npm run lint
```

Script: `oxlint`. There is no separate ESLint or Prettier config in the project root.

## Environment

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | For the real API | Use `/v1` locally so the cookie stays first-party |
| `VITE_USE_MOCK_API` | Optional | `true` = in-memory fixtures, no login wall. `false` = remote API. Unset + empty base URL = mocks |

`vite.config.js` `API_ORIGIN` is the proxy target. It is not read from `.env`. Changing the API host means editing that constant (or teaching the config to read env — that would be a new behavior, not the current one).

`.env` is **not** covered by `.gitignore` today (only `*.local`). Do not put secrets in `.env`.

`docs/` **is** gitignored.

## Git

This workspace has **no `.git` directory**. `git status` cannot succeed here until a repository is created. Do not `git init` as a side effect of a feature task.

When a repo exists:

- `docs/` must stay ignored (see `.gitignore`).
- Do not commit `.env` if it ever contains secrets.
- Commit only when the user asks. Do not force-push. Do not skip hooks.

No branch naming convention is defined in the repo.

## Deployment

The frontend is a static Vite app on Vercel (`vercel.json`).

Vercel environment variables, set before the build:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `/v1` |
| `VITE_USE_MOCK_API` | `false` |

`API_ORIGIN` is optional. `middleware.js` defaults to `http://103.55.104.142:5035`. Set `API_ORIGIN` on Vercel only when that host changes. Do not put the HTTP host in `VITE_API_BASE_URL`.

`middleware.js` proxies `/v1` and `/health` to port **5035**. A `vercel.json` rewrite cannot keep that port: Vercel calls port 80, and nginx there returns 404. Do not add that rewrite back. The browser stays on the HTTPS site. An absolute `http://` base URL is rewritten to its path (`/v1`) when the page is HTTPS, because the browser blocks mixed content.

Redeploy after changing any `VITE_*` variable. Vite inlines those values at build time.

## Debugging

- Browser network: `/v1/...` should be same-origin, status 200, `Set-Cookie` only on login.
- `GET /v1/health` via the proxy should return JSON `status` ok when the API is up. TODO / NEEDS VERIFICATION: exact health JSON; the UI does not call `/health`.
- Session bugs: memory token is empty after refresh; only the cookie can restore `GET /auth/me`.
- Form 422: look at `fieldErrors` keys. They match the last segment of FastAPI `loc`.
- Invoice stock: compare `POST /stock/availability` with the warehouse id on the draft. Quotes should still save when stock is short; final invoices should not, and that rejection comes from the API.
- Mock vs real: the yellow banner in `AppLayout` appears only when `USE_MOCK_API` is true.

## Common problems

| Symptom | Cause |
|---|---|
| “Unable to reach the server.” and the network call is `http://…/v1/auth/me` with provisional headers | Mixed content. Keep `VITE_API_BASE_URL=/v1` |
| Same screen, and `/v1/auth/me` is nginx `404 Not Found` | The proxy hit port 80. `middleware.js` must call port 5035. Remove any `vercel.json` rewrite to that host |
| Login works in curl to the API host but not in the app | Base URL is the absolute API host, so the cookie is cross-site. Use `/v1` + proxy |
| 502 on `/v1` in dev | Vite cannot connect to `API_ORIGIN` (firewall or sandbox) |
| App stuck on “Signing you in…” | `/auth/me` never finishes. Proxy or API down |
| Instant bounce to `/login` | `/auth/me` returned 401. Cookie missing |
| New field not saved from a generic modal | `ResourceListPage` only sends keys listed in `fields` unless `toPayload` is set |
| Last row action menu clipped | Regressing `ActionMenu` back to an in-table popover. It must stay portaled |
| Invoice missing from sidebar / showing under Sales | `src/config/navigation.js`. Invoice is a sibling of Inventory / Stock, not a Sales child |

## Safe change process

```text
Read docs/agent.md
  → read the feature and API sections you will touch
  → open only those source files
  → make the smallest change that matches existing patterns
  → npm run lint
  → npm run build   (when the change is more than copy)
  → click through the affected flow and one neighbor (stock, patients, or payments)
  → update docs/ if behavior, routes, or payloads changed
```

Do not refactor unrelated modules in the same change. Do not add a backend inside this repo unless the task explicitly asks for one.
