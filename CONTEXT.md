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
- `/cadastro`
- `/beverages`
- `/beverages/new`
- `/beverages/history`
- `/ingredients`
- `/ingredients/new`

## Backend Contract

- Main backend URL is hardcoded in the frontend: `https://sarara-be.vercel.app/api`
- Login, beverage CRUD, ingredient CRUD, sync, and graph/history requests mostly target that production backend directly
- This project does not currently centralize the API base URL in env config

## Auth Model

- App auth state is driven mainly by `localStorage.getItem("authToken")`
- Login also persists the token into IndexedDB for offline access
- There is inconsistent token handling in the codebase:
  - `App.jsx` uses `authToken`
  - `Login.jsx` writes `authToken`
  - `Nav.jsx` reads and clears `token`
- Treat auth storage as inconsistent until unified

## Offline-First Pieces

- IndexedDB helpers in `src/utils/db.js`
- Secondary IndexedDB helper layer in `src/services/db.js`
- Shared web worker for local persistence in `src/workers/dbWorker.js`
- Offline context provider in `src/context/OfflineContext.jsx`
- Sync UI in `src/components/SyncManager.jsx`
- PWA registration in `src/main.jsx`

## Main Functional Areas

- Login and signup forms
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
- The public folder contains `barchef.webp` and `barchef512.webp`, while PWA config references `pwa-icon-192.png` and `pwa-icon-512.png`. Future PWA work should verify icon availability explicitly.

## Known Risks In Code

- High: signup in `src/components/Cadastro.jsx` posts to `http://localhost:7778/api/users` instead of the production backend URL used by the rest of the app. This is a likely production bug unless a local proxy is expected.
- High: `src/components/Nav.jsx` uses localStorage key `token`, while the rest of the app uses `authToken`. Logout and auth visibility can desync.
- Medium: offline logic is split across two different storage/sync stacks:
  - `src/utils/db.js` + worker-based flow
  - `src/services/db.js` + `src/services/syncService.js`
- Medium: `src/components/IngredientsList.jsx` references `getAllData('ingredients')` in offline mode, but that helper is not imported in the file.
- Medium: several frontend history/chart callers use endpoint shapes that do not clearly match the backend implementation for beverage history.

## Local Development

- Install dependencies: `yarn install`
- Start dev server: `yarn dev`
- Preview production build: `yarn preview`

## Validation Notes

- Live production URL responded on 2026-05-20
- Local `yarn build` could not be completed in this workspace snapshot because Vite was not installed locally yet (`vite: not found`). That means deploy availability is confirmed, but local build reproducibility is still unverified on this machine
