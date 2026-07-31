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

**Decap CMS** en `/admin` permite editar el JSON via UI web sin tocar código. El backend apunta a la rama `main` (ver `public/admin/config.yml`); como `main` requiere PR + status checks, los cambios desde el CMS pasan por el mismo flujo de PR que cualquier otro cambio. El merge dispara `deploy-vercel.yml` (GitHub Actions), no la integración nativa de Vercel con Git (deshabilitada a propósito para evitar despliegues duplicados). **Gist fue descartado** como alternativa (no actualiza el sitio sin rebuild, sin validación de schema, rate limits de la API).

## 2. Stack técnico

| Componente      | Versión                                                                    | Notas                                                |
| --------------- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| Framework       | Astro 7.0.6                                                                | Sitio estático, sin adapter SSR                      |
| UI islands      | @astrojs/react 6.0.1 + React 19                                            | Solo para componentes interactivos (filtro, carrito) |
| CSS             | Tailwind v4 (vía @tailwindcss/vite)                                        | Config en `src/styles/global.css` con `@theme`       |
| Package manager | bun 1.3.14                                                                 | NO usar npm/yarn                                     |
| Lenguaje        | TypeScript (strict)                                                        | `tsconfig.json` extiende `astro/tsconfigs/strict`    |
| Formato         | Prettier + prettier-plugin-astro + prettier-plugin-tailwindcss             |                                                      |
| Lint            | ESLint flat config + eslint-plugin-astro + eslint-plugin-react + jsx-a11y  |                                                      |
| Commits         | Conventional Commits sin emojis                                            | commitlint + husky validan                           |
| Releases        | release-please (solo `main`: GitHub Release + tag `vX.Y.Z` + CHANGELOG.md) |                                                      |
| Deploy          | Vercel (main=prod, develop=preview)                                        | vía GitHub Actions                                   |
| DevContainer    | ghcr.io/sandovaldavid/fluentreads-devcontainer                             | Node 22 + bun + Astro CLI                            |

## 3. Estructura del proyecto

