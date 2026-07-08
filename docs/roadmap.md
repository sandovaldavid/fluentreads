---
status: done
block: all
priority: P0
---

# Cronograma de sprints quincenales

Plan de ejecucion en sprints de 2 semanas (10 dias habiles). Inicio: lunes 7 julio 2026.

## Resumen de bloques

| Bloque | Descripcion                                 | Dependencias                     |
| ------ | ------------------------------------------- | -------------------------------- |
| B0     | Tooling de calidad + CI base                | ninguna                          |
| B1     | CI/CD: Vercel deploy + release-please       | ninguna                          |
| B2     | Centralizacion de variables mudables        | ninguna                          |
| B3     | Bugs criticos de logica y sintaxis          | B2 (tocar mismos componentes)    |
| B4     | Bugs de estilos                             | B0 (lint pasa)                   |
| B5     | Accesibilidad                               | B0                               |
| B6     | Performance                                 | B0                               |
| B7     | Seguridad                                   | B2 (siteConfig)                  |
| B8     | Refactor: content collections + unificacion | B3 (schemas estables), B0 (lint) |
| B9     | Features incompletas                        | B8 (collections)                 |
| B10    | README + docs finales                       | todos                            |

## Sprint 1 (7-18 julio 2026) - Fundaciones

**Bloques**: B0 + B1 (en paralelo)
**Release**: `v0.1.0-rc.1` (develop) → `v0.1.0` (main)

### B0 - Tooling de calidad + CI base

**Archivos a crear**:

- `.github/workflows/ci.yml`
- `.eslintrc.cjs` o `eslint.config.js`
- `.prettierrc.json`
- `.prettierignore`, `.eslintignore`
- `commitlint.config.cjs`
- `.husky/pre-commit`
- `.husky/commit-msg`
- `.lintstagedrc.json`
- `src/env.d.ts`
- `AGENTS.md`

**Archivos a modificar**:

- `package.json` - scripts, devDeps, `prepare: "husky"`
- `tsconfig.json` - `paths` aliases
- `.gitignore` - `.husky/_/`, `.eslintcache`, `coverage/`, `*.log`

**Tareas**:

