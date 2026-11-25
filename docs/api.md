# API

This repo does not implement HTTP routes. It calls a remote API. The contract below is exactly what `src/api/` sends. Server-only rules that are not visible in this code are marked.

## Base URL and transport

- `API_BASE_URL` = `import.meta.env.VITE_API_BASE_URL` with a trailing slash removed (`src/api/config.js`).
- Local `.env.example`: `VITE_API_BASE_URL=/v1`.
- Dev server proxies `/v1` and `/health` (`vite.config.js`).
- `fetch` uses `credentials: 'include'` and `Accept: application/json` (or `*/*` for blobs).
- JSON body: `Content-Type: application/json`. `FormData` is sent without that header.
- If a token is in memory: `Authorization: Bearer <token>`.
- Empty strings anywhere in a JSON body become `null` (`emptyStringsToNull` in `src/api/client.js`).
- Query builder skips `undefined`, `null`, and `''`. Arrays are repeated keys.

## Envelope

Assumed by `src/api/normalize.js`:

```text
list:   { data: [], meta: { page, pageSize, total } }
item:   { data: {} }
lookup: { data: [] }   normalized to an array
```

The client also accepts a raw array, or `items` / `results`, if `data` is missing.

## Errors

`ApiError` (`src/api/client.js`): `message`, `status`, `code`, `fieldErrors`.

- `message` from `payload.message`, string `detail`, or the first `detail[].msg`.
- `fieldErrors` from `payload.errors` or FastAPI-style `detail[].loc` / `msg` (the `body` and `query` segments are stripped).
- 401 except `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password`, and `GET /auth/me`: token cleared and `onUnauthorized` runs (hard redirect to `/login`).
- Network failure: status `0`, message about being unable to reach the server.

## Auth

All in `src/api/system.js` except the transport rules above.

| Method | Path | Body | Consumer |
|---|---|---|---|
| POST | `/auth/login` | `{ username, password }` | `LoginPage` |
| POST | `/auth/logout` | none | `SessionContext.signOut` |
| GET | `/auth/me` | | `SessionProvider` on load |
| POST | `/auth/forgot-password` | `{ email }` | `ForgotPasswordPage` |
| POST | `/auth/reset-password` | `{ token, password }` | `ResetPasswordPage` |

Login is expected to return `data.user` and `data.token` and to set cookie `fh_session`. TODO / NEEDS VERIFICATION: cookie `Max-Age` and `SameSite` are server-defined; this client does not parse `Set-Cookie`.

`data.token` on any successful JSON response is stored (`captureToken`).

## Standard CRUD

`createResource` in `src/api/resource.js`. List query: `page`, `pageSize`, `search`, `sortBy`, `sortDir`, plus whatever filters the screen sets.

| Resource key | Path | Service |
|---|---|---|
| companies | `/companies` | `src/api/catalog.js` |
| brands | `/brands` | catalog |
| models | `/models` | catalog |
| categories | `/categories` | catalog |
| subcategories | `/subcategories` | catalog |
| products | `/products` | catalog |
| warehouses | `/warehouses` | `src/api/inventory.js` |
| branches | `/branches` | inventory |
| practices | `/practices` | inventory |
| suppliers | `/suppliers` | inventory |
| invoices | `/invoices` | `src/api/sales.js` |
| fullTests | `/full-tests` | sales |
| payments | `/payments` | sales |
| refunds | `/refunds` | sales |
| purchases | `/purchases` | sales |
| patients | `/patients` | `src/api/people.js` |
| leads | `/leads` | people |
| appointments | `/appointments` | people |
| communications | `/communications` | people |
| documents | `/documents` | people |
| medicalAids | `/medical-aids` | `src/api/medical.js` |
| medicalAidPlans | `/medical-aid-plans` | medical |
| icdCodes | `/icd-codes` | medical |
| procedureCodes | `/procedure-codes` | medical |
| claims | `/claims` | medical |
| users | `/users` | `src/api/system.js` |
| roles | `/roles` | system |

Also created but not in the `resources` map: `notesApi` `/notes`, `activitiesApi` `/activities` (`src/api/people.js`). Generic selects cannot see them unless a page imports the service directly. Notes and activity panels do that.

Lookup: `GET {path}/lookup` with the same filter params. Used by `ResourceSelect` / `AsyncSelect` via `resources[key].lookup`.

PUT sends only the JSON keys in the body. Screens rely on the server leaving omitted fields unchanged. TODO / NEEDS VERIFICATION: confirm every resource on the deployed API treats PUT as a merge. `ResourceListPage` and partial updates such as appointment cancel (`{ status: 'cancelled' }`) depend on that.

DELETE is `http.delete` and ignores the body. 204 is parsed as `null`.

## Extra endpoints

### Stock — `src/api/inventory.js`

