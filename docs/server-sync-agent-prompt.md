# Copy-paste prompt for the server agent

Open **both** projects on `103.55.104.142` in Cursor:

1. `HAL_POS_Backend` — `/home/rpsoftwarelab/Documents/2026_Projects/HAL_POS_Backend`
2. Frontend (if present on server) or keep local `HAL_POS` context in mind — API consumer only

Then paste **everything below the line** into the agent chat.

---

## PROMPT START

You are working on the Future Hearing HAL stack on server `103.55.104.142`.

### Projects

| Role | Path / identity |
|---|---|
| **Backend (system of record for HAL)** | `HAL_POS_Backend` — serves **Future Hearing API** on port **5035** (`/v1`, OpenAPI title “Future Hearing API”) |
| **Frontend** | React SPA `HAL_POS` — talks only to `http://103.55.104.142:5035/v1` (or proxied `/v1`). No DB in the frontend repo. |

Confirm by inspecting `HAL_POS_Backend`: entrypoint, framework (likely FastAPI/Python or similar), Postgres connection, how the process binds to `0.0.0.0:5035` or equivalent, existing workers/cron if any.

### Goal

Build a **production-ready incremental MySQL → HAL sync poller** so live POS data from SiteGround keeps PostgreSQL (via this backend) up to date without daily dump/import.

**Not** true binlog CDC (SiteGround has `log_bin=OFF`). Use a **read-only poller** with durable checkpoints.

### Source of truth (PHP POS — do not modify)

| Item | Value |
|---|---|
| App | https://pos.futurehearing.co.za (Stock Manager Advance / SMA) |
| Hosting | SiteGround MySQL 8.4.x |
| **POS database** | `dbynrsc4igamd8` (label `pos.co.za`) — **this is what to sync** |
| Website DB | `dbmyqpfkkumf8g` (label `futurehearing.co.za`) — WordPress/WooCommerce — **do not sync for POS parity** |
| Engine | MySQL; phpMyAdmin local socket only today |

**Live sizes (2026-11-25):** POS ~51.2 MB / 177 tables; Woo ~23.1 MB / 81 tables.

**Binlog:** `log_bin=OFF`, `gtid_mode=OFF`, `binlog_format=ROW` (inactive). CDC/Debezium is **not** available without SiteGround enabling binlog (needs explicit human approval; shared hosting often refuses).

**Remote MySQL:** Site Tools → MySQL → REMOTE currently has **zero** allowlisted hosts. The poller **cannot** connect from this server until the human adds this server’s public IP and a SELECT-only user. **Do not** add Remote hosts or create MySQL users yourself unless the human explicitly approves in the same chat message.

### Live vs old dump (why poller is required)

Dump used by frontend `json/seed.mjs` is stale. Live POS (2026-11-25):

| Table | Dump count | Live count | Live max_id | Live max_date |
|---|---:|---:|---:|---|
| `sma_sales` | 2002 | 2188 | 2212 | 2026-11-25 11:54:37 |
| `sma_payments` | 673 | 745 | 757 | 2026-11-24 13:33:31 |
| `sma_companies` | 4473 | 4679 | 4706 | — |
| `sma_products` | 1529 | 1533 | 1720 | — |

### Indexes useful for polling (`dbynrsc4igamd8`)

- `sma_sales`: PRIMARY(`id`), index on `date`, `customer_id`, `reference_no`, `warehouse_id`
- `sma_payments`: PRIMARY(`id`), `sale_id`, `date`
- `sma_companies`: PRIMARY(`id`), `phone`, … — **no reliable `date_updated` index**; timestamps often null
- `sma_products`: PRIMARY(`id`), **UNIQUE(`code`)**, `category_id`
- `sma_warehouses_products`: PRIMARY(`id`), `product_id`, `warehouse_id`

**Poll strategy:** `WHERE id > :checkpoint ORDER BY id LIMIT N` per table. Do not rely on `updated_at` alone. Plan periodic reconciliation for updates/soft-deletes. `max_id` > `COUNT(*)` (gaps from deletes) — key off source id, not contiguous sequences.

### What to sync (map from SMA → HAL)

Reuse / harden the mapping already proven in the frontend seed tooling (`json/extract.mjs` + `json/seed.mjs` on the HAL_POS machine):

| Source | HAL target |
|---|---|
| `sma_warehouses` | branches + warehouses |
| `sma_categories` | categories (`appliesTo: both`) |
| `sma_products` | products (standard/service; inactive if `hide`/`is_deleted`) |
| `sma_warehouses_products` | stock via adjustments (or backend-native stock write if exists) |
| `sma_companies` (non-biller) | patients |
| `sma_medical_aid_list` (+ plan cycle) | medical aids / plans |
| `sma_sales` + `sma_sale_items` | invoices + lines |
| `sma_payments` | payments |
| `sma_purchases` + items | purchases (+ complete when received) |

