# BarChef Frontend Context

Last updated: 2026-05-23

## Identity

- Repository: `https://github.com/andrelobo/sarara_fe.git`
- Runtime: React 18 + Vite
- Styling/tooling observed: Tailwind CSS, SweetAlert2, React Hot Toast, Recharts, Vite PWA
- Deployment target in code/config: Vercel
- Production base URL: `https://barchef-sarara.vercel.app`
- Production availability verified on 2026-05-20:
  - root URL returned HTTP `200`
- Operational deployment workflow in practice: pushes to `origin/main` on GitHub trigger the connected automatic deploys.
- Canonical brand name: `BarChef`
- Canonical brand system now separates:
  - mark/icon: `src/components/brand/BarChefMark.jsx`
  - wordmark/tagline: `src/components/brand/BarChefWordmark.jsx`
  - composed lockup: `src/components/brand/BarChefLogo.jsx`
- Public optimized brand asset for metadata/PWA: `public/barchef-mark.svg`
- Canonical frontend brand tokens now live in `src/brand/barchefTheme.js`

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
  - `/api/shifts`
  - `/api/shifts/:id`
  - `/api/shifts/:id/close`

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
- Shared sync orchestration now runs through `src/services/syncService.js`
- PWA registration in `src/main.jsx`
- `Offline Salon` foundation now has dedicated local stores for:
  - `tables`
  - `commands`
  - `salon-queue`
- Legacy manual service worker file still exists in `public/sw.js`, but metadata/cache references are now aligned to `barchef-mark.svg`, `barchef.webp`, and `barchef512.webp`

## Main Functional Areas

- Login form
- Link-based account activation form
- Admin user management area
- Admin onboarding card with immediate activation-link display plus copy action
- Beverage list, create flow, edit flow, delete flow
- Ingredient list, create flow, edit flow, delete flow
- Beverage history view
- Salon dashboard
- Shift panel inside the Salon dashboard for waiter shift open/close and totals
- Table list with create/open/close flows
- Table detail with command creation
- Command detail with item add/status updates and close/cancel flows
- Command detail now also captures structured payments before close:
  - `cash`
  - `pix`
  - `debit`
  - `credit`
  - `voucher`
- Table and command detail now render backend audit history timelines
- Table cards, table detail, and command detail now expose offline sync state with operational badges:
  - `Somente local`
  - `Pendente`
  - `Falha sync`
  - `Sincronizado` / `Ao vivo`
- Table detail and command detail now also expose a focused retry action for failed Salon sync operations, requeuing only the failed operations tied to the current mesa/comanda before calling the shared sync flow
- Command item rows now also expose a focused retry action when a single item operation fails in the `salon-queue`
- `SyncManager.jsx` now stays visible not only for pending operations but also for failed queue entries, surfacing separate counters for pending vs failed inventory/Salon work
- `BeveragesList.jsx` and `IngredientsList.jsx` now expose focused retry actions for failed inventory sync operations in their own area
- `BeveragesList.jsx` and `IngredientsList.jsx` now also expose focused retry actions for a single failed beverage/ingredient row
- Command item modal can now create:
  - free manual items
  - items linked to existing beverages from inventory
- Beverage-linked command items now follow this stock rule:
  - stock is deducted when the command is closed
  - command close fails if inventory is insufficient
- Offline cache plus deferred sync queue for inventory

## Brand and Layout Notes

- The old raster import `src/assets/sarara-logo.png` is now legacy and no longer needed by the main shell
- `Nav.jsx` uses the separated brand system with mark + wordmark in a compact horizontal lockup
- `Login.jsx` uses the full BarChef lockup and the new deep rebrand shell
- `SetupAccount.jsx` now uses the new brand system and no longer references `Sarara BarChef`
- `SalonDashboard.jsx` now follows the same brand direction and copy with the current stock-on-close behavior
- `ShiftPanel.jsx` now extends the Salon shell with the first shift-control slice without opening a parallel admin dashboard
- `tailwind.config.js` and `src/index.css` now reflect the BarChef palette and the `Playfair Display` + `Inter` + `Manrope` font stack
- `index.html`, `vite.config.js`, and `public/manifest.json` now use the BarChef mark and corrected theme colors

