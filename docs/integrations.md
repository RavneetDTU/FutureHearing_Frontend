# Integrations

No third-party SDK is installed. `package.json` has no Twilio, OpenAI, Firebase, Stripe, or email package. Anything that leaves the browser goes through the remote Future Hearing API.

Do not copy secrets, tokens, or passwords into this file or into source.

## Remote Future Hearing API

### Purpose
System of record for every module: auth, catalog, stock, invoices, purchases, patients, claims, users.

### Where it is used
Every function in `src/api/` except the mock branch.

### Configuration
| Name | Where |
|---|---|
| `VITE_API_BASE_URL` | `.env`, `.env.example`, read by `src/api/config.js` |
| `VITE_USE_MOCK_API` | same. `false` uses the remote API |
| `API_ORIGIN` | `vite.config.js` dev proxy target for `/v1` and `/health` |

Local base URL is `/v1` so the browser talks to the Vite origin. The proxy forwards to `API_ORIGIN`. That split exists because the session cookie is `SameSite=lax` and would not be stored on a cross-site call from `localhost` to the API host.

### Authentication
1. `POST /auth/login` with JSON `{ username, password }`.
2. Server sets httpOnly cookie `fh_session` and returns `data.token`.
3. Client keeps the token in a module variable and sends `Authorization: Bearer`.
4. Cookie is sent automatically (`credentials: 'include'`).
5. No refresh-token call exists. The server is expected to slide the session on each request.
6. `POST /auth/logout` then the client drops the memory token.

Never log the token or write it to `localStorage`.

### Request flow
```text
Browser fetch /v1/...
  → Vite dev proxy (or the deployed host, if it also proxies /v1)
    → API_ORIGIN
      → JSON { data, meta } or file bytes
```

### Response handling
`src/api/normalize.js` and `ApiError` in `src/api/client.js`. Blobs: `downloadFile` / `openFile`.

### Webhooks
None in this repo. There is no server to receive them.

### Error handling
Status 0 = network/proxy failure (common when the dev process cannot open a socket to `API_ORIGIN`). 401 = session ended. 422 = field errors. 409 is shown as `error.message` (stock conflicts use this in the mock; the live API may use 409 or 422).

### Important files
`src/api/client.js`, `src/api/config.js`, `vite.config.js`, `.env.example`.

### What can break
- Running Vite without outbound access: proxy returns 502/`EPERM` while the API is up.
- Pointing `VITE_API_BASE_URL` at the absolute API origin from `localhost`: the cookie will not stick. Keep the `/v1` proxy for local dev.
- Changing `emptyStringsToNull` or PUT behavior: every form write changes.

## Invoice PDF

### Purpose
Download a PDF for a document.

### Where
`invoicesApi.downloadPdf` → `GET /invoices/:id/pdf` → browser download named from `invoice.number`.

### Configuration
None beyond the API session.

### Webhooks
None.

### What can break
`downloadFile` requires a successful binary response. A JSON error body is parsed and thrown as `ApiError`. Pop-up blockers do not affect download (it uses an `<a download>`). Print is separate: `window.print()` on the HTML detail page (`?print=1`).

## Invoice email

### Purpose
Ask the server to email the document.

### Where
`InvoiceDetailPage` → `POST /invoices/:id/email` with `{}`.

### Configuration
SMTP is server-side. This UI has no SMTP host, user, or password.

### Error handling
Toast with `err.message`. If SMTP is not configured, behavior is entirely server-defined. TODO / NEEDS VERIFICATION: the exact error body when SMTP is off.

### What can break
Adding a required `to` field in the UI without checking the server. `Email` is sent with an empty object today.

## User invite / password reset email

### Purpose
Optional email when a user is created or a reset is requested.

### Where
`POST /users` may return `temporaryPassword` (shown once in `ResourceListPage`). `POST /auth/forgot-password` may return `resetToken` for `/reset-password?token=` when mail is not sent (`ForgotPasswordPage`).

### Configuration
No mail env vars in this repo. Settings has `enableEmailNotifications` (`PUT /settings/system`), which is stored by the API. This SPA does not send mail when that switch is on.

## WhatsApp and phone/email logs

### Purpose
Staff can record that a WhatsApp message, call, or email happened.

### Where
`src/components/crm/CommunicationsPanel.jsx`, `communicationsConfig` in `src/features/engagement/resources.jsx`. Settings switch `enableWhatsapp` in `settingsFields.js` (“Requires the backend WhatsApp Business integration”).

### Request flow
The panel posts a communication record through `communicationsApi` (`/communications`). It does not call WhatsApp or an email provider.

### What can break
Assuming a toggle in settings delivers messages. It does not, in this codebase.

## Documents (file storage)

### Purpose
Upload and fetch patient/claim files.

### Where
`DocumentsPanel` → `POST /documents/upload` and `GET /documents/:id/file`.

### Configuration
Storage (disk, S3, or otherwise) is on the API. No bucket name or cloud key is in this repo.

### What can break
Opening `/documents/:id/file` without the session cookie/bearer. The helper uses the same `request()` auth as JSON calls.

## Google fonts

`index.html` loads Inter from `fonts.googleapis.com`. Cosmetic only. The app still renders if the request fails.

## Not present

Searched the application source (not `node_modules`) for Twilio, OpenAI, Firebase, and Stripe. No client usage. Do not add those SDKs unless a task explicitly asks for a new integration and the API already exposes it.
