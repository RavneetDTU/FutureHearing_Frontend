# HAL-POS ↔ Future Hearing POS — Sync Assessment Report

**Date:** 2026-11-25  
**Mode:** Read-only analysis. **No code written. No production writes.**  
**Status:** Incomplete for SiteGround live DB — credentials not yet provided.

---

## Executive verdict

| Question | Answer |
|---|---|
| Can continuous MySQL→PostgreSQL sync be built **inside this React repo**? | **No.** This repo is a frontend SPA only. |
| Where does PostgreSQL live? | Behind the remote HAL API (`http://103.55.104.142:5035`), not in this repo. |
| What already exists for data load? | One-shot dump → `json/extract.mjs` → `json/seed.mjs` → **POST `/v1`**. Not CDC. |
| Which source DB is the POS? | **`dbynrsc4igamd8`** (labeled `pos.co.za` in phpMyAdmin). |
| Is `futurehearing.co.za` (`dbmyqpfkkumf8g`) a second POS? | **No.** It is WordPress + WooCommerce. Not SMA. Do not treat it as a parallel POS schema. |
| Recommended sync approach (pending SiteGround binlog check) | Dedicated **background sync worker** + **incremental polling** (or CDC if SiteGround allows). Writes via HAL `/v1` or backend-owned Postgres. |
| SiteGround live inspection | **Blocked** — SiteGround login not provided in this session. |

**Do nothing on SiteGround that writes, alters schema, installs triggers, or changes users without explicit approval.**

---

## 1. Documentation reviewed

| File | Role | Freshness notes |
|---|---|---|
| `docs/agent.md` | Frontend-only rules; request flow | Mentions `src/mocks/` / `VITE_USE_MOCK_API` — not present in current source |
| `docs/architecture.md` | SPA layers, proxy, auth | Says no production hosting; **`vercel.json` exists** |
| `docs/api.md` | Exact HTTP contract from `src/api/` | Aligns with live OpenAPI |
| `docs/database.md` | No DB in repo; UUID FKs via API | Correct |
| `docs/features.md` | Module map | Useful for sync target coverage |
| `docs/integrations.md` | Remote API + cookie; no 3rd-party SDKs | Correct |
| `docs/development.md` | Dev/build | Stale claim of “no `.git`” — `.git` exists |
| `docs/backend-requests.md` | Backend team specs (access + catalogue) | Integration already done in SPA |
| `json/README.md` | Dump → extract → seed mapping | Accurate for historical load |

`docs/` and `json/` are **gitignored**.

---

## 2. HAL-POS project findings

### 2.1 What this repository is

- React 19 + Vite 8 + React Router 7 SPA (`package.json`: `dev` / `build` / `preview` / `lint` only).
- Dependencies: React, Router, lucide, clsx, jsbarcode. **No** Express, Prisma, `pg`, `mysql`, workers, queues.
- Browser calls same-origin `/v1`; Vite (dev) and Vercel (prod) proxy to `http://103.55.104.142:5035`.
- Auth: `POST /auth/login` → httpOnly `fh_session` + in-memory Bearer.
- No Redux / React Query. Per-hook fetch. **No WebSocket / SSE.** Only polling found: communications inbox every 60s.

### 2.2 Business modules (frontend)

Patients, products/catalog, stock, invoices, payments, refunds, purchases, medical aids/claims/ICD/procedures, leads, appointments, communications, documents, branches/warehouses, admin users/roles, dashboard.

### 2.3 Live HAL API (read-only probe 2026-11-25)

| Check | Result |
|---|---|
| `GET /health` | `200` `{"status":"ok"}` |
| `GET /openapi.json` | `200` — title **Future Hearing API** v1.0.0, **120** paths |
| Sync / migrate / replicate endpoints | **None** |
| Import endpoints | `/v1/medical-aids/import`, `/v1/icd-codes/import`, `/v1/procedure-codes/import` only |

Core write surfaces for a sync worker (via API): patients, products, invoices, payments, purchases (+ complete), stock/adjustments, medical-aids, branches, warehouses, categories, companies, brands, suppliers, etc.

