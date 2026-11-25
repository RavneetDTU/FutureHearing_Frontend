# Backend requests — Future Hearing operations portal

One file for the backend team. Two jobs. Same `/v1` API style.

| Part | What to do | New routes? |
|---|---|---|
| **A. IP access approval** | Gate store-manager login by approved IP | No — change existing login + access-request endpoints |
| **B. Hearing Aid Labs 2026 catalogues** | Store the extra CSV columns as real fields | Optional import paths; otherwise extra columns on existing resources |

Style: prefix `/v1`, cookie `fh_session` plus `Authorization: Bearer`, JSON camelCase, UUID ids, list `{ "data": [], "meta": { "page", "pageSize", "total" } }`, item `{ "data": {} }`, empty strings as `null`, FastAPI `422` `detail[]`. Ignore unknown JSON keys so the UI can send new fields without 422.

The browser must not invent IPs, allowlists, or CSV data. Everything lives in the database.

---

# Part A — IP access approval for store managers

Match the existing POS **List Access Requests** flow: **per user, per IP**, not a shared office-network list.

Checked against live OpenAPI on 15 Oct 2026: `GET /v1/access-requests` and `POST /v1/access-requests/{id}/decision` exist, but **login still issues a session for a new store manager from a new IP**. That is the bug. Creating a user must not approve an IP.

## Do not add new paths

| Method | Path | Change |
|---|---|---|
| POST | `/v1/auth/login` | Gate store-manager (non-admin) login by approved IP |
| GET | `/v1/access-requests` | Return the list fields below (admin only) |
| POST | `/v1/access-requests/{id}/decision` | Approve = allow **that request’s IP** for that user |

Do not add `POST /v1/access-requests` from the browser. The server creates the row during login.

## Who is gated

- **Store managers and other non-admin staff** may sign in only from IPs an admin has approved **for that user**.
- **Administrators** (`isAdmin` or equivalent) sign in as today, with no access request.
- **POST /v1/users** only creates the account. It must **not** write an approved IP.

## A1. Login — `POST /v1/auth/login`

Body (unchanged):

```json
{ "username": "toki@gmail.com", "password": "…" }
```

Take the IP from the **connection** (trusted reverse-proxy `X-Forwarded-For` only). Parse `User-Agent` on the server into `operatingSystem` and `browser`. Do not trust an IP in the JSON body.

### Password wrong

`401` as today. Do not create an access request.

### Password valid, caller is admin

Normal session: `{ "data": { "user": {…}, "token": "…" } }` and set `fh_session`.

### Password valid, caller is not admin, IP already approved for this user

Same normal session as today.

### Password valid, caller is not admin, IP is **not** approved

Do **not** set `fh_session`. Do **not** return `token` or `user`.

HTTP **200** (preferred):

```json
{
  "data": {
    "access": "pending",
    "requestId": "uuid",
    "message": "An administrator must approve this sign-in from this IP address."
  }
}
```

Then:

1. Insert a pending access request (or reuse the existing pending row for the same `userId` + `ipAddress` — do not duplicate).
2. Store: `userId`, `userName`, `email`, `ipAddress`, `operatingSystem`, `browser`, `warehouseName` (user’s default warehouse, else assigned warehouse), `requestedAt`, `status: "pending"`.
3. A **new IP** for the same user always creates a **new** pending request, even if other IPs are already approved.

## A2. List — `GET /v1/access-requests`

Admin only. `403` for store managers.

Query (already on OpenAPI): `status`, `search`, `page`, `pageSize`, `sortBy`, `sortDir`.

