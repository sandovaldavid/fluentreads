# AGENTS.md - Contexto para agentes de IA

> Este archivo da contexto a cualquier CLI AI agent (opencode, Claude Code, Cursor, etc.) que trabaje en este repositorio. Léelo completo antes de empezar cualquier tarea.

## 1. Identidad del proyecto

**FluentReads** es una tienda online de libros digitales, packs de estudio y material para exámenes internacionales de inglés. El negocio opera en Perú (moneda PEN - Sol peruano) y la UI está en español.

### Modelo de negocio

- **Low-volume, high-speed**: negocio de bajo volumen de ventas pero que requiere máxima rapidez de navegación web.
- **Pago por transferencia bancaria**: NO se usa pasarela de pago (Stripe, PayPal, etc.). El cliente transfiere y confirma.
- **Pedidos por WhatsApp**: el "carrito" se construye en localStorage y se envía por WhatsApp al vendedor. NO hay checkout online con pago integrado.
- **Sin autenticación de usuarios**: no hay login, no hay cuentas de cliente, no hay panel de usuario.

### Concepto arquitectónico

> "Base de datos estática para negocios de bajo volumen que requieren rapidez en la navegación web."

El sitio es **100% estático** (sin adapter SSR). Los datos de productos viven como JSON en el repo y se "freezan" en el HTML en build time. Esto da máxima velocidad de carga (no hay servidor que responda, solo CDN).

**Migración planificada**: Decap CMS en `/admin` (Sprint 7) permitirá editar el JSON via UI web sin tocar código, commiteando al repo y triggereando rebuild automático de Vercel. **Gist descartado** (no actualiza el sitio sin rebuild, sin validación de schema, rate limits de la API).

## 2. Stack técnico

| Componente      | Versión                                                                   | Notas                                                |
| --------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| Framework       | Astro 7.0.6                                                               | Sitio estático, sin adapter SSR                      |
| UI islands      | @astrojs/react 6.0.1 + React 19                                           | Solo para componentes interactivos (filtro, carrito) |
| CSS             | Tailwind v4 (vía @tailwindcss/vite)                                       | Config en `src/styles/global.css` con `@theme`       |
| Package manager | bun 1.3.14                                                                | NO usar npm/yarn                                     |
| Lenguaje        | TypeScript (strict)                                                       | `tsconfig.json` extiende `astro/tsconfigs/strict`    |
| Formato         | Prettier + prettier-plugin-astro + prettier-plugin-tailwindcss            |                                                      |
| Lint            | ESLint flat config + eslint-plugin-astro + eslint-plugin-react + jsx-a11y |                                                      |
| Commits         | Conventional Commits sin emojis                                           | commitlint + husky validan                           |
| Releases        | release-please (main=Latest, develop=Pre-release rc)                      |                                                      |
| Deploy          | Vercel (main=prod, develop=preview)                                       | vía GitHub Actions                                   |
| DevContainer    | ghcr.io/sandovaldavid/fluentreads-devcontainer                            | Node 22 + bun + Astro CLI                            |

## 3. Estructura del proyecto

```text
/
├── .devcontainer/          # DevContainer (Dockerfile, devcontainer.json)
├── .github/workflows/      # CI + devcontainer + deploy + release-please
├── .husky/                 # Git hooks (pre-commit, commit-msg)
├── .vscode/                # Settings, tasks, keybindings, launch
├── docs/                   # Documentación de deuda técnica (12 archivos .md)
│   ├── README.md           # Índice
│   ├── audit-summary.md    # Resumen ejecutivo de auditoría
│   ├── astro-best-practices.md
│   ├── bugs-logic.md
│   ├── bugs-styles.md
│   ├── accessibility.md
│   ├── performance.md
│   ├── security.md
│   ├── duplicate-dead-code.md
│   ├── incomplete-features.md
│   ├── database-schema.md
│   └── roadmap.md          # Cronograma de sprints quincenales
├── public/                 # Assets estáticos no procesados (favicon, manifest, imágenes)
├── src/
│   ├── assets/             # Imágenes procesadas por Vite/Astro
│   ├── components/         # Componentes Astro + React islands
│   ├── config/             # Configuración centralizada (site.ts) [TODO B2]
│   ├── database/           # JSON "base de datos" (books, packs, exams, testimonies, etc.)
│   ├── layouts/            # Layout.astro (SEO, meta tags, JSON-LD)
│   ├── pages/              # Rutas file-based (index, catalogo, contacto, etc.)
│   ├── scripts/            # Scripts client-side (HeroBanner.ts, mediaCarousel.ts)
│   ├── styles/             # CSS global y por módulo
│   ├── types/              # Tipos TypeScript (book, pack, exam, product, navigation)
│   └── utils/              # Utilidades (cartManager, listProducts, catalogFilters, etc.)
├── AGENTS.md               # Este archivo
├── README.md               # Documentación del proyecto
├── astro.config.mjs        # Config de Astro (integrations, site, vite)
├── commitlint.config.cjs   # Reglas de commits convencionales sin emojis
├── eslint.config.js        # ESLint flat config
├── package.json
├── tsconfig.json           # TypeScript + import aliases
└── vercel.json             # Config de deploy
```

