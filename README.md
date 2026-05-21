# BarChef Frontend

## Overview

Frontend web do BarChef para login, operacao de estoque, administracao de usuarios e a camada Salon.

## Stack

- React 18
- Vite
- Tailwind CSS
- SweetAlert2
- React Hot Toast
- IndexedDB para suporte offline

## Brand System

- Marca canonicamente separada em:
  - `src/components/brand/BarChefMark.jsx`
  - `src/components/brand/BarChefWordmark.jsx`
  - `src/components/brand/BarChefLogo.jsx`
- Tema da marca centralizado em `src/brand/barchefTheme.js`
- Asset vetorial publico para favicon e PWA: `public/barchef-mark.svg`
- Fontes visuais da marca:
  - logo e heading: `Playfair Display`
  - corpo: `Inter`
  - UI: `Manrope`

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
- `/salon`
- `/salon/tables`
- `/salon/tables/:id`
- `/salon/commands/:id`

## Access Rules

- Login e ativacao por link sao publicos.
- `admin` pode acessar a area de usuarios e gerenciar todo o sistema.
- `manager` pode criar, editar e remover bebidas e ingredientes.
- `waiter` pode consultar estoque e historicos.
- `admin`, `manager` e `waiter` podem acessar o Salon.
- `admin` e `manager` podem criar e editar o catalogo de mesas.
- `admin`, `manager` e `waiter` podem abrir mesas, criar comandas, adicionar itens e atualizar status da comanda.

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
- O shell principal do app ja usa a nova identidade BarChef em `Nav`, `Login`, `SetupAccount` e `SalonDashboard`.
- O cadastro publico antigo deixou de ser o fluxo principal; novos usuarios devem ser criados pelo admin.
- O Salon ja possui dashboard, grade de mesas, detalhe de mesa e detalhe de comanda.
- O detalhe de mesa e o detalhe de comanda ja exibem a linha do tempo de auditoria registrada pelo backend.
- O modal da comanda ja permite selecionar uma bebida existente do estoque e vincular esse item ao produto real.
- Itens vinculados a bebidas fazem a baixa do estoque ao fechar a comanda.
- Se o estoque estiver insuficiente, o fechamento da comanda falha e precisa ser corrigido antes.
- Mesas e comandas ainda nao entram no fluxo offline/sync.