**There is no OpenAPI path for “POS sync”.** Any continuous sync must be a new service (or new backend module), not a SPA feature.

### 2.4 PostgreSQL

- Not accessible from this repo.
- Schema, migrations, constraints live on the API host.
- Frontend assumes UUID string ids and `*Id` / `*Name` pairs (`docs/database.md`).

---

## 3. Source databases (from dump + phpMyAdmin screenshot)

### 3.1 Hosting context (screenshot)

- phpMyAdmin: `https://gtxm1057.siteground.biz/phpmyadmin/`
- Server: Localhost via UNIX socket, **MySQL 8.4.11**, utf8mb4
- DB user shown: `s5mdpr4sdxgtp@localhost` (local socket — remote sync needs a different connectivity story)

### 3.2 Databases in `json/localhost.json` (~194 MB dump)

| Database | phpMyAdmin label | Tables | Nature | Sync to HAL? |
|---|---|---|---|---|
| `dbynrsc4igamd8` | pos.co.za | **175** | SMA / Stock Manager POS | **Yes — primary** |
| `dbmyqpfkkumf8g` | futurehearing.co.za | **81** | WordPress + WooCommerce | **No** for POS parity (unless a separate Woo→HAL product decision) |
| `db6ximape7gsb3` | (unlabeled) | **60** | WordPress + Woo noise | **No** |
| `dbn3iztwur4zyj` | (unlabeled) | 0 in dump headers | Unknown / empty in dump | Out of scope until inspected live |
| `dbnizxr6vqgizl` | (unlabeled) | 0 in dump headers | Unknown / empty in dump | Out of scope until inspected live |

**Important correction to the original sync brief:** the “two source databases” are **not** two copies of the same POS. Only **`dbynrsc4igamd8`** holds SMA business tables (`sma_*`).

### 3.3 POS table volume (dump snapshot)

| Table | Rows | Sync priority |
|---|---:|---|
| `sma_companies` | 4473 | High (patients; billers excluded) |
| `sma_products` | 1529 | High |
| `sma_sales` | 2002 | High → HAL invoices |
| `sma_sale_items` | 2171 | High |
| `sma_payments` | 673 | High |
| `sma_purchases` / items | 97 / 486 | High |
| `sma_warehouses_products` | 315 | Medium (stock) |
| `sma_medical_aid_list` | (extracted 79 schemes) | High |
| `sma_quotes` | 0 | Skip until non-empty |
| `sma_leads` | 0 | Leads live in `sma_companies` |
| `sma_serial_nos` | 0 | Skip |
| `sma_return_sales` | 0 | Skip |
| `sma_calendar` | 84 | Optional → appointments mapping TBD |
| `sma_customer_notes` | (present) | Optional → notes |
| `sma_debug` | **111 546** | **Never sync** |
| `sma_webhook_responses` | **193 593** | **Never sync** |
| `sma_wahtsapp_messages` | **28 374** | Do not sync unless product asks |
| `sma_users_log` | **33 375** | Never sync |
| `sma_sessions` | 240 | Never sync |

### 3.4 Change-tracking columns (critical for incremental sync)

| Table | Usable watermarks | Reliability notes |
|---|---|---|
| `sma_sales` | `id`, `date`, `date_created`, `updated_at` | Sample row had `updated_at=null` — **updates may not always stamp** |
| `sma_sale_items` | `id`, `sale_id` | **No** `updated_at` |
| `sma_payments` | `id`, `date`, `date_created`, `updated_at` | Better than sales |
| `sma_companies` | `id`, `date_created`, `date_updated` | Sample biller had both null — **spotty** |
| `sma_products` | `id`, `date_created`, `date_updated`, `hide`, `is_deleted` | Soft-delete via `hide` / `is_deleted` |
| `sma_purchases` | `id`, `date`, `updated_at`, `status_date` | |
| `sma_warehouses_products` | `id`, `created_at`, `updated_at` | Sample `updated_at` was zero-date |
| `sma_medical_aid_list` | `id` only | 4 columns; no timestamps |

**Implication:** timestamp-only CDC is **unreliable** on this schema. Prefer:

1. Monotonic `id` for inserts (works well), plus  
2. Periodic reconciliation for updates/deletes, and/or  
3. True binlog CDC if SiteGround allows.