## 4. Reglas de estilo y convenciones

### Commits (OBLIGATORIO)

Formato **Conventional Commits sin emojis**:

```
type(scope): descripción en imperativo
```

**Tipos permitidos**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes permitidos**: `catalog`, `details`, `payment`, `contact`, `cart`, `checkout`, `home`, `testimonios`, `header`, `footer`, `navbar`, `hero`, `benefits`, `seo`, `db`, `config`, `ci`, `env`, `devcontainer`, `vscode`, `agents`, `docs`, `deps`, `security`, `a11y`, `perf`, `styles`, `utils`, `types`, `layouts`, `components`, `pages`, `scripts`, `assets`, `release`

**Reglas**:

- Sin emojis (rompen release-please que parsea el changelog).
- Subject en minúscula, sin punto final, máximo 100 chars.
- Scope obligatorio (derivar de la estructura del proyecto).
- Body y footer opcionales, separados por línea en blanco.

**Ejemplos válidos**:

```
feat(catalog): add server-side search filtering
fix(details): correct exam difficulty enum mapping
docs(agents): add project context for AI agents
ci(devcontainer): publish image to ghcr on main push
```

**Ejemplos INVÁLIDOS** (rechazados por commitlint):

```
✨ Add new feature                    # emoji
feat: add feature                     # sin scope
Feat(Catalog): Add feature            # mayúsculas, no imperativo
feat(catalog): add feature.           # punto final
```

### Código

- **Sin `console.log` en producción**: regla ESLint `no-console: error` (permitido `console.warn`/`console.error`).
- **Sin `any` sin justificación**: regla `@typescript-eslint/no-explicit-any: warn`.
- **Sin `innerHTML` con datos dinámicos**: regla `no-restricted-syntax` (XSS).
- **Sin `target="_blank"` sin `rel="noopener noreferrer"`**: regla `react/jsx-no-target-blank`.
- **Imports via aliases**: `@components/*`, `@layouts/*`, `@styles/*`, `@utils/*`, `@types/*`, `@database/*`, `@assets/*`, `@config/*`, `@scripts/*` (configurado en `tsconfig.json`).
- **Componentes Astro**: siempre definir `interface Props` tipada, nunca usar `Astro.props` sin tipo.
- **React islands**: `client:visible` por defecto (no `client:load` salvo críticos above-the-fold).
- **Estilos**: scoped en componentes (`<style>`) o archivos en `src/styles/`. Sin `:global()` innecesario.
- **Tipos**: usar `import type` para tipos (config `verbatimModuleSyntax` en strict).
- **No añadir emojis** a código, comentarios, ni commits.

## 5. MCPs disponibles

### astro-docs (MCP HTTP)

Configurado en `.mcp.json`:

```json
{
  "mcpServers": {
    "astro-docs": {
      "type": "http",
      "url": "https://mcp.docs.astro.build/mcp"
    }
  }
}
```

**Uso**: consulta SIEMPRE la documentación de Astro via este MCP antes de asistir con APIs de Astro. Astro 7 rompe varias cosas de v5/v6 (SSRManifest, adapter API, fonts, etc.). Tu entrenamiento puede estar desactualizado.

### codebase-memory-mcp

Grafo de conocimiento del codebase. Prefiere `search_graph`/`trace_path` sobre grep/glob para descubrir código estructural. Para strings literales o archivos no-código, usa grep/glob.

## 6. Comandos

```sh
# Desarrollo
bun run dev              # Dev server en http://localhost:4321
bun run preview          # Preview del build de producción

# Calidad
bun run lint             # ESLint
bun run lint:fix         # ESLint con auto-fix
bun run format           # Prettier --write .
bun run format:check     # Prettier --check .
bun run check            # astro check (TypeScript + .astro validation)
bun run typecheck        # alias de check

# Build
bun run build            # astro check && astro build (con type-check)
bun run build:force      # astro build sin type-check (emergencias)

# Husky (automático en commit)
# pre-commit → lint-staged (eslint + prettier en archivos staged)
# commit-msg → commitlint (valida formato convencional sin emojis)
```

**Antes de terminar cualquier tarea**, verifica:

```sh
bun run lint && bun run check && bun run build
```

## 7. Branching y releases

### Ramas

| Rama                                      | Propósito          | Merge method                      | Release                                    |
| ----------------------------------------- | ------------------ | --------------------------------- | ------------------------------------------ |
| `main`                                    | Producción estable | merge-commit o squash (no rebase) | GitHub Release "Latest" (vX.Y.Z)           |
| `develop`                                 | Pre-release        | squash por convención             | GitHub Release "Pre-release" (vX.Y.Z-rc.N) |
| `feat/*`, `fix/*`, `refactor/*`, `docs/*` | Feature branches   | squash a develop/main             | -                                          |

### Reglas (via GitHub Rulesets)

