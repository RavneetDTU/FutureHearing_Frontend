# Future Hearing operations portal — agent guide

READ THIS FILE FIRST.
Then read the other files in `docs/`.
Only after that should you open the source files that the task actually touches.

This folder is a local knowledge base. It is listed in `.gitignore` and is not application source.

| File | Use it for |
|---|---|
| [agent.md](./agent.md) | Start here: rules, map, warnings |
| [architecture.md](./architecture.md) | How the SPA is built and how a request travels |
| [features.md](./features.md) | What each module does and which files own it |
| [api.md](./api.md) | Every HTTP call this frontend makes |
| [database.md](./database.md) | Where data lives (not in this repo) |
| [integrations.md](./integrations.md) | The remote API, cookie session, and integrations that are only logged in the UI |
| [development.md](./development.md) | Install, run, lint, build, and how to change code safely |
| [backend-requests.md](./backend-requests.md) | Spec to send the backend team: IP login approval + 2026 catalogue fields |

## Project overview

Future Hearing is a hearing-aid practice operations portal: patients, products, stock, invoices (quotes, pro formas, tax invoices), purchases, medical-aid claims, leads, and staff access.

This repository is a **frontend only**.

- React 19 + Vite 8 + React Router 7
- JavaScript (not TypeScript)
- No server, database, ORM, or migrations in this repo
- Persistence is a remote REST API. Locally, Vite proxies `/v1` to that API so the session cookie stays first-party
- A mock adapter in `src/mocks/` exists only when `VITE_USE_MOCK_API=true`. It does not persist anything

## How requests move

```text
Page (src/features, src/router/routes.jsx)
  → hook (useListQuery / useApiQuery / useMutation / useForm)
    → service (src/api/*.js, registered in src/api/index.js)
      → call() in src/api/resource.js
        → mock adapter   OR   fetch in src/api/client.js
          → Vite proxy /v1  →  remote API
```

There are no controllers or services on this side of the network. Business rules that change stock, balances, or numbering are enforced by the remote API. The UI sends the payload and displays the result or the error.

## Rules for future changes

- Do not rewrite a working screen to match a different design system. Reuse `src/components/ui`, `ResourceListPage`, and the existing form field configs.
- Do not add a second HTTP client, a second auth store, or `localStorage` / `sessionStorage` / IndexedDB for session or business data. The token lives in memory. The cookie is `fh_session`.
- Do not invent API paths. Add a method on the existing service in `src/api/` and, if a generic page needs it, register it in `resources` in `src/api/index.js`.
- PUT is a merge. Send only fields the screen intends to change. Empty strings are converted to `null` in `src/api/client.js` before JSON is sent.
- Invoice is a **top-level sidebar item**. Its React files still live under `src/features/sales/`. Do not move invoices back under the Sales menu.
- Do not change Sale/Payments/Refunds, Stock, Products, or Patients when the task is only Invoice, and the reverse.
- Permissions come from `GET /auth/me` (`permissions`, `isAdmin`). Gate navigation with `permission` in `src/config/navigation.js` and actions with `useSession().can`.
- After a behavior or route change, update the matching file in `docs/`.

## Data comes from the database through the API

The browser is not a store. Every list, detail, and mutation must come from the remote database via the live `/v1` API.

- Do not keep business data in `window`, in-memory caches, `localStorage`, `sessionStorage`, IndexedDB, Cache Storage, service workers, or any other browser cache.
- Do not seed, invent, or keep a client-side copy of products, stock, invoices, patients, or similar as a source of truth. After a write, refetch from the API and show that result.
- The in-memory auth token and `SessionContext` user are session only, not a data cache. Mock data is allowed only when `VITE_USE_MOCK_API=true`.

When asked to build a new feature, check [api.md](./api.md) and the live OpenAPI first. If the feature needs an endpoint that does not exist, **stop and tell the user** before building a fake:

- what the feature needs
- the HTTP method and path
- the request body and response shape (as far as the UI knows)