**Never sync:** `sma_debug`, `sma_webhook_responses`, WhatsApp tables, sessions, user password hashes, WordPress/Woo DBs.

**Known HAL constraints (from live seed):**

- Patient unique on `mobile` and `idNumber` — POS has duplicate mobiles/IDs; reuse or unique-ify safely
- Invoice create rejects **inactive** line products — activate sold products when syncing historical sales
- Payments reject amount ≤ 0 or amount > invoice balance — skip/cap
- Categories must `appliesTo` include product type; missing `categoryId` needs fallback
- POS has no company→brand→model tree — use placeholder manufacturer/brand if API requires them
- HAL ids are UUIDs; keep durable map `(source_db, table, source_id) → hal_uuid`

### Architecture to implement

```text
PHP POS (unchanged)
  → MySQL dbynrsc4igamd8 (SiteGround)   [READ ONLY]
    → Sync poller worker inside / beside HAL_POS_Backend
      → Prefer writing through existing HAL domain services / same DB layer as API
        (or internal calls equivalent to /v1 admin writes — do NOT invent a second schema)
          → PostgreSQL
            → Existing /v1 API
              → React HAL_POS
```

**Direction:** one-way POS → HAL only. No write-back to SiteGround MySQL. No PHP changes.

**Worker must support:** continuous loop or cron; per-table checkpoints; idempotent upserts; retries/backoff; dead-letter failed rows; graceful restart; connection pooling; structured logs **without** dumping ID numbers / medical content; admin-visible sync status if easy to add to existing admin patterns.

**Frontend realtime:** out of scope for v1 unless trivial; SPA already refetches on navigation. Optional later: short poll / SSE. Do not block sync on UI work.

### Strict safety

- **Read-only** on SiteGround MySQL. No INSERT/UPDATE/DELETE/DDL on production POS.
- Do **not** enable binlog, install triggers, change SiteGround users/hosts, or restart MySQL without explicit human approval in-chat.
- Do **not** create fake sales/patients on live POS for testing.
- Do **not** commit secrets. Use env vars (e.g. `POS_MYSQL_HOST`, `POS_MYSQL_USER`, `POS_MYSQL_PASSWORD`, `POS_MYSQL_DATABASE=dbynrsc4igamd8`).
- Do **not** break existing `/v1` APIs or migrations carelessly. Prefer additive tables: e.g. `sync_checkpoints`, `sync_id_map`, `sync_dead_letters`.
- Preserve Render/server rules if applicable: bind `0.0.0.0:$PORT`; ephemeral disk — checkpoints must live in **Postgres**, not local files only.

### Execution order (mandatory)

1. **Inspect only** `HAL_POS_Backend`: stack, Postgres models/migrations, auth, how invoices/patients/stock are created, existing background jobs.
2. Write a short **implementation plan** in-repo (or comment in PR notes): files to add, env vars, checkpoint schema, table sync order, how Remote MySQL will connect.
3. **Stop and ask** the human before:
   - Adding SiteGround Remote MySQL host IP
   - Creating SiteGround MySQL user
   - Any production deploy
   - Enabling binlog
4. Implement poller + migrations on staging/dev first if available; otherwise local against approved credentials.
5. Bootstrap: either resume from existing frontend `_id-map.json` concepts or full historical backfill then continuous poll — document which.
6. Test: new row after checkpoint appears in Postgres/API; restart worker resumes; duplicate poll does not duplicate invoices/patients.
7. Document runbook: env, start command, monitoring, failure recovery.

### Preferred sync order per cycle

1. branches/warehouses/categories  
2. products (force active if appears on new sales)  
3. medical aids/plans  
4. patients  
5. purchases → complete if needed  
6. stock adjustments if required for invoice stock rules  
7. invoices (sales + lines)  
8. payments (cap to balance; skip ≤ 0)

### Credentials

Human will supply SiteGround read-only MySQL credentials and approve Remote IP **separately**. Until then, scaffold the worker so it fails closed if env is missing. Do not hardcode passwords. Do not use POS website UI passwords for MySQL.

### Deliverables

- Sync worker code in `HAL_POS_Backend` (or clearly documented sibling package on same server)
- Postgres migrations for checkpoints + id map
- Env example entries (no secrets)
- README/runbook section: how to start, checkpoints, dead letters, reconciliation
- Summary of latency expectation (poll interval, e.g. 30–60s) — call it **near-real-time**, not “realtime CDC”

### First reply expected from you

1. Confirm you can see `HAL_POS_Backend` and summarize its stack in 5–10 bullets.  
2. Confirm Postgres access pattern.  
3. Propose exact files/modules to add.  
4. List env vars and SiteGround approval steps still needed.  
5. **Do not write production sync code until the human says “implement” after that plan.**

## PROMPT END