## Build and Deploy

- Build command in `package.json`: `yarn build`
- Vite PWA plugin is configured in `vite.config.js`
- Vercel config rewrites all routes to `index.html`

## Important Current Notes

- `src/App.jsx` is the canonical route map right now. There is a separate `src/routes/Routes.jsx`, but it is not used by the live app shell.
- The codebase contains older/stale pages and chart files that are not all wired into the active route tree.
- `src/components/Cadastro.jsx` is now a legacy component and is no longer used by the live route tree.
- `src/components/UserManagement.jsx` already supports the intended admin flow: create with `invite` or `password`, render the latest activation link in the UI, and copy that link without leaving the app.
- `src/components/SalonDashboard.jsx`, `TablesGrid.jsx`, `TableDetail.jsx`, `CommandView.jsx`, `TableCard.jsx`, and `AddCommandItemModal.jsx` now form the first live Salon shell.
- `SalonDashboard.jsx` now also embeds `ShiftPanel.jsx`:
  - waiter can open and close the own shift
  - manager/admin can choose a waiter and open a shift for that waiter
  - recent shifts stay visible in the same operational shell
  - the selected shift shows live totals when open and the saved snapshot when closed
- `TableDetail.jsx` now supports explicit waiter assignment for admin before opening a table or creating a command.
- `AddCommandItemModal.jsx` now fetches beverages from the backend when opened and lets the operator select an existing inventory beverage while keeping price entry manual.
- `CommandView.jsx` now warns the operator that beverage-linked items deduct stock when the command is closed.
- `CommandView.jsx` now captures structured payment rows before closing a non-zero command and blocks close until the informed payment total matches the command total.
- `CommandView.jsx` now persists those payments into the offline close flow and into the `salon-queue` replay payload for `command_close`.
- `AuditTimeline.jsx` now renders backend `auditTrail` data in table and command detail pages.
- `Offline Salon` slice 1 is now started:
  - `TablesGrid.jsx` falls back to local cached tables when the backend is unavailable
  - `TableDetail.jsx` can open/close table and create command offline
  - `CommandView.jsx` can add item, update item status, and close/cancel command offline
  - those Salon actions are persisted locally and appended to `salon-queue`
- `Offline Salon` slice 2 is now started:
  - `SyncManager` and `OfflineContext` now use the shared `syncService.js`
  - the shared sync flow now processes both `sync-queue` and `salon-queue`
  - local `table` and `command` IDs are reconciled to server IDs during replay
  - local command item IDs are also rewritten when the backend returns the persisted item
- local Salon sync failures are now copied back into the affected offline table/command record so the UI can warn the operator without opening IndexedDB
- `TableDetail.jsx` and `CommandView.jsx` can now requeue failed Salon operations for the current mesa/comanda without forcing the operator to rerun the entire troubleshooting flow manually
- `CommandView.jsx` can now also requeue failed item-level Salon operations from inside the command row itself
- `SyncManager.jsx` now warns when only failed operations remain in the queues, instead of disappearing as if the local state were clean
- `BeveragesList.jsx` can now requeue failed inventory operations scoped to `beverages`
- `IngredientsList.jsx` can now requeue failed inventory operations scoped to `ingredients`
- `BeveragesList.jsx` can now requeue failed inventory operations for a specific beverage row
- `IngredientsList.jsx` can now requeue failed inventory operations for a specific ingredient row
- legacy ingredient offline updates/deletes are now being normalized to persist `entity` and `entityId` in the inventory `sync-queue`
- `useOfflineData.jsx` now persists `localEntityId` for offline inventory creates so failed create operations can be traced back to the local row
- `CommandView.jsx` no longer hides the whole command screen when it falls back to a cached offline command after a fetch error
- PWA metadata and manifest now reference real frontend assets instead of missing `pwa-icon-192.png` and `pwa-icon-512.png` placeholders.
- A lightweight automated frontend test base now exists with `node:test`:
  - `src/utils/salonAssignment.test.js`
  - `src/utils/salonAssignment.js`
  - `src/utils/salonOffline.test.js`
  - `src/utils/salonOffline.js`
