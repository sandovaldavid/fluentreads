---
status: done
block: B6
priority: P1
---

# Issues de rendimiento

Lista de problemas de performance, con referencias `archivo:linea`.

## P1 - Altos

### 1. Imagenes no optimizadas

**Archivos**: 22+ tags `<img>` en toda la codebase
**Problema**: Ninguna imagen usa `<Image>` de `astro:assets`. Todas son `<img>` crudos sin optimizacion, sin `width`/`height` (CLS), sin `srcset` responsive, sin `decoding='async'`.
**Solucion**: Migrar imagenes locales a `src/assets/` y usar `<Image>`. Para Cloudinary, configurar `image.remotePatterns` en `astro.config.mjs` y usar `<Image>` con `inferSize`.

### 2. `apple-touch-icon.png` de 516 KB

**Archivo**: `public/apple-touch-icon.png`
**Problema**: PNG de 516 KB sin optimizar, servido como-is.
**Solucion**: Recomprimir a ~50 KB con `sharp` o similar. Considerar generar sizes multiples.

### 3. Fuentes Google render-blocking

**Archivo**: `src/layouts/Layout.astro:234-252`
**Problema**: Dos stylesheets de `fonts.googleapis.com` (Lora + Poppins) bloquean render. Dos round-trips adicionales. No hay preload de los archivos de fuente.
**Solucion**: Self-hostear con `@fontsource/poppins` y `@fontsource/lora`, o usar `astro:assets` fonts (Astro 7).

### 4. `Filter.jsx` con `client:load` en 4 contenedores

**Archivos**:

- `src/components/catalog/CatalogContainer.astro:111-122`
- `src/components/catalog/CatalogBookContainer.astro:93-101`
- y 2 contenedores mas

**Problema**: El React island `Filter` usa `client:load` (carga inmediatamente en cada pagina). El filtro esta abajo del hero, no se necesita en el paint inicial.
**Solucion**: Cambiar a `client:visible` - carga solo cuando el usuario hace scroll al filtro.

### 5. Catalogo serializado en `<input hidden>`

**Archivo**: `src/components/catalog/CatalogContainer.astro:89,125`
**Problema**: `const allProductsJSON = JSON.stringify(products);` luego `<input type='hidden' id='all-products-data' value={allProductsJSON} />`. El catalogo completo (~10-20 KB) se serializa en el HTML, ademas de renderizarse como DOM cards. Datos duplicados.
**Solucion**: Pasar datos via props al island React o `define:vars` minimo. No duplicar en HTML.

### 6. Sin `@astrojs/sitemap`

**Archivo**: `astro.config.mjs`, `public/robots.txt:8`
**Problema**: `robots.txt` referencia `sitemap.xml` que no se genera. Sin sitemap, los crawlers no descubren todas las paginas eficientemente.
**Solucion**: Instalar `@astrojs/sitemap` y anadirlo a `integrations`.

### 7. Sin `prefetch`

**Archivo**: `astro.config.mjs`
**Problema**: No hay configuracion de `prefetch`. Los usuarios no precargan paginas antes de navegar.
**Solucion**: Habilitar `prefetch: { prefetchAll: true }` en `astro.config.mjs`.

## P2 - Medios

### 8. 13 IntersectionObserver independientes

**Archivos**:

- `src/components/catalog/CatalogContainer.astro:474`
- `src/components/paymentMethods/PromoSection.astro:170`
- `src/components/TestimoniesList.astro:163`
- `src/components/TestimoniesCard.astro:106`
- `src/components/FAQ.astro:114`
- `src/components/Benefits.astro:66,79`
- `src/components/FeaturedCatalog.astro:204`
- `src/components/contact/ContactInfo.astro:109`
- `src/components/DeliveryBenefits.astro:85`
- `src/components/paymentMethods/CTA.astro:196`
- `src/components/paymentMethods/DeliveryTime.astro:220`
- `src/pages/catalogo/index.astro:257`
- `src/pages/testimonios/index.astro:275`

**Problema**: Cada componente crea su propio `IntersectionObserver`. Deberia haber uno compartido.
**Solucion**: Crear `src/utils/observer.ts` con un unico observer compartido. Importar donde se necesite.

### 9. `setInterval` que nunca se detiene

**Archivos**:

- `src/components/paymentMethods/CTA.astro:192` - countdown cada segundo, corre para siempre
- `src/components/paymentMethods/DeliveryTime.astro:261,313` - dos intervals de 5s (por handler duplicado)
- `src/scripts/HeroBanner.ts:43` - autoplay cada 7s, recreado en cada click

**Problema**: Intervals corren incluso cuando el tab no es visible o el componente esta off-screen.
**Solucion**: Pausar con Page Visibility API (`document.hidden`). Limpiar en cleanup.

### 10. `ResizeObserver` sin disconnect

**Archivo**: `src/scripts/mediaCarousel.ts:130-137`
**Problema**: `ResizeObserver` nunca se desconecta. Memory leak si el componente se desmonta.
**Solucion**: Guardar referencia y `.disconnect()` en cleanup.

### 11. Event listeners sin cleanup

**Archivos**: `src/scripts/HeroBanner.ts:140-148`, `src/scripts/mediaCarousel.ts:152-167`
**Problema**: `document.addEventListener('keydown', ...)` nunca se remueve. Si el componente se re-monta, se acumulan.
**Solucion**: Remover listeners en cleanup.

### 12. Data-URI SVG de background duplicado en 6+ lugares

**Archivos**:

- `src/styles/global.css:39`
- `src/styles/catalog.css:284`
- `src/pages/catalogo/index.astro:284`
- `src/pages/catalogo/libros/index.astro:278`
- `src/pages/catalogo/packs/index.astro:272`
- `src/pages/catalogo/examenes-internacionales/index.astro:279`

**Problema**: El mismo data-URI SVG de 60x60 se inlina en 6+ archivos. Bytes duplicados en el bundle.
**Solucion**: Extraer a `public/pattern.svg` o variable CSS en `global.css`. Importar/referenciar una sola vez.

### 13. Sin critical CSS inlined

**Archivo**: toda la codebase
**Problema**: Todo el CSS se bundlea en un archivo render-blocking. No hay critical CSS inlined en el `<head>`.
**Solucion**: Astro 7 puede inlinear critical CSS automaticamente con ciertas configs. Revisar `build.inlineStylesheets`.

## P3 - Bajos

### 14. `favicon.webp` de 41 KB

**Archivo**: `public/favicon.webp`
**Problema**: 41 KB para un favicon es grande.
**Solucion**: Recomprimir a <10 KB.

### 15. Autoplay del hero incluso con tab oculto

**Archivo**: `src/scripts/HeroBanner.ts:43`
**Problema**: `setInterval(nextSlide, 7000)` corre incluso cuando el tab no es visible. Desperdicia CPU.
**Solucion**: Pausar cuando `document.hidden` es true.

### 16. `loading='lazy'` sin `decoding='async'`

**Archivos**: multiples `<img>` tags
**Problema**: Usan `loading='lazy'`/`'eager'` pero nunca `decoding='async'` ni `fetchpriority`.
**Solucion**: Anadir `decoding='async'` a todas las imagenes. `fetchpriority='high'` al LCP image.