`status`: `pending` | `approved` | `rejected`. Omit `status` = all.

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Toki",
      "email": "toki@gmail.com",
      "ipAddress": "209.203.6.213",
      "operatingSystem": "Windows 10",
      "browser": "Chrome",
      "warehouseName": "Durbanville",
      "requestedAt": "2026-10-15T11:11:47Z",
      "status": "pending",
      "decidedAt": null,
      "decidedBy": null
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1 }
}
```

All of `ipAddress`, `operatingSystem`, `browser`, and `warehouseName` are required on each row. The portal already displays them.

## A3. Decide — `POST /v1/access-requests/{id}/decision`

Admin only.

```json
{ "decision": "approved" }
```

`decision`: `approved` | `rejected`. Store `decidedAt` and `decidedBy` (admin’s name or id).

| Decision | Result |
|---|---|
| `approved` | Add this request’s `ipAddress` to **this user’s** allowlist. Next `POST /v1/auth/login` from that IP returns a normal session. Do not remove other approved IPs for that user. |
| `rejected` | That IP stays blocked. A later login from it creates a new pending request (or reopens pending) and returns `requestId`. |

Return `{ "data": { …request with updated status… } }`.

## A — Test plan (must pass)

1. Admin creates a store manager (e.g. `toki@gmail.com`). No IP is approved yet.
2. Store manager signs in from IP A with the correct password.
3. Login response is pending (no token, no cookie). `GET /v1/access-requests?status=pending` shows one row with IP A, OS, browser, warehouse.
4. Store manager cannot call other `/v1` routes.
5. Admin approves that row.
6. Same user, same IP A → normal login.
7. Same user, **new IP B** → pending again, second row. IP A still works.
8. Admin login from any IP still works with no request.

Until steps 2–3 work, the portal will keep sending store managers straight to the dashboard.

---

# Part B — Hearing Aid Labs 2026 catalogues

The portal UI **imports** these three CSVs through **existing** `/v1` routes. Extra CSV columns that the API cannot store are packed into `notes` / `benefitNotes` / `description` until the fields below exist.

No new product flows. This is schema + optional import on current resources.

CSV sources:

1. `Hearing_Aid_Labs_Medical_Aids_2026_Provisional_Expanded_Import.csv` — 70 schemes, 317 plans
2. `Hearing_Aid_Labs_ICD10_Audiology_Acoustician_Import.csv` — 48 SA ICD-10 codes
3. `Hearing_Aid_Labs_Audiology_Acoustician_Claim_Codes_2026.csv` — 53 COIDA 082/083 tariff codes

The portal does **not** keep these files. After import, rows must live in the database.

## What already works (no new path required)

| CSV | Existing API | How the UI maps it today |
|---|---|---|
| Medical Aid Name | `POST/PUT /v1/medical-aids` `name` + required `code` | Code is generated from the name (parentheses like GEMS win) |
| Plan | `POST/PUT /v1/medical-aid-plans` `name` | |
| Cycle, ZAR limits, coverage, verification, scheme type, conditions, source URL | `benefitNotes` (text) | Packed as labelled lines |
| ICD10_Code, Diagnosis_Description, Category | `POST /v1/icd-codes/import` | Frontend rewrites the CSV to `code,description,category,status` first |
| Procedure_Code, Procedure_Description, 2026_COIDA_Tariff | `POST/PUT /v1/procedure-codes` `code`, `description`, `defaultPrice` | Practice type / category / unit appended on `description` |

## B1. Medical aid — extra on `MedicalAidIn` / `MedicalAidUpdate`

Keep `name`, `code`, `administrator`, `phone`, `email`, `claimsEmail`, `website`, `notes`, `status`.

Add:

```json
{ "schemeType": "OPEN" }
```

`schemeType`: `OPEN` | `RESTRICTED` | null.

CSV **Scheme Type** is per plan but is the same for every plan of a scheme in this file. Store it on the scheme.

## B2. Plan — structured benefit fields on `PlanIn` / `PlanUpdate`

Keep `medicalAidId`, `name`, `code`, `membershipType`, `benefitNotes`, `status`.

Do **not** reuse `membershipType` (Comprehensive / Hospital / Saver / Network / Other) for OPEN / RESTRICTED.

Add:

```json
{
  "cycleYears": 2,
  "hearingAidBenefitZar": 36610,
  "benefitBasis": "per_beneficiary",
  "perEarLimitZar": null,
  "perMemberLimitZar": null,
  "perFamilyLimitZar": null,
  "coverageStatus": "PROVISIONAL COVER - VERIFY",
  "verificationStatus": "PROVISIONAL - CONFIRM WITH SCHEME",
  "cmsOptionStatus": "APPROVED (CMS Dec 2025 circular)",
  "benefitYear": 2026,
  "benefitCategory": "Hearing-aid device benefit",
  "confirmationRequired": true,
  "claimsAutomationEligible": false,
  "sourceUrl": "https://…",
  "specialConditions": "Earlier benefit-guide figure; …"
}
```

| CSV column | JSON |
|---|---|
| Cycle in Years | `cycleYears` number or null |
| Hearing Aid Benefit (ZAR) | `hearingAidBenefitZar` number or null |
| Benefit Basis | `benefitBasis` string (`per_beneficiary`, `per_family`, `per_device`, …) |
| Per Ear / Member / Family Limit (ZAR) | `perEarLimitZar`, `perMemberLimitZar`, `perFamilyLimitZar` |
| Hearing Aid Coverage Status | `coverageStatus` |
| Benefit Verification Status | `verificationStatus` |
| 2026 CMS Option Status | `cmsOptionStatus` |
| Benefit Year | `benefitYear` |
| Benefit Category | `benefitCategory` |
| Confirmation Required | `confirmationRequired` boolean (CSV YES/NO) |
| Claims Automation Eligible | `claimsAutomationEligible` boolean (currently all NO) |
| Source URL | `sourceUrl` |
| Special Conditions / Notes | `specialConditions` |

Unique key: (`medicalAidId`, `name`). Import must upsert.

Optional: `POST /v1/medical-aids/import` multipart `file` that reads this CSV in one transaction. Until then the UI POSTs each scheme and plan.

## B3. ICD-10 — extra columns on `IcdIn` / `IcdUpdate`

Keep `code`, `description`, `category`, `status`. Unique on `code`.

Add:

```json
{
  "audiologist082Relevance": "Yes",
  "acoustician083Relevance": "Conditional",
  "typicalClaimContext": "Testing; hearing-aid evaluation; fitting/supply",
  "specialConditions": "Common hearing-aid claim diagnosis when supported by the audiogram.",
  "codingSystem": "South African ICD-10 / WHO-style (not US ICD-10-CM)",
  "sourceYear": 2021,
  "sourceUrl": "https://www.health.gov.za/icd-10-master-industry-table/",
  "validationStatus": "Reference list - confirm against current MIT and scheme edits"
}
```

`audiologist082Relevance` / `acoustician083Relevance`: `Yes` | `No` | `Conditional` | `Referral only`.

`POST /v1/icd-codes/import` should accept **either** header set:

- `code, description, category, status` (current)
- `ICD10_Code, Diagnosis_Description, Category, Audiologist_082_Relevance, Acoustician_083_Relevance, …`

Upsert by code. Do not require `status` on the HAL file (default `active`).

## B4. Procedure / claim codes — extra columns on `ProcedureIn` / `ProcedureUpdate`

Keep `code`, `description`, `defaultPrice`, `status`. Unique on `code`.

Add:

```json
{
  "practiceType": "082 Audiologist",
  "serviceCategory": "Consultation",
  "billingUnit": "Per consultation",
  "workflowStage": "Initial test",
  "tariffSource": "COIDA Gazette 2026 (effective 2026-04-01)",
  "sourceUrl": "https://…",
  "schemePaymentGuaranteed": false,
  "claimStatusNote": "Confirm code acceptance and tariff with scheme/administrator",
  "specialConditions": "Time-based; document actual duration"
}
```

| CSV column | JSON |
|---|---|
| Practice_Type | `practiceType` (`082 Audiologist` \| `083 Hearing aid acoustician`) |
| Service_Category | `serviceCategory` |
| Billing_Unit | `billingUnit` |
| Suggested_Workflow_Stage | `workflowStage` |
| 2026_COIDA_Tariff_ZAR_Excl_VAT | already `defaultPrice` (null if blank, e.g. repairs by arrangement) |
| Tariff_Source | `tariffSource` |
| Source_URL | `sourceUrl` |
| Scheme_Payment_Guaranteed | `schemePaymentGuaranteed` boolean |
| Medical_Scheme_Claim_Status | `claimStatusNote` |
| Special_Conditions_Notes | `specialConditions` |

`defaultPrice` is a **COIDA ceiling / guideline**, not a guaranteed scheme payment. Do not treat it as medical-aid benefit.

Optional: `POST /v1/procedure-codes/import` multipart `file`. Until then the UI POSTs/PUTs each row.

## B5. Do not automate claims from these files

Every medical-aid row has `Claims Automation Eligible = NO` and `Confirmation Required = YES`. Scheme payment on every tariff row is `No`. The claim API must stay a manual submit. Do not auto-approve from these CSVs.

## B — Test plan

1. Import the three CSVs from Medical aids, ICD-10 codes, and Procedure codes.
2. Bestmed → Pace 4 exists as a plan; benefit notes (or new columns) include 36610 and cycle 2.
3. ICD `H90.3` exists with category Hearing loss.
4. Procedure `1011` exists with default tariff 349.83; `83001` exists for 083.
5. Re-import does not duplicate (upsert by scheme+plan name, ICD code, procedure code).
6. After you add the JSON fields above, a GET of those rows returns them and a second import fills them (not only notes).