### 3.5 Soft delete / status

- Products: `hide=1` or `is_deleted=1` → inactive (seed already maps this).
- Companies: `active_status`.
- Sales: `sale_status`, `payment_status`; trashed tables exist (`sma_sales_trashed`, etc.).

Hard deletes: unknown without live observation / binlog. Trashed tables suggest some soft archive patterns.

### 3.6 Dump freshness

Extracted sales dates: **2024-10-30 → 2026-10-19**.  
Dump file mtime ~2026-10-20. Live POS has likely continued since then — another reason dump+seed is not a substitute for continuous sync.

---

## 4. Existing HAL load path (not realtime)

```text
phpMyAdmin JSON dump (localhost.json)
  → json/extract.mjs  (POS DB only, 16 tables)
    → 01-catalog / 02-people / 03-sales / 04-purchases
  → json/seed.mjs --yes  (admin login, POST /v1)
    → json/_id-map.json  (smaId → HAL UUID)
```

### 4.1 Id map state (after prior live seed)

| Kind | Mapped |
|---:|---:|
| patient | 4471 |
| invoice | 2002 |
| product | 1529 |
| payment | 657 (of 673 source) |
| medicalAidPlan | 243 |
| purchase | 95 |
| medicalAid | 79 |
| category / branch / warehouse / … | present |
| **Total entries** | **9104** |

### 4.2 Known seed failure classes (already analyzed)

- Duplicate patient **mobile** / **idNumber** (HAL unique constraints).
- Invoices blocked when line products are **inactive** (7 inactive-but-sold products).
- Payments exceeding invoice **balance** (missing lines / VAT mismatch) or amount ≤ 0.
- Category `appliesTo` / missing `categoryId` (fixed in seed for catalog).

Seed improvements were started (unique mobile, activate sold products, cap payments) but **continuous sync is still missing**.

---

## 5. Source → HAL mapping (draft)

| Source (`dbynrsc4igamd8`) | HAL `/v1` | Notes |
|---|---|---|
| `sma_warehouses` | `/branches` + `/warehouses` | 2 sites |
| `sma_categories` | `/categories` | `appliesTo: both` |
| `sma_products` | `/products` | No brand tree in POS → placeholder company/brand |
| `sma_warehouses_products` | `/stock/adjustments` | Derived stock; not a 1:1 stock table write |
| `sma_companies` (non-biller) | `/patients` | Unique mobile/idNumber conflicts |
| `sma_medical_aid_list` (+ plan cycle) | `/medical-aids`, `/medical-aid-plans` | |
| `sma_sales` + `sma_sale_items` | `/invoices` + lines | All completed in dump; quotes empty |
| `sma_payments` | `/payments` | Cap to balance; skip ≤0 |
| `sma_purchases` + items | `/purchases` + `/complete` | |
| `sma_users` / passwords | — | **Do not sync** |
| WhatsApp / debug / webhooks / sessions | — | **Do not sync** |
| Claim family tables (`sma_*_claims*`) | `/claims` | Mostly empty in dump; map later if used live |
| `sma_calendar` | `/appointments` | Needs field mapping proof |
| WooCommerce (`dbmyqpfkkumf8g`) | — | Out of scope unless business requires |

Identity rule: durable map `(source_db, table, source_id) → hal_uuid`. Never merge two DBs’ id `100` as one row. For POS-only sync, `source_db=dbynrsc4igamd8` is enough.

---

## 6. Sync architecture recommendation

```text
PHP POS (unchanged)
  → MySQL dbynrsc4igamd8 (source of truth)
    → Sync worker (NEW — not this React repo)
      → HAL API /v1  (preferred)  OR  HAL Postgres (backend-owned)
        → HAL React SPA (this repo) reads via existing APIs
```

### 6.1 Preferred tiers

| Tier | When | Latency |
|---|---|---|
| **A. MySQL binlog CDC** | SiteGround enables ROW binlog + replication user + remote access | Seconds |
| **B. Incremental poller** | Default on shared hosting | 30–120s |
| **C. Nightly dump + seed** | Fallback only | Hours — **not** the goal |

