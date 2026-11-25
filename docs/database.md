# Database

## Technology

There is **no database in this repository**.

No Postgres/SQLite client, no models, no migrations, no seed scripts. `package.json` dependencies are React, React DOM, React Router, lucide-react, and clsx.

All durable data is owned by the remote API reached through `VITE_API_BASE_URL` (see [api.md](./api.md) and [integrations.md](./integrations.md)).

## What the frontend treats as identity

- Record ids are opaque strings. The UI does not parse them. The remote API uses UUID strings.
- Foreign keys are `*Id` fields (`patientId`, `branchId`, `warehouseId`, `productId`, `invoiceId`, `roleId`, …). Display names are sibling `*Name` fields returned by the API. The UI does not join tables.
- Empty optional strings are sent as `null`, not `""` (`src/api/client.js`).

## Relationships the UI assumes

These are navigational, not schema constraints. If the API omits a name or id, the link renders blank or “—”.

```text
Company → Brand → Model → Product (standard)
Category → Subcategory → Product

Branch → Warehouse
Branch → Practice
User → Role
User.branchIds → Branch
User.defaultBranchId / defaultWarehouseId

Patient.branchIds → Branch
Patient.medicalAidId → Medical aid → Plan

Invoice → Patient, Branch, Warehouse
Invoice.lines[] → Product, optional Procedure code, ICD codes, Full Test
Payment / Refund → Invoice (+ patient on payment create from the invoice screen)
Purchase → Supplier, Branch, Warehouse, optional Patient
Purchase.lines[] → Product + serialNumbers[]

Claim → Patient, optional Invoice, Medical aid, Plan, ICD codes, procedure codes
Document → patientId and/or claimId
Note / Appointment / Communication / Activity → patientId and/or leadId
Lead convert → Patient (server returns the new link; UI then opens the patient form)
```

## Fields the UI writes (high value)

Not a full schema. These are the payloads this frontend actually builds.

**Invoice** (`InvoiceEditorPage` `toPayload`): `type`, `patientId`, `branchId`, `warehouseId`, `date`, `dueDate`, `reference`, `notes`, `icdCodeIds`, `lines[]` (`productId`, `quantity`, `unitPrice`, `vatRate`, `icdCodeIds`, `procedureCodeId`, `fullTestId`, `serialNumbers`).

**Invoice read fields used on screen**: `id`, `number`, `type`, `status`, `date`, `dueDate`, `patientId`, `patientName`, `branchName`, `warehouseName`, `subtotal`, `vat`, `total`, `balance`, optional `paidAmount`, `lines`, `createdByName`.

**Payment** (`RecordPaymentModal` and `paymentsConfig.toPayload`): `invoiceId`, `patientId`, `amount`, `method`, `date`, `reference`, `notes` (modal) or `status` (ledger form).

**Purchase** (`PurchaseFormPage`): `supplierId`, `branchId`, `warehouseId`, `date`, `supplierReference`, `patientId`, `notes`, `status: 'draft'`, `lines[]` (`productId`, `quantity`, `unitCost`, `serialNumbers`). Completion is a separate POST, not a status field the UI sets to `completed` itself.

**Patient** (`PATIENT_WRITE` in `PatientFormPage.jsx`): `title`, `firstName`, `lastName`, `idNumber`, `dateOfBirth`, `gender`, `mobile`, `email`, `address`, `branchIds`, `medicalAidId`, `medicalAidPlanId`, `membershipNumber`, `dependantCode`, `mainMember`, `referredBy`, `notes`, `status`, `leadId`.

**User** (`usersConfig.toPayload`): `fullName`, `email`, `phone`, `roleId`, `branchIds`, `defaultBranchId`, `defaultWarehouseId`, `status`. Password is not sent. `temporaryPassword` may come back on create.

**Product** (`toProductPayload` in `productFields.js`): shared `type`, `name`, `sku`, `categoryId`, `subcategoryId`, `price`, `vatRate`, `description`, `status`. Service adds `durationMinutes`, `icdCodeIds`, `procedureCodeIds`. Standard adds `companyId`, `brandId`, `modelId`, `barcode`, `cost`, `reorderLevel`, `trackSerials`.

## Data the UI does not own

- Invoice numbers and quote/pro forma numbers. Prefixes are settings (`invoicePrefix`, `quotePrefix`, `proformaPrefix`) saved with `PUT /settings/invoice`. The UI does not increment them.
- Stock quantities. Shown from `/stock/*`. Changed by purchase complete, final invoice, invoice cancel, and `/stock/adjustments`.
- Payment status and balance. UI derives a badge from `total` and `balance` when `paymentStatus` is absent (`invoicePaymentStatus`).
- Permissions catalogue. Stored on the role as `permissions: string[]` after the user edits the matrix from `GET /permissions`.

## Lifecycle rules visible in the UI

| Event | Expected server effect | UI behavior |
|---|---|---|
| Save quote or pro forma | No stock reservation | Type card hint; availability is a warning only |
| Save or convert to invoice | Stock deducted if available | Server error surfaced; no local stock math |
| Cancel invoice with no payments | Stock restored | Button only if `balance === total` and not cancelled |
| Payment | Balance reduced; reject if amount > balance | Client check plus API error |
| Purchase complete | Stock increased; serials required when tracked | Blocked in the form, then `POST .../complete` |
| ICD import | Upsert by code | POST `/icd-codes/import`; extra 082/083 columns stored on the ICD row |
| Medical-aid CSV import | Upsert scheme by name, plan by (scheme, plan name) | POST `/medical-aids/import` or POST/PUT; `schemeType` on the scheme, benefit columns on the plan |
| Procedure CSV import | Upsert by code | POST `/procedure-codes/import` or POST/PUT; COIDA tariff → `defaultPrice` plus practice/claim fields |
| User create | Optional one-time password | Modal if `temporaryPassword` is on the response |

## Indexes, migrations, constraints

None in this repo. TODO / NEEDS VERIFICATION: indexes and unique keys (patient number, SKU, ICD code, invoice number) live only on the remote service.

## Local stand-in

`src/mocks/data.js` is fixture data for `VITE_USE_MOCK_API=true`. `mockAdapter.js` filters and paginates it in memory and echoes writes back without storing them. It is not a database and must not be treated as the production model.