1. Instalar devDeps: eslint, @typescript-eslint/*, eslint-plugin-astro, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y, prettier, prettier-plugin-astro, prettier-plugin-tailwindcss, husky, lint-staged, @commitlint/cli, @commitlint/config-conventional
2. Configurar ESLint (flat o legacy) con reglas: `no-console: error`, `@typescript-eslint/no-explicit-any: warn`, `jsx-a11y/*: error`
3. Configurar Prettier con plugins astro + tailwindcss
4. Configurar commitlint con `config-conventional` + regla custom sin emojis (regex que rechaza caracteres no-ASCII en subject)
5. Configurar husky: `pre-commit` → `lint-staged`, `commit-msg` → `commitlint`
6. Crear `src/env.d.ts` tipando todas las env vars
7. Anadir aliases en `tsconfig.json`
8. Cambiar `build` a `astro check && astro build`
9. Crear workflow `ci.yml` que corre lint, check, build en PRs y pushes
10. Crear `AGENTS.md` con comandos

**Criterio de aceptacion**:

- `bun run lint && bun run check && bun run build` pasan
- Commit con emoji es rechazado por `commit-msg`
- Commit `feat(scope): descripcion` pasa
- CI verde en GitHub Actions

### B1 - CI/CD: Vercel deploy + release-please

**Archivos a crear**:

- `.github/workflows/deploy-vercel.yml`
- `.github/workflows/release-please-main.yml`
- `.github/workflows/release-please-develop.yml`
- `vercel.json`

**Tareas**:

1. Workflow `deploy-vercel.yml`:
   - `deploy-prod` job (if main): checkout, bun install, build, `amondnet/vercel-action@v25` con `--prod`
   - `deploy-preview` job (if develop): mismo sin `--prod`
2. Workflow `release-please-main.yml`: `release-please-action@v4`, `release-type: node`, sin prerelease → GitHub Release "Latest"
3. Workflow `release-please-develop.yml`: `release-please-action@v4`, `prerelease: true`, `prerelease-tag: "rc"` → GitHub Release "Pre-release"
4. `vercel.json` con `framework: astro`, `buildCommand: bun run build`, `outputDirectory: dist`
5. Documentar secrets requeridos en README: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

**Criterio de aceptacion**:

- Push a `develop` dispara deploy preview + release-please pre-release
- Push a `main` dispara deploy prod + release latest
- PRs no deployan por Actions

---

## Sprint 2 (21 julio - 1 agosto 2026) - Centralizacion + bugs criticos

**Bloques**: B2 + B3
**Release**: `v0.2.0-rc.1` / `v0.2.0`

### B2 - Centralizacion de variables mudables

**Archivos a crear**:

- `src/config/site.ts` - unico origen de verdad

**Archivos a modificar**:

- `astro.config.mjs:9` - `site: 'https://fluentreads.sandovaldavid.com'`
- `src/database/pageInformation.json` - eliminar campos duplicados
- `src/components/Header.astro:46` - usar `siteConfig.whatsappUrl`
- `src/components/Footer.astro:69` - mismo
- `src/components/paymentMethods/CTA.astro:116` - mismo
- `src/components/SocialSharing.astro:17` - mismo
- `src/components/contact/ContactInfo.astro:13` - mismo
- `src/pages/checkout.astro:9` - mismo
- `.env.example` - anadir `PUBLIC_SITE_URL`

**Tareas**:

1. Crear `src/config/site.ts` con `siteConfig` tipado (`url`, `name`, `domain`, `whatsapp`, `whatsappUrl`, `social`, `contact`)
2. Reemplazar todos los hardcoded `1234567890` y `+51987654321` por `siteConfig.whatsappUrl`
3. Actualizar `astro.config.mjs` con nuevo dominio
4. Limpiar `pageInformation.json` de campos duplicados (whatsapp, facebookAppID, siteURL)
5. Actualizar `.env.example`

**Criterio de aceptacion**:

- `grep -r "1234567890"` → 0 resultados
- `grep -r "devsolution.software"` → 0 resultados
- Cambiar dominio en el futuro = editar 1 linea en `site.ts` + 1 en `astro.config.mjs`

### B3 - Bugs criticos de logica y sintaxis

**Tareas** (ver `bugs-logic.md` para detalle):

1. Arreglar `class=\`...\``→`class={\`...\``}` en Navbar, ReviewStars, benefits/*.astro
2. Unificar `ALL_LEVELS` a `'all-levels'` (hyphen) en enum, bookTags.ts, comparaciones
3. Unificar `INTERNATIONAL_EXAM` a `'international-exam'`
4. Normalizar `packs.json` `level` a lowercase
5. Anadir `FCE`, `CPE`, `PTE`, `GRE` al enum `ExamType`; `UPPER_INTERMEDIATE`, `PROFICIENT` a `ExamDifficulty`
6. Corregir `twitterCard` en 4 paginas + `pageInformation.json:52`
7. Eliminar referencia a `/api/og` o crear endpoint
8. Eliminar handler `DOMContentLoaded` duplicado en `DeliveryTime.astro`
9. Eliminar codigo muerto: `Cart.jsx`, `CartItem.jsx`, `CartIndicator.astro`, `ProductDetailDesktop.astro`, `sample-book-with-images.json`, `catalogFilters.js`, `videoEmbeds.js`
10. Borrar 3 paginas `ayuda/*.astro` vacias + quitar enlaces del Footer
11. Quitar enlaces a `/blog`, `/politica-privacidad`, `/terminos-condiciones`, `/cookies` (no existen)
12. Quitar `target="_blank"` de enlaces internos del Footer
13. Eliminar `console.log` de produccion (10+ archivos)
14. Arreglar `Class` → `class` en `paymentMethods/Hero.astro:84`
15. Arreglar `xs:inline` en `BookTags.astro`
16. Quitar `target="_blank"` de `mailto:` en `SocialShareButtons.astro`

**Criterio de aceptacion**:

- Filtros de catalogo (level, exam type) funcionan para todos los productos
- `bun run build` sin warnings de `define:vars`
- 0 paginas vacias enlazadas
- 0 `console.log` en build output

---

## Sprint 3 (4-15 agosto 2026) - Estilos + accesibilidad

**Bloques**: B4 + B5
**Release**: `v0.3.0-rc.1` / `v0.3.0`

### B4 - Bugs de estilos

**Tareas** (ver `bugs-styles.md`):

1. Corregir inversion `primary-light`/`primary-dark` en `global.css:9-11`
2. Extraer data-URI SVG de background a `public/pattern.svg` o variable CSS
3. Eliminar bloque `#loading-indicator` duplicado en `catalog.css`
4. Eliminar keyframe `background-opacity` muerto en `catalog.css:333-340`
5. Renombrar `.animate-pulse` custom a `.hero-pulse` en `HeroBanner.css:82-83`
6. Crear `src/styles/animations.css` con definiciones unicas de `fadeIn`, `fadeInUp`, `fadeInDown`, `pulse`; importar desde `global.css`; eliminar las 5+ definiciones dispersas
7. Scope `span` decorativo en `SectionTitle.astro` con clase propia
8. Reemplazar `:global(.text-3xs)` y `:global(.text-2xs)` por tokens Tailwind o definicion unica en `global.css`
9. Renombrar `.text-primary`/`.text-accent` en `ValueCard.astro` a `.value-text-*`
10. Eliminar `.book-grid-item.hidden` override (usar `.hidden` de Tailwind)
11. Scope `div:hover svg` en `ReviewStars.astro` por clase
12. Scope `button` selector en `BookDetails.astro:690-694` por clase
13. Migrar CSS global (Footer.css, Card.css, etc.) a scoped o prefixar `.fr-*`
14. Unificar ubicaciones de CSS (subfolder vs top-level) - elegir subfolder
15. Renombrar `CarruselButtons.astro` a `CarouselButtons.astro` o mantener consistente

**Criterio de aceptacion**:

- 0 definiciones duplicadas de `@keyframes fadeIn`
- `animate-pulse` de Tailwind funciona en toda la codebase
- 0 overrides de utilidades Tailwind (`.hidden`, `.text-primary`)

### B5 - Accesibilidad

**Tareas** (ver `accessibility.md`):

1. Anadir `aria-label`, `aria-expanded`, `aria-controls` al boton de menu movil en `Header.astro`
2. Arreglar `ImageModal.astro`: `aria-labelledby`, focus trap, mover foco al abrir, `aria-hidden` cuando cerrado, close como `<button>`
3. Convertir divs clickeables en `<button>` en `MediaCarousel.astro:60,104`
4. Anadir `aria-label` en espanol a botones de cantidad en `checkout.astro:139-144` y `CartItem.jsx:64-80`
5. Envolver emojis decorativos en `<span aria-hidden="true">` (BookTags, TestimoniesCard, CTA, DeliveryTime, SectionTitle, QuestionCard)
6. Anadir `<label>` o `aria-label` a inputs de newsletter (Footer, CTA-Banner)
7. Cambiar `*` obligatorio por `aria-required="true"` + `<span class="sr-only">obligatorio</span>` en `Form.astro`
8. Anadir `aria-pressed` a botones de filtro en `testimonios/index.astro:174`
9. Anadir `<span class='sr-only'>` al switch en `Filter.jsx:512`
10. Anadir `aria-hidden="true"` a SVGs decorativos (Cart, QuestionCard chevron, etc.)
11. Anadir `<span class='sm:hidden sr-only'>Compartir</span>` en `SocialShareButtons.astro`
12. Anadir `@media (prefers-reduced-motion: reduce)` global desactivando animaciones
13. Anadir `width`/`height` al logo en `Header.astro` o usar `<Image>`
14. Anadir `focus-visible:ring` a indicator dots en `HeroBanner.astro`
15. Anadir `role="button" tabindex="0"` + keyboard handler a cards clickeables en `Card.astro`
16. Verificar contraste de `text-neutral-light` en fondos blancos

**Criterio de aceptacion**:

- Lighthouse Accessibility score >= 90
- Navegacion por teclado funciona en todas las interacciones
- `prefers-reduced-motion` respeta todas las animaciones

---

## Sprint 4 (18-29 agosto 2026) - Performance + seguridad

**Bloques**: B6 + B7
**Release**: `v0.4.0-rc.1` / `v0.4.0`

### B6 - Performance

**Tareas** (ver `performance.md`):

1. Recomprimir `apple-touch-icon.png` (516 KB → ~50 KB)
2. Migrar imagenes locales a `src/assets/` y usar `<Image>` de `astro:assets`
3. Configurar `image.remotePatterns` para Cloudinary en `astro.config.mjs`
4. Self-hostear fuentes con `@fontsource/poppins` + `@fontsource/lora` o `astro:assets` fonts
5. Cambiar `Filter.jsx` de `client:load` a `client:visible` en 4 contenedores
6. Eliminar serializacion del catalogo en `<input hidden>` en `CatalogContainer.astro:89,125`
7. Instalar `@astrojs/sitemap` y anadir a integrations
8. Habilitar `prefetch: { prefetchAll: true }` en `astro.config.mjs`
9. Crear `src/utils/observer.ts` con IntersectionObserver compartido; migrar 13 usos
10. Pausar `setInterval` con Page Visibility API en CTA.astro, DeliveryTime.astro, HeroBanner.ts
11. Desconectar `ResizeObserver` en `mediaCarousel.ts:130`
12. Remover event listeners en cleanup (HeroBanner.ts, mediaCarousel.ts)
13. Extraer data-URI SVG duplicado a variable CSS o `public/pattern.svg`
14. Anadir `decoding='async'` a todas las imagenes; `fetchpriority='high'` al LCP
15. Recomprimir `favicon.webp` (41 KB → <10 KB)

**Criterio de aceptacion**:

- Lighthouse Performance score >= 90 en mobile
- `/sitemap.xml` devuelve 200
- 0 `setInterval` corriendo con tab oculto
- Solo 1 `IntersectionObserver` en toda la app

### B7 - Seguridad

**Tareas** (ver `security.md`):

1. Anadir `rel="noopener noreferrer"` a todos los `target="_blank"` en Footer, SocialMediaButton
2. Reemplazar `innerHTML` por DOM API en `checkout.astro:122-156`
3. Envolver `JSON.parse(localStorage)` y `setItem` en try/catch en `cartManager.ts`
4. (B2 ya centraliza WhatsApp placeholders)
5. Renombrar env vars a `PUBLIC_*` en `Form.astro` y `.env.example`
6. Validar que `pageclipKey` exista antes de renderizar form en `Form.astro:43`
7. Eliminar `Disallow` de rutas inexistentes en `robots.txt:5-7`
8. Eliminar `process.env` de `Form.astro:38`
9. Eliminar `event` global de `Form.astro:510`
10. Anadir fallback `document.execCommand('copy')` en `PaymentCard.astro:149`
11. Anadir `.mcp.json` y `.claude/` a `.gitignore`

**Criterio de aceptacion**:

- 0 `target="_blank"` sin `rel="noopener"`
- 0 `innerHTML` con datos dinamicos
- 0 `JSON.parse(localStorage)` sin try/catch
- 0 `process.env` en client scripts

---

## Sprint 5 (1-12 septiembre 2026) - Refactor collections (mitad)

**Bloques**: B8 (primera mitad)
**Release**: `v0.5.0-rc.1`

### B8a - Content collections + schemas Zod

**Tareas** (ver `database-schema.md`):

1. Crear `src/content.config.ts` con collections para: books, packs, exams, editorial, categories
2. Definir schemas Zod para cada collection (valida: level lowercase, examType en enum, difficulty en enum, price numerico, etc.)
3. Mover `src/database/*.json` a `src/data/` (convencion Astro 5+)
4. Migrar imports de `import books from '../data/books.json'` a `await getCollection('books')` en:
   - `src/utils/listProducts.ts`
   - `src/utils/RelatedProducts.ts`
   - `src/utils/packsUtils.ts`
   - `src/pages/catalogo/*/index.astro`
   - `src/components/FeaturedCatalog.astro`
   - etc.
5. Migrar collections restantes: testimonies, offers, faqs, pageInformation, editorial, categories
6. Actualizar `.astro/collections/*.schema.json` - configurar VS Code para IntelliSense en JSON

**Criterio de aceptacion**:

- `astro build` falla si un JSON viola el schema
- 0 imports directos de JSON (todos via `getCollection`)
- IntelliSense funciona en VS Code para archivos JSON

---

## Sprint 6 (15-26 septiembre 2026) - Refactor (mitad) + features

**Bloques**: B8b + B9 (carrito, busqueda)
**Release**: `v0.5.0` / `v0.6.0-rc.1`

### B8b - Unificacion de componentes

**Tareas**:

1. Unificar `BookDetails.astro`/`PackDetails.astro`/`ExamDetails.astro` en `ProductDetails.astro` con prop `type: 'book'|'pack'|'exam'`
2. Unificar `ProductCard.astro` + `Card.astro` en un solo componente
3. Consolidar 8 componentes sociales en 2-3
4. Unificar 4 icon components de benefits en uno generico
5. Migrar `imagePreloader.js` a `.ts`
6. Eliminar `src/assets/astro.svg`, `src/assets/background.svg`
7. Estandarizar `editorial.json` a ingles (`nombre`→`name`, `descripcion`→`description`)
8. Anadir `longman` a `editorial.json` o migrar referencia en `books.json`
9. Normalizar `offers.json` a precios numericos
10. Eliminar entradas duplicadas en `offers.json:23-41`

### B9a - Features: carrito + busqueda

**Tareas**:

1. **Carrito unificado**: decidir React (`Cart.jsx` revivido) o vanilla (`checkout.astro`). Usar `CartManager.ts` en ambos casos. Renderizar `CartIndicator.astro` en `Header.astro`.
2. **Busqueda server-side**: leer `?search=`/`?q=` en `catalogo/index.astro` y filtrar server-side antes de renderizar. El JSON-LD `SearchAction` ya lo promete.

**Criterio de aceptacion**:

- 1 sola implementacion de carrito
- Badge de carrito visible en header
- Deep-linking de busqueda funciona (`/catalogo?search=english` filtra server-side)

---

## Sprint 7 (29 septiembre - 10 octubre 2026) - Features restantes

**Bloques**: B9b
**Release**: `v0.6.0`

### B9b - Features: legales, PWA, newsletter, blog, Decap CMS

**Tareas**:

1. **Decap CMS**: instalar `decap-cms-app` en `public/admin/`. Configurar `public/admin/config.yml` con collections para books, packs, exams, testimonies, offers (post-B8 collections). Auth via GitHub OAuth. Edicion via UI en `/admin` → commit al repo → Vercel rebuild automatico. **Gist descartado** (no actualiza sin rebuild, sin validacion, rate limits).
2. **Paginas legales**: crear `/politica-privacidad`, `/terminos-condiciones`, `/cookies` con contenido legal real (requiere input legal del usuario). Usar content collection.
3. **PWA**: integrar `@vite-pwa/astro` con service worker. Configurar cache strategy.
4. **Newsletter**: integrar Pageclip o Mailchimp para `Footer.astro`/`CTA-Banner.astro` (quitar `alert()`).
5. **Blog**: crear `src/pages/blog/` con content collection o eliminar todas las referencias (Navbar, Footer, SuccessMessage).
6. **Ruta `/ofertas`**: crear pagina o eliminar `PromoSection.astro`.
7. **Testimonios "Recientes"**: anadir campo `date` real a `testimonies.json`. Implementar orden cronologico.
8. **Paginas de ayuda**: re-crear `/ayuda/pagos`, `/ayuda/envios`, `/ayuda/devoluciones` con contenido real desde JSON o content collection.
9. **`/api/og` endpoint**: crear `src/pages/api/og.ts` con `@vercel/og` o `satori` para OG images dinamicas, o eliminar referencia.
10. **`PopularityTag.PHRASAL_VERBS`**: anadir al enum + config o eliminar de `books.json`.
11. **`difficultyConfig`**: anadir configs para `upper-intermediate` y `proficient`.
12. **`exam.duration`**: anadir al interface `Exam` o eliminar del JSON.
13. **`offerDays`**: unificar (anadir a Pack/Exam o eliminar de Book).
14. **`stock`**: decidir si aplica a todos los tipos y unificar schema.

**Criterio de aceptacion**:

- 0 rutas rotas (todas las referencias internas funcionan)
- `/admin` permite editar JSON via UI web con auth GitHub
- PWA installable con offline support
- Newsletter envia emails reales
- 0 `alert()` en forms

---

## Sprint 8 (13-24 octubre 2026) - README, docs, migracion dominio

**Bloques**: B10
**Release**: `v1.0.0-rc.1` → `v1.0.0`

### B10 - Documentacion final + migracion

**Tareas**:

1. **Rewrite `README.md`**: nombre, descripcion, stack, requisitos, instalacion, env vars (tabla), scripts, estructura, branching, contribucion (commits convencionales sin emojis), secrets CI, enlace a `docs/`.
2. **`CONTRIBUTING.md`**: reglas de commit convencional, ejemplos, husky setup.
3. **`LICENSE`**: confirmar licencia (MIT sugerida).
4. **`docs/README.md`**: actualizar estado de todos los bloques a `done`.
5. **Migracion dominio**: cambiar `siteConfig.url` y `astro.config.mjs` `site` a `https://fluentreads.sandovaldavid.com` (definitivo). Verificar que `PUBLIC_SITE_URL` en Vercel env vars esta actualizado.
6. **Verificar `robots.txt`**: actualizar sitemap URL al nuevo dominio.
7. **Verificar OG images**: todas las URLs absolutas usan el nuevo dominio via `siteConfig`.
8. **Pulido final**: ejecutar `bun run lint && bun run check && bun run build` limpio. Lighthouse audit completo. Corregir cualquier issue restante.

**Criterio de aceptacion**:

- `README.md` tiene toda la info del proyecto (no es template)
- 0 referencias al dominio antiguo
- `v1.0.0` taggeado y released
- Lighthouse scores: Performance >= 90, Accessibility >= 90, Best Practices >= 90, SEO >= 90

---

## Verificacion por bloque

Cada PR de bloque debe pasar antes de merge:

```sh
bun run lint && bun run check && bun run build
```

El commit de merge debe ser convencional para que release-please lo incluya en el changelog:

- `feat(ci): ...` para B1
- `fix(catalog): ...` para B3
- `refactor(details): ...` para B8
- `docs(readme): ...` para B10
- etc.

## Dependencias criticas

```
B0 ─┬─ B4 ── B5 ── B8a ── B8b ── B9 ── B10
    │              │
    └─ B1          └─ B6 ── B7

B2 ── B3 ──────────────────────────────── B10
```

- B0 y B1 pueden ejecutarse en paralelo (S1).
- B2 debe ir antes que B3 (B3 toca componentes que importaran `siteConfig`).
- B4-B7 son relativamente independientes (pueden reordenarse).
- B8 depende de B3 (schemas estables) y B0 (lint pasa).
- B9 depende de B8 (features usan collections).
- B10 depende de todo.