### 6.2 Why not Debezium+Kafka by default

Shared SiteGround MySQL often blocks external replication. Kafka adds ops cost HAL does not have. Start with the simplest worker that meets lag SLOs; upgrade to CDC if hosting allows.

### 6.3 Worker requirements (when implementation is approved)

- Read-only MySQL credentials; least privilege `SELECT`.
- Durable checkpoints + id map in Postgres (or sync DB).
- Idempotent upserts; dependency order: catalog → people → purchases/stock → sales → payments.
- No write-back to PHP MySQL.
- Failures to dead-letter; no silent overwrite of HAL-only fields.
- Does not require the dashboard to stay open.

### 6.4 Frontend “realtime”

Syncing Postgres does **not** refresh the SPA. Options after worker exists:

1. Light refetch on focus / interval for list pages (minimal SPA change).  
2. Backend SSE/WebSocket + SPA subscription (larger; needs API work).

Do not claim realtime UI until measured.

---

## 7. SiteGround live findings (phpMyAdmin, 2026-11-25)

User ran read-only SQL in phpMyAdmin. No schema or config changes were made.

### 7.1 Confirmed database identities and size

| Label | Schema | size_mb | tables |
|---|---|---:|---:|
| futurehearing.co.za | `dbmyqpfkkumf8g` | 23.1 | 81 |
| pos.co.za | `dbynrsc4igamd8` | 51.2 | 177 |

Dump previously listed 175 POS tables; live shows **177** (minor drift / new tables).

### 7.2 Binary log / CDC (decisive)

| Variable | Value | Meaning |
|---|---|---|
| `log_bin` | **OFF** | Binary logging **disabled** — Debezium / binlog CDC **not available** as-is |
| `binlog_format` | ROW | Would be correct *if* binlog were on |
| `binlog_row_image` | FULL | Would be correct *if* binlog were on |
| `gtid_mode` | OFF | No GTID |
| `enforce_gtid_consistency` | OFF | — |
| `server_id` | 1 | Default |
| `log_bin_basename` | (empty) | Confirms no active binlog file |
| `binlog_expire_logs_seconds` | 2592000 | 30 days (irrelevant while OFF) |

**Conclusion:** True real-time CDC via MySQL binlog requires SiteGround to **enable** `log_bin` (and usually a replication user + remote access). That is a **hosting config change** — do **not** attempt without explicit approval. Shared SiteGround plans often disallow this.

**Default sync design:** incremental poller (id / date watermarks + periodic reconciliation), not Debezium.

### 7.3 Live vs dump lag (2026-11-25 phpMyAdmin)

| Table | Dump count | Live count | Live max_id | Live max_date | Delta |
|---|---:|---:|---:|---|---:|
| `sma_sales` | 2002 | **2188** | 2212 | **2026-11-25 11:54:37** | +186 |
| `sma_payments` | 673 | **745** | 757 | 2026-11-24 13:33:31 | +72 |
| `sma_companies` | 4473 | **4679** | 4706 | — | +206 |
| `sma_products` | 1529 | **1533** | 1720 | — | +4 |

Dump sales ended ~**2026-10-19**. Live sales continue through **today**. Manual dump+seed cannot keep HAL current.

`max_id` > `COUNT(*)` on all four tables → gaps from deletes/trashed rows; sync must key off **source id**, not assume contiguous ids.

### 7.4 Indexes (poller-friendly)

| Table | Useful indexes |
|---|---|
| `sma_sales` | **PRIMARY(`id`)**, `date`, `customer_id`, `reference_no`, `warehouse_id` |
| `sma_payments` | **PRIMARY(`id`)**, `sale_id`, `date` |
| `sma_companies` | **PRIMARY(`id`)**, `phone`, `warehouse_id`, `active_status`, … — **no** index seen on `date_updated` |
| `sma_products` | **PRIMARY(`id`)**, **UNIQUE(`code`)** (SKU), `category_id` |
| `sma_warehouses_products` | **PRIMARY(`id`)**, `product_id`, `warehouse_id` |