| Method | Path | Used by |
|---|---|---|
| GET | `/stock/summary` | `StockPage`, query `branchId` |
| GET | `/stock/levels` | `StockPage` list |
| GET | `/stock/movements` | `StockPage` |
| GET | `/stock/serials` | invoice editor. Query includes `warehouseId`, `status`, `pageSize`; product filter is applied client-side on the returned rows (`productId` may also be sent) |
| POST | `/stock/availability` | `{ warehouseId, lines: [{ productId, quantity }] }` |
| POST | `/stock/adjustments` | `AdjustQuantityModal` |

### Invoices — `src/api/sales.js`

| Method | Path | Used by |
|---|---|---|
| POST | `/invoices/calculate` | editor preview |
| POST | `/invoices/:id/convert` | list, detail, editor when saving a non-invoice as invoice |
| POST | `/invoices/:id/cancel` | detail, only offered when unpaid |
| GET | `/invoices/:id/history` | detail History tab |
| GET | `/invoices/:id/pdf` | `downloadFile` blob |
| POST | `/invoices/:id/email` | detail, body `{}` or optional payload |

Create/update body built in `InvoiceEditorPage` `toPayload`: `type`, `patientId`, `branchId`, `warehouseId`, `date`, `dueDate`, `reference`, `notes`, `icdCodeIds`, `lines[]` with `productId`, `quantity`, `unitPrice`, `vatRate`, `icdCodeIds`, `procedureCodeId`, `fullTestId`, `serialNumbers`.

### Purchases

`POST /purchases/:id/complete` after a draft save (`PurchaseFormPage`).

### Leads

`POST /leads/:id/convert`.

### Documents

`POST /documents/upload` multipart: `file`, `name`, `type`, and owner keys.

`GET /documents/:id/file` via `openFile` / `downloadFile` (`documentsApi.open`, `documentsApi.download`).

`createResource('/documents')` also exposes PUT and POST `/documents`. The documents UI does not call those. TODO / NEEDS VERIFICATION: whether the server implements them.

### ICD and claims

`POST /icd-codes/import` multipart field `file` (`IcdCodesPage`). Prefers the original Hearing Aid Labs CSV (082/083 columns included). Falls back to remapping headers to `code, description, category, status` if the server import returns nothing.

`POST /medical-aids/import` multipart field `file` (`MedicalAidsListPage`). Falls back to `POST/PUT /medical-aids` and `/medical-aid-plans` with structured plan fields (`cycleYears`, `hearingAidBenefitZar`, …) plus `schemeType` on the scheme.

`POST /procedure-codes/import` multipart field `file` (`ProcedureCodesPage`). Falls back to `POST/PUT /procedure-codes` with `practiceType`, `serviceCategory`, `defaultPrice` (COIDA tariff), and related claim-code columns.

`PATCH /claims/:id/status` body `{ status, approvedAmount?, comment? }` (`claimsApi.updateStatus`). Claim create/update uses the normal POST/PUT and `toPayload` in `src/features/medical/resources.jsx`.

### System

| Method | Path | Used by |
|---|---|---|
| GET | `/permissions` | `RolesPage` catalogue `{ module, label, actions: [{ key, label }] }` |
| GET | `/dashboard/summary` | `DashboardPage` |
| GET | `/notifications` | `Header` |
| POST | `/notifications/:id/read` | notification click |
| POST | `/notifications/read-all` | client exists; header UI does not call it today |
| GET | `/settings/:section` | `SettingsPage` |
| PUT | `/settings/:section` | sections `general`, `invoice`, `product`, `system` |
| GET | `/access-requests` | `AccessRequestsPage`. Query `status`, `page`, `pageSize`, `search`, `sortBy`, `sortDir`. List rows should include `requestedAt`, `userName`, `email`, `ipAddress`, `operatingSystem`, `browser`, `status`, `warehouseName` |
| POST | `/access-requests/:id/decision` | `{ decision: "approved" \| "rejected" }`. Approving must allow that user from that request's IP only |
| GET | `/reports/payments` | `PaymentReportPage`. Query `branchId`, `from` (exclusive), `to` (inclusive), `method` |

### Cash upliftments — `src/api/sales.js`

| Method | Path | Used by |
|---|---|---|
| GET | `/cash-upliftments` | list on `CashUpliftmentsPage` |
| GET | `/cash-upliftments/preview` | required query `branchId`. Opening preview does not close the period |
| POST | `/cash-upliftments` | `{ branchId, collectedAmount, cashFloat, notes }`. Server recalculates `systemAmount` |

WhatsApp conversation routes (`/whatsapp/conversations`, templates, send) are **not** on the live API. Communications still uses `/communications`.

User create response may include `temporaryPassword`. `ResourceListPage` shows it once if present.

## Who calls what

Generic pages never import URLs. They use `resources[config.resource]` from `src/api/index.js`. If you add a resource, export it from the area module and add it to that map, or selects and `ResourceListPage` cannot see it.

## Mock mode

`VITE_USE_MOCK_API=true` routes `call()` to `src/mocks/mockAdapter.js`. Handlers that are missing reject with status 501. Mocks do not enforce the remote stock or payment rules beyond a few hardcoded checks (short stock on invoice create/convert, cancel when `balance < total`, purchase complete serial check).