```text
/
├── .devcontainer/          # DevContainer (Dockerfile, devcontainer.json)
├── .github/workflows/      # CI + devcontainer + deploy + release-please
├── .husky/                 # Git hooks (pre-commit, commit-msg)
├── .vscode/                # Settings, tasks, keybindings, launch
├── docs/                   # Auditoría técnica histórica (12 archivos .md) — ver docs/README.md, no es backlog activo
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
│   ├── config/             # Configuración centralizada (site.ts)
│   ├── content.config.ts   # Schemas Zod de las astro:content collections
│   ├── data/                # JSON consumido via getCollection() (books, packs, exams, etc.)
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
- **Imports via aliases**: `@components/*`, `@layouts/*`, `@styles/*`, `@utils/*`, `@app-types/*`, `@data/*`, `@assets/*`, `@config/*`, `@scripts/*` (configurado en `tsconfig.json`). Nota: el alias de tipos es `@app-types/*`, no `@types/*` — TypeScript trata cualquier especificador `@types/*` como un paquete de declaraciones de DefinitelyTyped y no lo resuelve como alias normal.
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

# Tests
bun run test:unit        # bun:test sobre tests/unit
bun run test:e2e         # Playwright sobre tests/e2e (requiere navegador instalado)
bun run test             # alias de test:unit
bun run check:links      # valida que los enlaces internos no rompan (scripts/check-internal-links.mjs)

# Build
bun run build            # astro check && astro build (con type-check)
bun run build:force      # astro build sin type-check (emergencias)

# Husky (automático en commit)
# pre-commit → lint-staged (eslint + prettier en archivos staged)
# commit-msg → commitlint (valida formato convencional sin emojis)
```

**Antes de terminar cualquier tarea**, verifica:

```sh
bun run lint && bun run check && bun run build && bun run test:unit
```

`test:e2e` no corre en CI como check bloqueante (solo `lint`/`check`/`build` lo son — ver sección 7), pero corrélo localmente si tocaste catálogo, carrito, checkout o formularios.

## 7. Branching y releases

### Ramas

| Rama                                      | Propósito          | Merge method                      | Release                          |
| ----------------------------------------- | ------------------ | --------------------------------- | -------------------------------- |
| `main`                                    | Producción estable | merge-commit o squash (no rebase) | GitHub Release "Latest" (vX.Y.Z) |
| `develop`                                 | Preview / staging  | squash por convención             | Ninguno — solo Vercel Preview    |
| `feat/*`, `fix/*`, `refactor/*`, `docs/*` | Feature branches   | squash a develop/main             | -                                |

### Reglas (via GitHub Rulesets)

- **PR obligatorio** para main y develop (sin review requerido, solo dev).
- **CI requerido**: jobs `lint`, `check`, `build` del workflow `ci.yml` deben pasar antes de merge.
- **Auto-merge habilitado**: al crear un PR puedes activar auto-merge; se mergeará solo cuando CI esté verde.
- **Force-push bloqueado** en main y develop.
- **Borrado bloqueado** en main y develop.
- **Rebase bloqueado** repo-wide (solo merge-commit y squash).
- **Borrado automático** de feature branches tras merge.

### release-please

- `release-please.yml` corre **únicamente en push a `main`** (`target-branch: main`) — no existe un workflow equivalente para `develop`. Crea un PR de release → al mergear, publica un GitHub Release "Latest" + tag `vX.Y.Z` + CHANGELOG.md.
- `develop` no genera releases ni tags; solo dispara `deploy-vercel.yml` para el Preview.
- **El histórico anterior usa gitmojis**: release-please los agrupó en el primer release `v0.1.0` como "Initial release". A partir de ahí, solo commits convencionales.

### Deploy

- `deploy-vercel.yml` corre en push a `main` y `develop`. Construye el sitio y despliega vía Vercel CLI (`vercel deploy`) usando los secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- La integración nativa de Vercel con Git está **deshabilitada a propósito** — si estuviera activa, cada push desplegaría dos veces (una vez por la integración nativa, otra por el workflow).
- Sin esos tres secrets configurados en el repo, el job falla rápido (timeout de 10 min) en lugar de colgarse — ver issue [#63](https://github.com/sandovaldavid/fluentreads/issues/63) si siguen sin configurarse.

## 8. Enfoque de base de datos

### Estado actual

`astro:content` collections definidas en `src/content.config.ts`, con loader `file()` y schemas Zod para cada colección (books, packs, exams, testimonies, offers, editorial, categories, faqs, legal, etc.). Los datos viven como JSON en `src/data/` y se consumen via `getCollection('nombre')` — **nunca** imports directos de JSON para colecciones registradas (confirmado: cero imports directos de `src/data/*.json` en `src/` para archivos que tienen un schema Zod). Los schemas Zod validan en build time (enums, tipos, campos requeridos). Excepción intencional: `page-information.json` no es una content collection (no tiene schema Zod) y se sigue importando directamente.

### Edición sin código

**Decap CMS** en `/admin` — implementado y en uso:

- Panel web para editar JSON via UI, configurado en `public/admin/config.yml` + `public/admin/index.html`.
- Auth via GitHub OAuth.
- Backend apunta a la rama `main`. Como `main` exige PR + status checks (`lint`/`check`/`build`), los commits del CMS no van directo a producción — pasan por el mismo flujo de PR y CI que cualquier otro cambio.
- El merge a `main` dispara `deploy-vercel.yml`, no la integración nativa de Vercel con Git.
- Mantiene content collections + validación Zod.
- **Gist fue descartado**: no actualiza el sitio sin rebuild, sin validación, rate limits.

## 9. Anti-patterns (LO QUE NO DEBES HACER)

- **No añadir emojis** a commits, código, ni comentarios.
- **No usar `astro:transitions`** sin `<ClientRouter />` en el Layout.
- **No importar desde `public/`** — usar `src/assets/` para imágenes procesadas.
- **No usar `define:vars` sin `is:inline`** en `<script>` (rompe bundling).
- **No introducir pasarelas de pago** (Stripe, PayPal, etc.) — el negocio usa transferencia bancaria.
- **No implementar autenticación de usuarios** — no aplica al modelo.
- **No añadir adapter SSR** sin discusión explícita — rompe el modelo "estático + rápido".
- **No editar JSON de `src/data/`** sin validar contra el schema Zod en `src/content.config.ts`.
- **No usar Google Fonts via `<link>`** — self-hostear con `@fontsource/*`.
- **No commitear `.mcp.json` ni `.claude/settings.local.json`** — están en `.gitignore` (configs personales).
- **No usar `npm` ni `yarn`** — el proyecto usa `bun`.
- **No usar `client:load`** en React islands below-the-fold — usar `client:visible`.
- **No añadir `target="_blank"`** sin `rel="noopener noreferrer"`.
- **No usar `innerHTML`** con datos dinámicos — usar `textContent` o DOM API.
- **No dejar `console.log`** en código de producción.
- **No crear componentes sin `interface Props`** tipada.

## 10. Antes de empezar una tarea

1. **Revisa la issue de seguimiento [#65](https://github.com/sandovaldavid/fluentreads/issues/65)** para ver qué queda pendiente y en qué orden — es la fuente de verdad vigente, no `docs/roadmap.md`.
2. **Si tu tarea toca algo ya cubierto por una issue cerrada**, verifica el estado actual en el código, no en `docs/` — esos documentos son un archivo histórico de la auditoría original (ver `docs/README.md`).
3. **Verifica el MCP de Astro** para APIs que vayas a usar (especialmente si tocas `astro.config.mjs`, content collections, imágenes, view transitions).
4. **Termina con**: `bun run lint && bun run check && bun run build` pasando limpio.

## 11. Estado actual del proyecto

La fuente de verdad es GitHub, no este archivo ni `docs/`. Issue de seguimiento: [#65](https://github.com/sandovaldavid/fluentreads/issues/65) (fases 1-5 de estabilización).

Al momento de escribir esto:

- **Cerradas**: #50 (quality gates), #51 (tests), #52 (Decap CMS), #54 (checkout), #55 (service worker), #56 (filtros de catálogo), #57 (content collections), #58 (SEO), #59 (rutas), #60 (seguridad), #61 (formularios), #62 (latencia artificial), #64 (esta sincronización de docs).
- **Abiertas**: #53 (reemplazar catálogo demo por datos reales — requiere información de negocio que no está disponible, no se debe inventar), #63 (gobernanza de deploy — el workflow y el ruleset ya están correctos, pero falta que se configuren los secrets `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` en el repo).

Antes de asumir que algo "está pendiente", confirma en `gh issue list` o en el código — `docs/` puede estar desactualizado por diseño (ver nota en `docs/README.md`).

## 12. Referencias

- [Documentación de Astro](https://docs.astro.build) (via MCP astro-docs)
- [Issue #65](https://github.com/sandovaldavid/fluentreads/issues/65) — estado vigente de la estabilización del proyecto
- [docs/](./docs/) — auditoría técnica histórica (pre-estabilización), no backlog activo
- [Conventional Commits](https://www.conventionalcommits.org/) — formato de commits
- [release-please](https://github.com/googleapis/release-please) — automatización de releases (solo `main`)
- [Decap CMS](https://decapcms.org/) — CMS para sitios estáticos, ya implementado en `/admin`
