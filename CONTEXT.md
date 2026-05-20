# BarChef Frontend Context

Last updated: 2026-05-20

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

## Backend Contract

- Main backend URL now flows through `src/config/api.js`
- Default backend URL is `https://sarara-be.vercel.app/api`
- Optional override is `VITE_API_BASE_URL`
- Login, beverage CRUD, ingredient CRUD, sync, and graph/history requests mostly target that production backend directly

## Auth Model

- App auth state is driven mainly by `localStorage.getItem("authToken")`
- The current user is also stored in `localStorage` as `authUser`
- Login also persists the token into IndexedDB for offline access
- `src/utils/auth.js` is now the session helper used by the live app shell
- The live route guard in `src/App.jsx` loads `/api/users/me` to validate the stored session
- Role handling now follows the backend contract:
  - `admin`: user management plus full inventory access
  - `manager`: inventory write access
  - `waiter`: read-only inventory access

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
- Offline cache plus deferred sync queue

## Build and Deploy

- Build command in `package.json`: `yarn build`
- Vite PWA plugin is configured in `vite.config.js`
- Vercel config rewrites all routes to `index.html`

## Important Current Notes

- `src/App.jsx` is the canonical route map right now. There is a separate `src/routes/Routes.jsx`, but it is not used by the live app shell.
- The codebase contains older/stale pages and chart files that are not all wired into the active route tree.
- `src/components/Cadastro.jsx` is now a legacy component and is no longer used by the live route tree.
- The public folder contains `barchef.webp` and `barchef512.webp`, while PWA config references `pwa-icon-192.png` and `pwa-icon-512.png`. Future PWA work should verify icon availability explicitly.

## Known Risks In Code

- Medium: offline logic is split across two different storage/sync stacks:
  - `src/utils/db.js` + worker-based flow
  - `src/services/db.js` + `src/services/syncService.js`
- Medium: the frontend now depends on the new backend RBAC/onboarding contract; if only one side is deployed, admin/setup flows will fail
- Medium: the waiter role is hidden from edit/delete/create UI in the active shell, but older unused components still exist in the repo
- Medium: several frontend history/chart callers use endpoint shapes that do not clearly match the backend implementation for beverage history.

## Local Development

- Install dependencies: `yarn install`
- Start dev server: `yarn dev`
- Preview production build: `yarn preview`

## Validation Notes

- Live production URL responded on 2026-05-20
- Local `yarn build` completed successfully on 2026-05-20 after dependency installation
- Build emitted non-blocking warnings from Vite/Sass:
  - `splitVendorChunk` has no effect with the current manual chunk config
  - SweetAlert2 SCSS still uses deprecated Sass `@import`
  - Browserslist data is stale and can be refreshed later
