---
status: pending
block: all
priority: P0
---

# Resumen ejecutivo de la auditoria

## Stack del proyecto

- **Framework**: Astro 7.0.6
- **UI islands**: @astrojs/react 6.0.1 + React 19
- **CSS**: Tailwind v4 (via @tailwindcss/vite)
- **Package manager**: bun
- **Tipo**: sitio estatico (sin adapter SSR), e-commerce de libros/packs/examenes de ingles
- **Idioma UI**: espanol (PEN como moneda)
- **Dominio actual**: `https://fluentreads.devsolution.software` (mudara a `fluentreads.sandovaldavid.com`)

## Hallazgos por categoria

| Categoria                    | Issues    | Prioridad |
| ---------------------------- | --------- | --------- |
| Astro best practices         | 16        | P0-P2     |
| Bugs de logica               | 30+       | P0-P1     |
| Bugs de estilos              | 15+       | P1-P2     |
| Accesibilidad                | 20+       | P1-P2     |
| Performance                  | 15+       | P1-P2     |
| Seguridad                    | 10+       | P0-P1     |
| Codigo duplicado/muerto      | 20+ items | P1-P2     |
| Features incompletas         | 12        | P2        |
| Schema de base de datos JSON | 15+       | P0-P1     |
| Tooling faltante             | 15+       | P0        |

## Problemas mas criticos (P0)

### 1. Sin tooling de calidad ni CI/CD

- 0 workflows de GitHub Actions
- 0 linters, 0 formatters, 0 husky, 0 commitlint
- Commits usan gitmojis que rompen release-please
- `build` no ejecuta `astro check`

### 2. Bugs de sintaxis que rompen estilos

- `Navbar.astro:16`, `ReviewStars.astro:34`, `benefits/*.astro` usan `class=\`...\``(backticks sin llaves) en vez de`class={\`...\`}`

### 3. Filtros del catalogo no funcionan

- Enum `ALL_LEVELS='all_levels'` vs URL `'all-levels'` (hyphen vs underscore)
- `packs.json` usa `"Intermediate"` (capitalizado) vs enum lowercase
- `exams.json` usa `FCE`/`CPE`/`upper-intermediate`/`proficient` fuera de enums
- Filtro "Multi-nivel" y filtros de packs/examenes nunca matchean

### 4. Twitter Card invalido en 4 paginas

- `catalogo/index.astro:163`, `contacto/index.astro:79`, `testimonios/index.astro:89`, `paymentMethods/index.astro:84` pasan una URL de imagen como `twitterCard` (debe ser `summary_large_image`)

### 5. Codigo muerto y duplicado masivo

- `Cart.jsx`, `CartItem.jsx`, `CartIndicator.astro`, `ProductDetailDesktop.astro` nunca importados
- 3 implementaciones de carrito paralelas (React, CartManager.ts, checkout.astro vanilla JS)
- `BookDetails`/`PackDetails`/`ExamDetails.astro` ~80% identicos
- `catalogFilters.js` vs `.ts`, `videoEmbeds.js` vs `.ts`

### 6. Rutas rotas

- 3 paginas `ayuda/*.astro` vacias (0 bytes) enlazadas desde el Footer
- `/blog`, `/ofertas`, `/politica-privacidad`, `/terminos-condiciones`, `/cookies` enlazados pero no existen
- `/api/og` referenciado en `catalogo/index.astro:150`, no existe
- `robots.txt` referencia `sitemap.xml` que no se genera (sin @astrojs/sitemap)

### 7. Variables dispersas y placeholders

- Dominio en `astro.config.mjs` + `pageInformation.json` + hardcoded en multiples archivos
- WhatsApp `1234567890` placeholder en 5 componentes
- Facebook AppID `1234567890` placeholder
- Debe centralizarse en un unico origen (`src/config/site.ts`)

### 8. Seguridad

- `target="_blank"` sin `rel="noopener"` en Footer/SocialMediaButton (tabnabbing)
- `checkout.astro:122` usa `innerHTML` con datos de localStorage (XSS potencial)
- `cartManager.ts` `JSON.parse` sin try/catch

## Decisiones confirmadas

| Tema              | Decision                                                                       |
| ----------------- | ------------------------------------------------------------------------------ |
| Releases          | GitHub Releases: main=Latest, develop=Pre-release                              |
| Historico commits | Conventional commits solo hacia adelante (sin rewrite)                         |
| Version inicial   | Mantener 0.x mientras se estabiliza deuda (primer release v0.1.0)              |
| Dominio           | Cambiara a `fluentreads.sandovaldavid.com` - centralizar                       |
| Deploy Vercel     | main=prod, develop=preview, PRs no deployan por Actions                        |
| Tooling           | Full stack: ESLint + Prettier + commitlint + husky + lint-staged + astro check |
| Paginas vacias    | Borrar + quitar enlaces del Footer                                             |
| Cronograma        | Sprints quincenales (2 semanas)                                                |

## Estructura del plan de resolucion

10 bloques ejecutables (B0-B10), cada uno como PR independiente:

- **B0**: Tooling de calidad + CI base
- **B1**: CI/CD: Vercel deploy + release-please
- **B2**: Centralizacion de variables mudables
- **B3**: Bugs criticos de logica y sintaxis
- **B4**: Bugs de estilos
- **B5**: Accesibilidad
- **B6**: Performance
- **B7**: Seguridad
- **B8**: Refactor arquitectonico: content collections + unificacion
- **B9**: Features incompletas
- **B10**: README + docs finales

Ver [roadmap.md](./roadmap.md) para el cronograma detallado por sprints.
