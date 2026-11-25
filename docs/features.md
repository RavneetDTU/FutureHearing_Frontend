# Features

Each module below is implemented in this frontend and backed by the remote API. “Database” means the remote service, not a table in this repo. Endpoint shapes are in [api.md](./api.md).

Shared list pattern: a `*Config` object (columns, filters, fields, permissions, optional `toPayload`) consumed by `ResourceListPage`.

## Authentication

### Purpose
Staff sign-in, password reset, and a sliding session.

### Frontend
`src/features/auth/LoginPage.jsx`, `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, `src/context/SessionContext.jsx`, `src/components/layout/AppLayout.jsx`, `Header.jsx` (sign out).

### Backend
Remote only. Client: `authApi` in `src/api/system.js`.

### Database
Remote session + user. Cookie name expected by this app: `fh_session`.

### APIs
`POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`.

### Business logic
Login response `{ user, token }` is passed to `setUser`. Token stays in memory; cookie is sent with `credentials: 'include'`. Forgot-password may return `resetToken` when email is not configured; the page links to `/reset-password?token=`. Reset compares the two password fields locally, then posts `{ token, password }`.

### Data flow
```text
Login form → authApi.login → client stores token → SessionContext stores user → /dashboard
Refresh → authApi.me (cookie) → user or redirect /login
```

### Edge cases
401 on login is shown as “Incorrect username or password.” If login returns `{ access: "pending", requestId, message }` and no token (HTTP 200 or 403), the form stays on `/login` and shows a waiting-for-approval alert. The server must allow that user only from approved IPs; a new IP creates another request. Administrators list requests at Users & access → Access requests (`AccessRequestsPage`: date, user, IP, OS, browser, status, warehouse, approve/reject). 401 on other calls (not `/auth/me`) clears the session and hard-navigates to `/login`. Mock mode never redirects to login.

## Cash upliftments and payment totals

### Purpose
Compare server-calculated cash in the safe with the amount collected, and show payment totals without summing list pages.

### Frontend
`src/features/sales/CashUpliftmentsPage.jsx`, `PaymentReportPage.jsx`.

### APIs
`GET/POST /cash-upliftments`, `GET /cash-upliftments/preview?branchId=`, `GET /reports/payments`.

### Business logic
Preview is read-only and does not move `previousUpliftmentAt`. Create sends `branchId`, `collectedAmount`, `cashFloat`, `notes` only. Difference in the form is a display of collected minus preview system amount; the server stores its own difference. 409 on a concurrent submit is shown as an error.

## Access requests

### Purpose
Administrators approve or reject sign-ins from outside the office network.

### Frontend
`src/features/admin/AccessRequestsPage.jsx`. Admin-only nav and route.

### APIs
`GET /access-requests`, `POST /access-requests/:id/decision`.

### Files
`src/api/client.js`, `src/api/system.js`, `src/context/SessionContext.jsx`.

### Careful
Do not store the token in web storage. Do not treat `/auth/me` 401 as a global logout storm (`AUTH_PUBLIC` plus `/auth/me` are excluded in `client.js`).

## Dashboard

### Purpose
Branch-scoped operations overview.

### Frontend
`src/features/dashboard/DashboardPage.jsx`.

### APIs
`GET /dashboard/summary?branchId`.

### Business logic
`branchId` comes from the header branch switcher (`SessionContext`). Revenue figures are displayed as returned; the card subtitle states they are VAT-inclusive invoice totals. Stats, `revenueSeries`, branch rows, stock alerts, and recent invoices/patients/claims are rendered from that one payload. Missing fields render as empty, not as client-side totals.

### Files
`DashboardPage.jsx`, `src/api/system.js` (`dashboardApi`).

## Products and catalog

### Purpose
Standard (stocked) and service products, plus company → brand → model and category → subcategory.

### Frontend
`src/features/products/*`, `src/features/catalog/resources.jsx`, routes under `/products`, `/companies`, `/brands`, `/models`, `/categories`, `/subcategories`.

### APIs
`createResource` for `/products`, `/companies`, `/brands`, `/models`, `/categories`, `/subcategories`.

### Business logic
`getProductFields` / `toProductPayload` in `src/features/products/productFields.js` send different bodies for `standard` vs `service`. Service products skip company/brand/stock fields. `trackSerials` applies to standard products. Stock on hand is not edited on the product form.

### Edge cases
Product type cannot be changed after create (`ProductFormPage` disables the switch when editing).

### Files
`ProductFormPage.jsx`, `ProductDetailPage.jsx`, `ProductsListPage.jsx`, `productFields.js`, `src/api/catalog.js`.

## Stock

### Purpose
Show on-hand, low, and out-of-stock quantities and record manual adjustments. This is not the reference app’s empty Stocktake module; this screen is a live stock overview.

### Frontend
`src/features/inventory/StockPage.jsx`, `AdjustQuantityModal.jsx`. Sidebar label: “Inventory / Stock”.

### APIs
`stockApi` in `src/api/inventory.js`: `/stock/summary`, `/stock/levels`, `/stock/movements`, `/stock/serials`, `POST /stock/availability`, `POST /stock/adjustments`.

### Business logic
Quantities are not stored as a field the UI increments. Purchases, final invoices, cancellations, and adjustments change stock on the server. Availability checks on the invoice editor are debounced and only consider `type === 'standard'` lines.

### Edge cases
Serials for an invoice line come from `GET /stock/serials` filtered by warehouse and product. Blank serials mean “server assigns the oldest available”.

### Files
`StockPage.jsx`, `src/api/inventory.js`.

## Invoice

### Purpose
Quotes, pro formas, and final tax invoices. Separate sidebar item, not a child of Sales.

### Frontend
`src/features/sales/InvoicesListPage.jsx`, `InvoiceEditorPage.jsx`, `InvoiceDetailPage.jsx`, `RecordPaymentModal.jsx`, `ProductPickerModal.jsx`, `FullTestModal.jsx`.

Routes in `src/router/routes.jsx`. Menu entry in `src/config/navigation.js` (`label: 'Invoice', to: '/invoices'`), placed after Inventory / Stock.

### APIs
`invoicesApi` and `paymentsApi` in `src/api/sales.js`.

### Business logic
- Document `type`: `quote` | `proforma` | `invoice`.
- Quote and pro forma do not reserve stock. Choosing Invoice means stock is required; the server can reject the save.
- Editor type cards set `header.type`. Save posts that type. Editing a non-final document and switching the card to Invoice also calls `POST /invoices/:id/convert`.
- Final invoices cannot be opened in the editor.
- List shows date, reference (`number`), branch/warehouse, patient, type, total, paid (`total - balance` unless `paidAmount` is present), balance, and a payment badge from `invoicePaymentStatus` in `src/utils/format.js`.
- Stage chips filter with query `type`. Search hits `search`. Header branch id is sent as `branchId` when set.
- Detail: PDF download, email, print (`?print=1` triggers `window.print`), edit (non-final), convert, cancel (final, unpaid, not cancelled), record payment when `balance > 0`.
- Payment methods in the UI: card, cash, EFT, medical aid. Amount cannot exceed balance.
- Full Test adds one service line per template service (`fullTestId` set) after the user picks ICD-10 codes.
- ICD import and procedure codes are used on lines; they are not part of the Sales menu.

### Data flow
```text
Add (type) → /invoices/new?type=
  → patient, branch, warehouse, lines
  → POST /invoices/calculate (debounced preview)
  → POST /stock/availability (standard lines)
  → POST /invoices
View → GET /invoices/:id
  → POST /invoices/:id/convert | /cancel | /email
  → GET  /invoices/:id/pdf
  → POST /payments
```

### Edge cases
Cancel is hidden unless `Number(balance) === Number(total)`. Convert from the list is hidden when `type === 'invoice'`. Overdue is a status badge when `status === 'overdue'`, otherwise payment status is derived from balance vs total.

### Files
The three invoice pages, `src/api/sales.js`, `src/utils/format.js` (`invoicePaidAmount`, `invoicePaymentStatus`), `src/config/statuses.js` (`invoice`, `invoiceType`, `invoicePayment`).

### Careful
Do not put this item back under the Sales children. Do not deduct stock in the browser. Patient invoice tabs reuse `invoicesConfig.columns` from `InvoicesListPage.jsx`.

## Full Tests, payments, refunds

### Purpose
Full Test templates, payments ledger, refunds ledger. These remain under the Sales sidebar section.

### Frontend
`src/features/sales/resources.jsx` (`fullTestsConfig`, `paymentsConfig`, `refundsConfig`). Routes `/full-tests`, `/payments`, `/refunds`.

### Business logic
Full Test payload maps `serviceProductIds` to `{ services: [{ productId }] }`. Payments and refunds `toPayload` send only the write fields (invoice id, amount, method, date, status, and reason for refunds). Creating a payment from an invoice uses `RecordPaymentModal` instead of this list form.

### Files
`resources.jsx`, `FullTestModal.jsx`, `RecordPaymentModal.jsx`.

## Purchases

### Purpose
Receive stock from a supplier into a warehouse, optionally allocated to a patient.

### Frontend
`src/features/purchases/PurchaseFormPage.jsx`, `PurchaseDetailPage.jsx`, `PurchasesListPage.jsx`, `SerialNumberInputs.jsx`.

### APIs
`purchasesApi`: CRUD `/purchases` plus `POST /purchases/:id/complete`.

### Business logic
Save sends status `draft` plus lines (`productId`, `quantity`, `unitCost`, `serialNumbers`). “Mark as received” then calls `complete`. Serial-tracked lines must have one serial per unit before complete; the form blocks that client-side. Completed purchases are not editable; corrections go through stock adjustment.

### Files
`PurchaseFormPage.jsx`, `src/api/sales.js` (`purchasesApi`).

## Patients

### Purpose
Patient records and their related activity.

### Frontend
`src/features/patients/PatientsListPage.jsx`, `PatientFormPage.jsx`, `PatientDetailPage.jsx`.

### APIs
`patientsApi` CRUD `/patients`. Related panels call notes, documents, appointments, communications, activities, invoices, payments, refunds, purchases.

### Business logic
`toPatientPayload` in `PatientFormPage.jsx` allow-lists fields including optional `leadId`. Empty strings become null in the HTTP client. Tabs: overview, invoices, documents, notes, purchases, payments, medical aid, refunds, communications, appointments, activity.

### Files
`PatientFormPage.jsx`, `PatientDetailPage.jsx`, `src/components/crm/*`.

## Leads

### Purpose
Enquiries that can be converted into patients.

### Frontend
`src/features/leads/resources.jsx`, `LeadDetailPage.jsx`.

### APIs
`leadsApi` CRUD `/leads` plus `POST /leads/:id/convert`.

### Business logic
Lead → patient form is prefilled via `leadToPatient` and `?` lead id on the patient form. Convert is a server action.

## Medical aid and claims

### Purpose
Schemes, plans, ICD-10, procedure codes, and claims.

### Frontend
`src/features/medical/resources.jsx`, `ClaimsListPage.jsx`, `ClaimDetailPage.jsx`, `IcdCodesPage.jsx`, `MedicalAidsListPage.jsx`, `MedicalAidDetailPage.jsx`, `ProcedureCodesPage.jsx`, `importCatalog.js`.

### APIs
`/medical-aids` (+ `POST /medical-aids/import`), `/medical-aid-plans`, `/icd-codes` (+ `POST /icd-codes/import`), `/procedure-codes` (+ `POST /procedure-codes/import`), `/claims` (+ `PATCH /claims/:id/status`).

### Business logic
Claim `toPayload` sends patient, optional invoice, scheme, plan, membership, amount, ICD and procedure ids. `ClaimsListPage` can open create prefilled from `?invoiceId=` or `?patientId=`. Catalog import posts the Hearing Aid Labs CSVs to `/medical-aids/import`, `/icd-codes/import`, and `/procedure-codes/import`, and falls back to POST/PUT with structured 2026 fields if those import paths return nothing. Claims stay a manual submit. The UI never keeps the CSV as a data store.

## Documents, notes, appointments, communications

### Purpose
Files and timeline entries owned by a patient (documents also by a claim).

### Frontend
`src/components/crm/DocumentsPanel.jsx`, `NotesPanel.jsx`, `AppointmentsPanel.jsx`, `CommunicationsPanel.jsx`, `ActivityPanel.jsx`.

### APIs
`/documents` list/delete, `POST /documents/upload`, `GET /documents/:id/file` (blob open/download). Notes, appointments, communications, activities use `createResource`. Appointment cancel is a PUT of `{ status: 'cancelled' }` where that action exists.

### Business logic
Upload `FormData` fields: `file`, `name`, `type`, plus owner ids (`patientId` / `claimId`). Communications are logged manually; WhatsApp/email delivery is not implemented in this repo (see [integrations.md](./integrations.md)). The communications list config is `readOnly: true`.

## Users, roles, settings

### Purpose
Staff, permission matrix, and practice settings.

### Frontend
`src/features/admin/resources.jsx`, `RolesPage.jsx`, `src/features/settings/SettingsPage.jsx`, `settingsFields.js`.

### APIs
`/users`, `/roles`, `GET /permissions`, `GET|PUT /settings/:section`.

### Business logic
User create shows `temporaryPassword` once in a modal (`ResourceListPage`) because invite email depends on server SMTP. User `toPayload` does not send a password; the server generates it. Roles screen loads the permission catalogue and stores `permissions[]` on the role. Settings sections that load and save through `/settings/:section`: `general`, `invoice`, `product`, `system`. Other settings nav items embed existing resource configs (branches, warehouses, practices, users, medical aids, ICD, procedure codes). `/settings/profile` does not call the settings API; `ProfileSection` renders the user already in `SessionContext`.

### Edge cases
`isAdmin` on the user row drives the role badge, not a hardcoded id.

## Permissions used in navigation

From `src/config/navigation.js`: `dashboard.view`, `products.view`, `stock.view`, `invoices.view`, `invoices.create`, `payments.view`, `purchases.view`, `patients.view`, `medicalAids.view`, `claims.view`, `leads.view`, `branches.view`, `users.view`, `settings.view`.

If `GET /auth/me` omits `permissions`, `can()` allows everything. Do not “fix” that without checking admin payloads that only send `isAdmin`.