- The canonical next-phase roadmap for `Offline Salon -> Realtime -> Intelligence Layer` is tracked in [barchef-be/BARCHEF_PRODUCT_ROADMAP.md](/home/lobo/Área%20de%20trabalho/KODE/BarChef/barchef-be/BARCHEF_PRODUCT_ROADMAP.md:1)

## Known Risks In Code

- Medium: offline logic is split across two different storage/sync stacks:
  - `src/utils/db.js` + worker-based flow
  - `src/services/db.js` + `src/services/syncService.js`
- Medium: Salon now has local persistence and replay through `salon-queue`, but there is still no advanced conflict policy for concurrent online/offline edits.
- Medium: failed Salon operations can now be retried from table/command detail and from an individual command item, but there is still no dedicated conflict-resolution UI when the backend rejects the replay for business reasons.
- Medium: inventory failures now have focused retry at the area and item level, but there is still no dedicated conflict-resolution UI when the backend keeps rejecting the replay and the operator needs to understand exactly why.
- Medium: command items can now link to beverages and deduct stock on close, but price remains manual and there is still no offline conflict handling for this rule.
- Medium: command close now captures structured payments and the Salon dashboard now exposes the first shift-control UI, but there is still no waiter declaration, manager cash-conference UI, or commission workflow built on top of those payments yet.
- Medium: audit trails are now visible in the live shell, but there is still no filtering, pagination, or dedicated admin/reporting view for these histories.
- Medium: the frontend now depends on the new backend RBAC/onboarding contract; if only one side is deployed, admin/setup flows will fail.
- Medium: fonts are currently loaded from Google Fonts in `src/index.css`; if the product needs stricter offline branding fidelity later, the next step is self-hosting the font files.
- Medium: several frontend history/chart callers use endpoint shapes that do not clearly match the backend implementation for beverage history.
- Medium: the automated frontend tests currently cover pure Salon assignment helpers, not DOM rendering or browser interaction flows yet

## Local Development

- Install dependencies: `yarn install`
- Start dev server: `yarn dev`
- Preview production build: `yarn preview`
- Run automated tests: `yarn test`

## Validation Notes

- Live production URL responded on 2026-05-20
- Local `yarn test` completed successfully on 2026-05-22 after the first `Offline Salon` foundation utilities were added
- Local `yarn build` completed successfully on 2026-05-20 after dependency installation
- Local `yarn build` also completed successfully on 2026-05-21 after the first Salon routes/components were added
- Local `yarn build` also completed successfully on 2026-05-21 after the deep BarChef rebrand pass
- Local `yarn build` also completed successfully on 2026-05-22 after the first `Offline Salon` persistence/queue pass
- Local `yarn build` also completed successfully on 2026-05-22 after the first `salon-queue` replay pass
- Local `yarn test` and `yarn build` both completed successfully on 2026-05-22 after adding Salon sync-state feedback in the UI
- Local `yarn test` and `yarn build` both completed successfully on 2026-05-22 after adding focused retry actions for failed Salon sync operations
- Local `yarn test` and `yarn build` both completed successfully on 2026-05-22 after adding item-level retry actions for failed Salon command rows
- Local `yarn test` and `yarn build` both completed successfully on 2026-05-22 after making `SyncManager` surface failed queue counts globally
- Local `yarn test` and `yarn build` both completed successfully on 2026-05-22 after adding focused retry actions for failed inventory sync areas
- Local `yarn test` and `yarn build` both completed successfully on 2026-05-23 after adding item-level retry actions for failed inventory rows
- Local `yarn test` and `yarn build` both completed successfully on 2026-05-23 after wiring structured payments into command close and the offline Salon replay path
- Local `yarn test` and `yarn build` both completed successfully on 2026-05-24 after embedding the first `ShiftPanel` slice into the Salon dashboard
- Build emitted non-blocking warnings from Vite/Sass:
  - `splitVendorChunk` has no effect with the current manual chunk config
  - SweetAlert2 SCSS still uses deprecated Sass `@import`
  - Browserslist data is stale and can be refreshed later
