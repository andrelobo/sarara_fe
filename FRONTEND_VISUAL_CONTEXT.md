# BarChef Frontend Visual Context

Last updated: 2026-05-21

## O que mudou

- O frontend deixou de se apoiar em grids de cards CRUD para as telas principais de estoque.
- A navegacao ganhou shell operacional mobile-first com:
  - `AppShell`
  - `TopOperationalBar`
  - `BottomNav`
  - `MobileShell`
- A home agora existe como painel operacional real em `/` com metricas e atalhos.
- Bebidas, ingredientes e usuarios foram reorganizados como listas operacionais compactas.
- Historico de bebidas ganhou uma pagina visualmente consistente com filtros, grafico e tabela.
- Formularios principais de criacao e edicao foram alinhados ao novo design system.
- Sync/offline foi mantido, mas com apresentacao visual mais discreta e premium.

## Paleta

- green: `#0E2A24`
- gold: `#E6B450`
- cream: `#F2F2F2`
- sand: `#CDAF7D`
- black: `#1C1C1C`

## Fontes

- logo / titulos especiais: `Playfair Display`
- UI principal: `Inter`
- UI secundaria: `Manrope`

## Componentes novos

Criados em `src/components/ui/`:

- `AppShell`
- `MobileShell`
- `BottomNav`
- `TopOperationalBar`
- `OperationalList`
- `OperationalRow`
- `MetricTile`
- `FloatingActionButton`
- `StatusPill`
- `AppButton`
- `EmptyState`
- `SearchBar`

## Direcao aplicada

- mobile-first
- dark hospitality UI
- acoes mais proximas ao polegar
- leitura operacional rapida
- uso de cards apenas para resumo, metricas e blocos de contexto
- bordas discretas douradas e superficies quase pretas
- listas elegantes em vez de mosaicos administrativos

## Telas trabalhadas nesta passada

- `Login`
- `HomeDashboard`
- `BeveragesList`
- `IngredientsList`
- `UserManagement`
- `BeverageHistoryPage` via `BeverageHistoryChart`
- `CreateBeverage`
- `CreateIngredient`
- `EditBeverageCard`
- `EditIngredientCard`
- `SalonDashboard`
- `TablesGrid`
- `TableCard`
- `OfflineIndicator`
- `SyncManager`

## Regras preservadas

- sem alterar contratos com backend
- sem alterar autenticacao
- sem mexer na estrategia de IndexedDB/sync
- sem remover rotas existentes
- build deve continuar passando em `yarn build`

## Proximos passos

- aplicar o mesmo padrao visual em `TableDetail` e `CommandView`
- reduzir componentes antigos nao usados (`Nav`, `BeverageCard`, `IngredientCard`, telas legacy)
- revisar consistencia entre historicos e contratos reais do backend
- considerar self-hosting das fontes se o produto precisar de fidelidade offline total
- evoluir a camada offline do Salon sem misturar com esta sprint visual