The user will pass that to the backend team. Do not invent the API, dummy records, or a window/cache workaround while waiting. Wire the UI only after the endpoint exists.

## Feature map

```text
Auth            LoginPage / SessionContext     authApi                 remote users/sessions
Dashboard       DashboardPage                  dashboardApi            remote aggregates
Products        features/products + catalog    productsApi + lookups   remote catalog
Stock           StockPage                      stockApi                remote stock (derived)
Invoice         features/sales/Invoice*        invoicesApi, paymentsApi remote documents
Sales extras    full tests, payments, refunds  fullTests/payments/refunds APIs
Purchases       features/purchases             purchasesApi            remote purchases + stock on complete
Patients        features/patients              patientsApi + panels    remote patients
Medical aid     features/medical               medical* + claims APIs  remote claims
Leads           features/leads                 leadsApi                remote leads
Admin           users, roles, settings         users/roles/settings    remote
```

There is no separate Sale document type in this frontend. Commercial documents are invoices with `type`: `quote` | `proforma` | `invoice`.

## Critical files

| File | Responsibility |
|---|---|
| `src/main.jsx` | Mounts toast + session + router |
| `src/router/routes.jsx` | Every route |
| `src/config/navigation.js` | Sidebar. Invoice is its own item |
| `src/api/client.js` | fetch, cookie, bearer token, 401, 422, empty-string → null, file download |
| `src/api/resource.js` | `createResource`, mock vs real switch |
| `src/api/index.js` | `resources` map used by generic pages and selects |
| `src/context/SessionContext.jsx` | Current user, branch filter, sign-out, `can()` |
| `src/components/resource/ResourceListPage.jsx` | Generic list/create/edit/delete. Strips non-field keys on save |
| `src/components/ui/ActionMenu.jsx` | Row menus. Portaled so the last table row is not clipped |
| `vite.config.js` | Dev proxy for `/v1` and `/health` |
| `src/api/config.js` | `VITE_API_BASE_URL`, `VITE_USE_MOCK_API` |

## Critical warnings

- `src/api/client.js` and `src/api/resource.js` are shared by every screen. A small change here breaks every module.
- `ResourceListPage` `toPayload` default sends only configured field names. A new field that is not in `fields` will be dropped unless the config sets `toPayload`.
- Final invoices (`type === 'invoice'`) are not editable in `InvoiceEditorPage`. Quotes and pro formas are.
- Quotes and pro formas must not be treated as stock reservations. Stock is checked live and is consumed when a final invoice is created or a document is converted.
- Cancelling an invoice is offered only when `balance === total` (no payments). The API restores stock.
- A payment larger than `invoice.balance` is rejected in `RecordPaymentModal` before the request, and the API rejects it as well.
- `USE_MOCK_API` skips the login gate in `AppLayout`. Do not “fix” that without checking both modes.
- Do not persist `data.token`. It is memory-only on purpose.
- `.env` is not listed in `.gitignore` (only `*.local` is). Do not commit secrets into it. Current values are non-secret URLs/flags.

## Debugging

1. Read the feature section in [features.md](./features.md) and the endpoint in [api.md](./api.md).
2. Confirm `VITE_USE_MOCK_API` is `false` and `VITE_API_BASE_URL=/v1` if the bug is “mock data” or “API not reached”.
3. Confirm Vite was started with network access so the proxy in `vite.config.js` can reach `API_ORIGIN`. A sandbox `EPERM` looks like a 502 on `/v1`.
4. For a save error, inspect `ApiError.message` and `fieldErrors` (FastAPI `detail[]` is mapped in `client.js`).
5. For a blank app after refresh, call `GET /auth/me`. 401 means the cookie/token is gone; `SessionContext` sends the user to `/login`.
6. For a missing sidebar item, check `permission` against `user.permissions`. `*` or a missing permissions array allows the item (`can()` returns true when `permissions` is absent).

## Documentation maintenance

When you add a module, change a route, change a payload, or change a business rule the UI depends on, update the relevant file in `docs/` in the same change. Do not paste large source listings into these files.
