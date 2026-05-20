# BarChef Frontend

## Overview

Frontend web do BarChef para login, operacao de estoque e administracao de usuarios.

## Stack

- React 18
- Vite
- Tailwind CSS
- SweetAlert2
- React Hot Toast
- IndexedDB para suporte offline

## Main Routes

- `/login`
- `/setup-account`
- `/beverages`
- `/beverages/new`
- `/beverages/history`
- `/ingredients`
- `/ingredients/new`
- `/usuarios`
- `/cadastro` alias para a area admin de usuarios

## Access Rules

- Login e ativacao por link sao publicos.
- `admin` pode acessar a area de usuarios e gerenciar todo o sistema.
- `manager` pode criar, editar e remover bebidas e ingredientes.
- `waiter` pode apenas consultar estoque e historicos.

## Backend Contract

- API base padrao: `https://sarara-be.vercel.app/api`
- Override opcional por ambiente: `VITE_API_BASE_URL`
- O frontend espera JWT no formato `Authorization: Bearer <token>`

## Local Development

```bash
yarn install
yarn dev
```

Build de producao:

```bash
yarn build
```

## Notes

- Sessao local usa `authToken` e `authUser` no `localStorage`.
- O token tambem e salvo no IndexedDB para suporte offline.
- A ativacao de conta por link usa `/setup-account?token=...`.
- O cadastro publico antigo deixou de ser o fluxo principal; novos usuarios devem ser criados pelo admin.
