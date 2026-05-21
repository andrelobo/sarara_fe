# BarChef Frontend Context

Last updated: 2026-05-21

## Identity

- Repository: `https://github.com/andrelobo/sarara_fe.git`
- Runtime: React 18 + Vite
- Styling/tooling observed: Tailwind CSS, SweetAlert2, React Hot Toast, Recharts, Vite PWA
- Deployment target in code/config: Vercel
- Production base URL: `https://barchef-sarara.vercel.app`
- Production availability verified on 2026-05-20:
  - root URL returned HTTP `200`

## Git State

- `barchef-fe` is now the working tree for `sarara_fe`
- Remote `origin` points to `https://github.com/andrelobo/sarara_fe.git`
- Default branch in the restored repo is `main`

## Entry Points

- App bootstrap: `src/main.jsx`
- Main app shell and live routes: `src/App.jsx`
- SPA rewrite on Vercel: [vercel.json](/home/lobo/Área%20de%20trabalho/KODE/BarChef/barchef-fe/vercel.json:1)

## Live Route Map

Routes currently wired in `src/App.jsx`:

- `/`
- `/login`
- `/setup-account`
- `/cadastro`
- `/usuarios`
- `/beverages`
- `/beverages/new`
- `/beverages/history`
- `/ingredients`
- `/ingredients/new`
- `/salon`
- `/salon/tables`
- `/salon/tables/:id`
- `/salon/commands/:id`

## Backend Contract

- Main backend URL now flows through `src/config/api.js`
- Default backend URL is `https://sarara-be.vercel.app/api`
- Optional override is `VITE_API_BASE_URL`
- Login, beverage CRUD, ingredient CRUD, sync, and graph/history requests mostly target that production backend directly
- Salon requests currently call:
  - `/api/tables`
  - `/api/tables/:id`
  - `/api/tables/:id/open`
  - `/api/tables/:id/close`
  - `/api/commands`
  - `/api/commands/:id`
  - `/api/commands/:id/items`
  - `/api/commands/:id/items/:itemId`
  - `/api/commands/:id/close`
  - `/api/commands/:id/cancel`

## Auth Model

- App auth state is driven mainly by `localStorage.getItem("authToken")`
- The current user is also stored in `localStorage` as `authUser`
- Login also persists the token into IndexedDB for offline access
- `src/utils/auth.js` is now the session helper used by the live app shell
- The live route guard in `src/App.jsx` loads `/api/users/me` to validate the stored session
- Role handling now follows the backend contract:
  - `admin`: user management plus full inventory and Salon access
  - `manager`: inventory write plus full Salon access
  - `waiter`: read-only inventory plus Salon operational access

## Offline-First Pieces

- IndexedDB helpers in `src/utils/db.js`
- Secondary IndexedDB helper layer in `src/services/db.js`
- Shared web worker for local persistence in `src/workers/dbWorker.js`
- Offline context provider in `src/context/OfflineContext.jsx`
- Sync UI in `src/components/SyncManager.jsx`
- PWA registration in `src/main.jsx`

## Main Functional Areas

- Login form
- Link-based account activation form
- Admin user management area
- Beverage list, create flow, edit flow, delete flow
- Ingredient list, create flow, edit flow, delete flow
- Beverage history view
- Salon dashboard
- Table list with create/open/close flows
- Table detail with command creation
- Command detail with item add/status updates and close/cancel flows
- Table and command detail now render backend audit history timelines
- Command item modal can now create:
  - free manual items
  - items linked to existing beverages from inventory
- Beverage-linked command items now follow this stock rule:
  - stock is deducted when the command is closed
  - command close fails if inventory is insufficient
- Offline cache plus deferred sync queue for inventory

## Build and Deploy

- Build command in `package.json`: `yarn build`
- Vite PWA plugin is configured in `vite.config.js`
- Vercel config rewrites all routes to `index.html`

## Important Current Notes

- `src/App.jsx` is the canonical route map right now. There is a separate `src/routes/Routes.jsx`, but it is not used by the live app shell.
- The codebase contains older/stale pages and chart files that are not all wired into the active route tree.
- `src/components/Cadastro.jsx` is now a legacy component and is no longer used by the live route tree.
- `src/components/SalonDashboard.jsx`, `TablesGrid.jsx`, `TableDetail.jsx`, `CommandView.jsx`, `TableCard.jsx`, and `AddCommandItemModal.jsx` now form the first live Salon shell.
- `AddCommandItemModal.jsx` now fetches beverages from the backend when opened and lets the operator select an existing inventory beverage while keeping price entry manual.
- `CommandView.jsx` now warns the operator that beverage-linked items deduct stock when the command is closed.
- `AuditTimeline.jsx` now renders backend `auditTrail` data in table and command detail pages.
- Salon currently talks to the backend in online mode only. The offline queue/store still covers inventory flows, not tables or commands.
- The public folder contains `barchef.webp` and `barchef512.webp`, while PWA config references `pwa-icon-192.png` and `pwa-icon-512.png`. Future PWA work should verify icon availability explicitly.

## Known Risks In Code

- Medium: offline logic is split across two different storage/sync stacks:
  - `src/utils/db.js` + worker-based flow
  - `src/services/db.js` + `src/services/syncService.js`
- Medium: Salon is now available in the live shell, but tables and commands still have no IndexedDB persistence or retry queue integration.
- Medium: command items can now link to beverages and deduct stock on close, but price remains manual and there is still no offline conflict handling for this rule.
- Medium: audit trails are now visible in the live shell, but there is still no filtering, pagination, or dedicated admin/reporting view for these histories.
- Medium: the frontend now depends on the new backend RBAC/onboarding contract; if only one side is deployed, admin/setup flows will fail
- Medium: the waiter role is hidden from edit/delete/create UI in the inventory shell, but older unused components still exist in the repo
- Medium: several frontend history/chart callers use endpoint shapes that do not clearly match the backend implementation for beverage history.

## Local Development

- Install dependencies: `yarn install`
- Start dev server: `yarn dev`
- Preview production build: `yarn preview`

## Validation Notes

- Live production URL responded on 2026-05-20
- Local `yarn build` completed successfully on 2026-05-20 after dependency installation
- Local `yarn build` also completed successfully on 2026-05-21 after the first Salon routes/components were added
- Build emitted non-blocking warnings from Vite/Sass:
  - `splitVendorChunk` has no effect with the current manual chunk config
  - SweetAlert2 SCSS still uses deprecated Sass `@import`
  - Browserslist data is stale and can be refreshed later