**Poller strategy:** `WHERE id > :checkpoint ORDER BY id LIMIT N` is indexed and cheap. Date indexes help catch-up windows. Do **not** rely on `date_updated` alone for companies/products (often null; often unindexed).

### 7.5 Remote MySQL (Site Tools → MySQL → REMOTE)

| Finding | Detail |
|---|---|
| Allowlisted hosts | **None** — “There's nothing here yet” |
| Implication | No external server can open a TCP MySQL connection to SiteGround yet |
| Required later (approval only) | Add the sync worker’s public IP (or hostname) under **Add Remote Access Host**, plus a least-privilege MySQL user with SELECT on `dbynrsc4igamd8` |

**Do not add a host until the sync worker’s IP is known and you approve the change.** phpMyAdmin (local socket) still works for manual read-only checks.

---

## 8. Security / POPIA

- Production patient data is confidential.
- Do not commit MySQL or SiteGround passwords; do not put them in the React `.env` shipped to browsers.
- Rotate any password that was pasted into chat (POS UI password was shared earlier).
- Sync logs must avoid full ID numbers / medical content.
- Never expose source DB credentials to the frontend.

---

## 9. Blockers before implementation

1. ~~Binlog status~~ — **known: OFF.** Enabling it needs SiteGround approval (likely not on shared plan). Proceed with **poller** unless they enable binlog.  
2. ~~Live `MAX(id)` / counts / indexes~~ — **captured** (POS growing; dump stale).  
3. ~~Remote MySQL~~ — **no hosts allowlisted**; worker cannot connect until you approve adding its IP.  
4. Dedicated read-only MySQL user for the sync worker (create only with approval).  
5. **HAL backend repo or new sync-worker repo** — cannot implement sync in this SPA alone.  
6. **Postgres access or continued use of `/v1` admin writes** — product decision.  
7. **Staging** environment — no fake sales on live POS.  
8. Explicit approval before any SiteGround configuration change (binlog, Remote MySQL hosts, new users).

---

## 10. What will *not* be done without approval

- Modify PHP POS.  
- Write/update/delete production MySQL rows.  
- Schema changes, triggers, binlog enablement.  
- Deploy sync to production.  
- Bidirectional sync.  
- Sync of passwords, sessions, WhatsApp dumps, debug tables.  
- Code changes in this repo for sync (deferred until you approve the plan and provide credentials/repos).

---

## 11. Next actions (ordered)

1. ~~Remote MySQL screenshot~~ — **captured: zero allowlisted hosts.**  
2. Confirm design: **incremental poller** (recommended: `log_bin=OFF` + live growth + no remote access yet).  
3. Confirm: sync worker in **HAL backend** vs **new repo**; writes via **`/v1`** vs **direct Postgres**.  
4. When worker host IP is known: **you approve** adding that IP under Remote MySQL + read-only DB user.  
5. Formal mapping doc + implementation plan sign-off.  
6. Staging implementation only after approval.  
7. Production enablement only after testing + approval.

---

## Appendix A — HAL OpenAPI sync-relevant resources

Present: patients, products, invoices, payments, purchases, stock/adjustments, medical-aids (+import), branches, warehouses, categories, companies, brands, suppliers, appointments, leads, claims, icd/procedure (+import), refunds, communications, documents, users, roles.

Absent: `/sync`, `/migrate`, `/replicate`, webhooks for POS.

## Appendix B — Files inspected (local)

- All of `docs/*.md`
- `package.json`, `vercel.json`, `.env.example`, `.gitignore`
- `json/README.md`, `extract.mjs`, `seed.mjs`, `01–04` JSON summaries, `_id-map.json`
- `json/localhost.json` structure (databases, tables, columns, counts)
- Live `http://103.55.104.142:5035/health` and `/openapi.json`

## Appendix C — Credentials status

| Credential | Status |
|---|---|
| HAL API admin (for seed) | Known from prior work; not stored in this report |
| POS website login | Previously shared in chat — **rotate**; not used for this analysis |
| SiteGround / phpMyAdmin | User ran read-only SQL; sizes + binlog captured 2026-11-25 |
| Read-only remote MySQL | **Not configured** — Remote tab empty (2026-11-25) |
| HAL Postgres | **Not available in this repo** |
