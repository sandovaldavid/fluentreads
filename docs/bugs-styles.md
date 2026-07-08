---
status: done
block: B4
priority: P1
---

# Bugs de estilos

Lista de bugs de CSS y estilos, con referencias `archivo:linea`.

## P1 - Altos

### 1. Inversion de nombres de color primary

**Archivo**: `src/styles/global.css:9-11`
**Problema**:

```css
--color-primary-light: #3b82f6; /* RGB 59,130,246 */
--color-primary: #1e3a8a; /* RGB 30,58,138 */
--color-primary-dark: #1e40af; /* RGB 30,64,175 */
```

`primary-dark` (#1e40af, luminosidad mayor) es mas claro que `primary` (#1e3a8a). La convencion de nombres esta invertida.
**Solucion**: Renombrar o corregir los valores para que `-light` > `base` > `-dark` en luminosidad.

### 2. Background SVG global tileado

**Archivo**: `src/styles/global.css:39`
**Problema**: `body { background-image: url("data:image/svg+xml,..."); }` aplica un pattern SVG tileado a todas las paginas. Sobreescribe cualquier `bg-white` a menos que se sobreescriba explicitamente. El mismo data-URI esta duplicado en 6+ lugares.
**Solucion**: Extraer a `public/pattern.svg` o una variable CSS. Revisar si el pattern es deseado en todas las paginas.

### 3. Bloque `#loading-indicator` duplicado

**Archivo**: `src/styles/catalog.css:174-181` y `catalog.css:178-185`
**Problema**: El selector `#loading-indicator:not(.hidden)` esta definido dos veces seguidas con las mismas reglas.
**Solucion**: Eliminar el bloque duplicado.

### 4. Keyframe `background-opacity` no existe

**Archivo**: `src/styles/catalog.css:333-340`
**Problema**: `@keyframes pulse-bg { 0%,100% { background-opacity: 0.05; } }` - `background-opacity` no es una propiedad CSS real. El keyframe esta muerto.
**Solucion**: Usar `opacity` o `background-color` con alpha. O eliminar si no se usa.

### 5. `.animate-pulse` custom colisiona con Tailwind

**Archivo**: `src/styles/HeroBanner.css:82-83`
**Problema**: `.animate-pulse { animation: pulse 2s cubic-bezier(...); }` sobreescribe la utilidad `.animate-pulse` de Tailwind. Todos los otros usos de `animate-pulse` en la pagina se rompen.
**Solucion**: Renombrar a `.hero-pulse` o similar.

### 6. 5+ definiciones de `@keyframes fadeIn`

**Archivos**:

- `src/styles/catalog.css` (fadeIn, fadeInUp, fadeInDown)
- `src/styles/HeroBanner.css:24-26` (fadeInDown, fadeInUp)
- `src/styles/catalog.css:296-305` (fadeIn)
- `src/components/testimonios/index.astro:403-412`
- `src/components/PromoCard.astro:226-235`
- `src/components/catalog/CatalogContainer.astro:541-548`

**Problema**: Multiples definiciones de los mismos keyframes con timings diferentes. Ultimo cargado gana. No hay fuente canonica.
**Solucion**: Crear `src/styles/animations.css` con definiciones unicas. Importar desde `global.css`. Eliminar todas las demas.

### 7. 3 definiciones de `@keyframes pulse` conflictivas

**Archivos**: `src/components/ProductCard.astro:307-308`, `src/styles/HeroBanner.css:86-96`, `src/components/details/ValueCard.astro:359-372`
**Problema**: Tres `@keyframes pulse` con transforms/scales diferentes. Colision.
**Solucion**: Unificar en `animations.css` con nombres especificos (`pulse-card`, `pulse-hero`, `pulse-value`).

### 8. `.fade-in` con contenido invisible si JS falla

**Archivo**: `src/styles/catalog.css:241-256`
**Problema**: `.fade-in` define `animation: fadeIn 0.8s ease forwards;` y `.fade-in:not(.in-view) { opacity: 0; }`. Si JS no carga o falla, los elementos con `.fade-in` nunca reciben `.in-view` y quedan permanentemente invisibles.
**Solucion**: Usar `@media (prefers-reduced-motion)` o asegurar fallback sin JS. Considerar `.no-js .fade-in { opacity: 1; }`.

## P2 - Medios

### 9. Selectores `span` sin clase en SectionTitle

**Archivo**: `src/components/SectionTitle.astro:20-28`
**Problema**: `<style>` usa `span`, `h1:hover span`, `h2:hover span`, `h3:hover span`. Astro scopea por defecto, pero `span` sin clase puede colisionar con spans del slot content.
**Solucion**: Anadir una clase al span decorativo y scopear por esa clase.

### 10. `:global(.text-3xs)` y `:global(.text-2xs)` fugitivos

**Archivos**: `src/components/DiscountBadge.astro:88-96`, `src/components/Button.astro:122-125`, `src/components/PromoCard.astro:103,116`
**Problema**: Estilos globales `.text-3xs` y `.text-2xs` definidos en multiples componentes con definiciones diferentes. Inconsistente.
**Solucion**: Definir una vez en `global.css` o usar tokens Tailwind (`text-[0.65rem]`).

### 11. `.text-primary`/`.text-accent` colisiona con utilidades Tailwind

**Archivo**: `src/components/details/ValueCard.astro:416-422`
**Problema**: Scoped `.text-primary { color: var(--color-primary, #1e3a8a); }` colisiona con la utilidad Tailwind `.text-primary` (mapeada a `--color-primary` via `@theme`). Confusion sobre cual gana.
**Solucion**: Renombrar a `.value-text-primary` / `.value-text-accent`.

### 12. `.book-grid-item.hidden` sobreescribe Tailwind `.hidden`

**Archivos**: `src/styles/catalog.css:162-164`, `src/components/catalog/CatalogBookContainer.astro:438`
**Problema**: `.book-grid-item.hidden { display: none; }` y `.catalog-product-card.hidden { display: none; }` sobreescriben la utilidad `.hidden` de Tailwind con logica duplicada.
**Solucion**: Usar la utilidad `.hidden` de Tailwind directamente. Eliminar las overrides.

### 13. `div:hover svg` muy amplio

**Archivo**: `src/components/ReviewStars.astro:87-90`
**Problema**: `div:hover svg { transform: scale(1.1); }` - selector muy amplio dentro del scoped style. Afecta todos los SVGs anidados.
**Solucion**: Scopear por clase del SVG o del container.

### 14. `button` selector muy amplio en media query

**Archivo**: `src/components/details/BookDetails.astro:690-694`
**Problema**: `@media (max-width: 640px) { button, a.bg-primary, a.bg-accent { min-height: 42px; } }` - selector `button` muy amplio, afecta todos los botones del componente.
**Solucion**: Usar clases especificas.

### 15. CSS global sin scoping (Footer, Card, etc.)

**Archivos**: `src/styles/Footer.css`, `src/styles/Card.css`, `src/styles/DeliveryBenefits.css`, `src/styles/FAQ.css`, `src/styles/FeaturedCatalog.css`, `src/styles/HeroBanner.css`, `src/styles/MediaCarousel.css`, `src/styles/ProductDetail.css`, `src/styles/TestimoniesCard.css`, `src/styles/TestimoniesList.css`, `src/styles/paymentMethods.css`
**Problema**: Archivos CSS globales con selectores tipo `.btn`, `.card` que pueden colisionar con utilidades Tailwind o entre si.
**Solucion**: Migrar a CSS scoped en componentes o prefixar todos los selectores (`.fr-btn`, `.fr-card`).

## P3 - Bajos

### 16. Sin dark mode

**Archivos**: `src/layouts/Layout.astro:187` (`<meta name='color-scheme' content='light' />`), `src/styles/global.css`
**Problema**: No hay soporte para dark mode en ningun lado. `<meta name='color-scheme' content='light' />` hardcoded. Solo 2 iconos usan `dark:` por error.
**Solucion**: Deuda futura. Implementar con `prefers-color-scheme` o toggle. Documentar como feature pendiente.

### 17. Ubicaciones de CSS duplicadas

**Archivos**:

- `src/styles/Benefits.css` + `src/styles/benefits/` (subfolder con 3 archivos)
- `src/styles/paymentMethods.css` + `src/styles/paymentMethods/` (subfolder con 6 archivos)
- `src/styles/contact/` (subfolder)

**Problema**: Estilos del mismo modulo en dos ubicaciones (archivo top-level + subfolder). Inconsistencia.
**Solucion**: Elegir una convencion (subfolder) y eliminar los archivos top-level duplicados.

### 18. `CarruselButtons.astro` inconsistencia de nombre

**Archivo**: `src/components/CarruselButtons.astro`
**Problema**: "Carrusel" (espanol) vs resto del codebase usando "carousel"/"Carousel" en clases (`.carousel-track`, `.carousel-slide`).
**Solucion**: Renombrar a `CarouselButtons.astro` o mantener "Carrusel" consistente en todas las clases.
