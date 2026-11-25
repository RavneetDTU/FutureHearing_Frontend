# Architecture

See [agent.md](./agent.md) for the rules. This file is the shape of the system.

## System overview

```text
Browser
  → React SPA (this repo)
      → src/api/client.js  fetch(API_BASE_URL + path, credentials: 'include')
          → dev: Vite proxy /v1 and /health  (vite.config.js)
          → remote Future Hearing HTTP API
              → its own database (not in this repo)
```

Production hosting for this SPA is **not configured in the repo** (no Dockerfile, no Render blueprint, no CI workflow). `npm run build` emits a static `dist/`.

## Frontend layers

```text
index.html
  src/main.jsx
    ToastProvider
      SessionProvider          ← GET /auth/me on mount
        RouterProvider         ← src/router/routes.jsx
          /login | /forgot-password | /reset-password
          AppLayout            ← redirects to /login when the real API has no user
            Sidebar + Header + <Outlet>
```

| Layer | Location | Role |
|---|---|---|
| Routes | `src/router/routes.jsx` | Path → page. `handle.crumb` feeds breadcrumbs |
| Navigation | `src/config/navigation.js` | Sidebar groups. Not generated from the router |
| Feature pages | `src/features/<area>/` | Screens. Invoice UI is under `sales/` even though the menu item is top-level |
| Generic CRUD | `src/components/resource/ResourceListPage.jsx` | List pages driven by a config object |
| CRM panels | `src/components/crm/` | Notes, documents, appointments, communications, activity. Reused on patient and lead pages |
| UI kit | `src/components/ui/` | Button, DataTable, Modal, PageHeader, StatusBadge, … |
| Forms | `src/components/forms/` + `src/hooks/useForm.js` | Schema-driven fields |
| Status labels | `src/config/statuses.js` | Value → label/tone. Change labels here, not in each page |
| API | `src/api/` | One module per area, barrel `index.js` |
| Mocks | `src/mocks/` | Lazy-loaded only when mocks are on |

There is no Redux, Zustand, React Query, or global cache. Each `useApiQuery` / `useListQuery` owns its own request. Stale responses are ignored via a request id in `useApiQuery`.

## Request lifecycle

```text
useListQuery builds { page, pageSize, search, sortBy, sortDir, ...filters }
  → service.list(params)
    → call()
        if VITE_USE_MOCK_API: src/mocks/mockAdapter.js
        else: http.get(path, { params })
          → credentials: 'include'
          → Authorization: Bearer <memory token> when a token exists
          → JSON parse
          → 401 (except login, forgot, reset, /auth/me): clear token, onUnauthorized → /login
          → non-OK: ApiError { message, status, code, fieldErrors }
          → OK: if body has data.token, keep it in memory
    → normalizeList → { items, total, page, pageSize }
```

`normalizeItem` unwraps `{ data }`. `normalizeArray` unwraps list envelopes to an array (lookups, notifications, history).

Standard resource from `createResource(path)`:

```text
GET    path
GET    path/lookup
GET    path/:id
POST   path
PUT    path/:id
DELETE path/:id
```

Custom actions use `endpoint(mockName, requestFn, normalize)` in the same service file.

## Authentication

```text
POST /auth/login { username, password }
  ← { data: { user, token } }
  ← Set-Cookie: fh_session (httpOnly). The SPA does not read the cookie.
token stored by setAuthToken() in module scope (lost on refresh)
next calls send Bearer + cookie
GET /auth/me restores the user after refresh when the cookie is still valid
POST /auth/logout clears the server session; the client then drops the memory token
```

`AppLayout` while mocks are off:

- loading → splash
- network/server error other than 401 → retry
- no user → `<Navigate to="/login">`

`can(permission)` is true when permission is empty, when `user.permissions` is missing, when the list contains `*`, or when it contains that key. Navigation items set `permission` (for example `invoices.view`, `payments.view`).

There is no refresh-token endpoint in `src/api/system.js`.

## Authorization vs UI

The UI hides buttons. The API is the authority. Do not add a second permission list in the frontend; the catalogue for the roles screen is `GET /permissions`.

## State that is not server data

| State | Where | Lifetime |
|---|---|---|
| Auth token | `src/api/client.js` module variable | Tab lifetime |
| Current user | `SessionContext` | Until 401 or sign-out |
| Selected branch | `SessionContext.branchId` | Tab lifetime. Sent as `branchId` by the dashboard and the invoice list |
| Toasts | `ToastContext` | Transient |
| Form drafts | `useForm` inside the open page | Unmount |

## Routing notes

- Public: `/login`, `/forgot-password`, `/reset-password`
- App: everything else under `AppLayout`
- Unknown paths inside the layout render `NotFoundPage`
- Invoice routes: `/invoices`, `/invoices/new`, `/invoices/:id`, `/invoices/:id/edit`
- Settings: `/settings` and `/settings/:section`

`Sidebar` highlights the longest matching child so `/invoices/new` does not also look like a second active child. Invoice is a single link, not a section.

## UI conventions

- Page title block: `PageHeader` (`eyebrow`, `title`, `description`, `actions`)
- Lists: `Card flush` + `FilterBar` or local toolbar + `DataTable` + `Pagination`
- Row actions: `ActionMenu`, rendered with `position: fixed` in a portal (`ActionMenu.jsx`)
- Status: `StatusBadge` + `src/config/statuses.js`
- Money/dates: `src/utils/format.js` (`en-ZA`, ZAR)
- Server field errors: `form.applyServerErrors(err)` reads `err.fieldErrors`
- Confirm destructive actions with `ConfirmDialog`

## Environment

| Name | Read in | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `src/api/config.js` | Prefix for `fetch`. Local value is `/v1` so the dev proxy is used |
| `VITE_USE_MOCK_API` | `src/api/config.js` | `true` forces mocks. If unset, mocks are used only when the base URL is empty |

`vite.config.js` proxies `/v1` and `/health` to `API_ORIGIN` with `changeOrigin: true`, and pins the dev server to port 5173 (Vite will pick the next port if it is busy).

## What is intentionally not here

- No database client
- No background jobs
- No webhook receiver
- No Twilio/OpenAI/Firebase SDK
- WhatsApp, email, and PDF generation are remote. This app either posts a trigger (`/invoices/:id/email`) or downloads bytes (`/invoices/:id/pdf`, `/documents/:id/file`)