- **PR obligatorio** para main y develop (sin review requerido, solo dev).
- **CI requerido**: jobs `lint`, `check`, `build` del workflow `ci.yml` deben pasar antes de merge.
- **Auto-merge habilitado**: al crear un PR puedes activar auto-merge; se mergeará solo cuando CI esté verde.
- **Force-push bloqueado** en main y develop.
- **Borrado bloqueado** en main y develop.
- **Rebase bloqueado** repo-wide (solo merge-commit y squash).
- **Borrado automático** de feature branches tras merge.

### release-please

- Push a `main` → `release-please-main.yml` crea PR de release → merge → GitHub Release "Latest" + tag `vX.Y.Z` + CHANGELOG.md.
- Push a `develop` → `release-please-develop.yml` crea PR de pre-release → merge → GitHub Release "Pre-release" + tag `vX.Y.Z-rc.N`.
- **El histórico anterior usa gitmojis**: release-please los agrupará en el primer release `v0.1.0` como "Initial release". A partir de ahí, solo commits convencionales.

## 8. Enfoque de base de datos

### Actual (pre-B8)

JSON en `src/database/` (13 archivos: books, packs, exams, testimonies, offers, editorial, categories, faqs, pageInformation, etc.). Importados directamente sin schema validation.

### Migración planificada (B8 - Sprint 5-6)

`astro:content` collections con `file()` loader y schemas Zod. Mover JSON a `src/data/`. Validación en build time de todos los valores (enums, tipos, campos requeridos).

### Edición sin código (Sprint 7)

**Decap CMS** en `/admin`:

- Panel web para editar JSON via UI.
- Auth via GitHub OAuth.
- Commit al repo → Vercel rebuild automático via Git integration.
- Mantiene content collections + validación Zod.
- **Gist descartado**: no actualiza el sitio sin rebuild, sin validación, rate limits.

## 9. Anti-patterns (LO QUE NO DEBES HACER)

- **No añadir emojis** a commits, código, ni comentarios.
- **No usar `astro:transitions`** sin `<ClientRouter />` en el Layout.
- **No importar desde `public/`** — usar `src/assets/` para imágenes procesadas.
- **No usar `define:vars` sin `is:inline`** en `<script>` (rompe bundling).
- **No introducir pasarelas de pago** (Stripe, PayPal, etc.) — el negocio usa transferencia bancaria.
- **No implementar autenticación de usuarios** — no aplica al modelo.
- **No añadir adapter SSR** sin discusión explícita — rompe el modelo "estático + rápido".
- **No editar JSON de `src/database/`** sin validar schema (post-B8 con Zod).
- **No usar Google Fonts via `<link>`** — self-hostear con `@fontsource/*`.
- **No commitear `.mcp.json` ni `.claude/`** — están en `.gitignore` (configs personales).
- **No usar `npm` ni `yarn`** — el proyecto usa `bun`.
- **No usar `client:load`** en React islands below-the-fold — usar `client:visible`.
- **No añadir `target="_blank"`** sin `rel="noopener noreferrer"`.
- **No usar `innerHTML`** con datos dinámicos — usar `textContent` o DOM API.
- **No dejar `console.log`** en código de producción.
- **No crear componentes sin `interface Props`** tipada.

## 10. Antes de empezar una tarea

1. **Lee `docs/roadmap.md`** para ver en qué sprint/bloque estás.
2. **Lee el doc específico del bloque** (e.g. `docs/bugs-logic.md` para B3, `docs/astro-best-practices.md` para B0/B8).
3. **Consulta `docs/audit-summary.md`** para contexto general de la deuda técnica.
4. **Verifica el MCP de Astro** para APIs que vayas a usar (especialmente si tocas `astro.config.mjs`, content collections, imágenes, view transitions).
5. **Termina con**: `bun run lint && bun run check && bun run build` pasando limpio.

## 11. Estado actual de la deuda técnica

Ver `docs/README.md` para el estado de cada bloque. Resumen:

- **B0 (tooling)**: completado en este commit.
- **B1 (CI/CD)**: pendiente — deploy Vercel + release-please.
- **B2 (centralización)**: pendiente — `src/config/site.ts`.
- **B3 (bugs lógica)**: pendiente — 30 bugs P0-P2.
- **B4 (bugs estilos)**: pendiente — 18 bugs.
- **B5 (accesibilidad)**: pendiente — 19 issues.
- **B6 (performance)**: pendiente — 16 issues.
- **B7 (seguridad)**: pendiente — 13 issues.
- **B8 (refactor collections)**: pendiente — Sprint 5-6.
- **B9 (features incompletas)**: pendiente — Sprint 6-7 (incluye Decap CMS).
- **B10 (README + docs finales)**: pendiente — Sprint 8.

## 12. Referencias

- [Documentación de Astro](https://docs.astro.build) (via MCP astro-docs)
- [docs/](./docs/) — auditoría técnica completa
- [docs/roadmap.md](./docs/roadmap.md) — cronograma de sprints
- [Conventional Commits](https://www.conventionalcommits.org/) — formato de commits
- [release-please](https://github.com/googleapis/release-please) — automatización de releases
- [Decap CMS](https://decapcms.org/) — CMS para sitios estáticos (planificado Sprint 7)
