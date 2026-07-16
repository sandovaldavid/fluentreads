---
status: pending
block: B3, B8
priority: P1
---

# Codigo duplicado y muerto

Lista de archivos duplicados y codigo muerto (nunca importado), con confirmacion via grep.

## Codigo muerto (nunca importado)

### 1. Componentes React de carrito no usados

**Archivos**:

- `src/components/Cart.jsx` (202 lineas)
- `src/components/CartItem.jsx` (105 lineas)

**Problema**: Islands React que nunca se importan en ningun `.astro`. La UI del carrito vive en `src/pages/checkout.astro` como vanilla JS. Los componentes React usan `CartManager.ts` (canonico), pero estan muertos.
**Solucion**: Eliminar. Si se reviven, usar `CartManager.ts` y `client:visible`.

### 2. `CartIndicator.astro` no importado

**Archivo**: `src/components/CartIndicator.astro`
**Problema**: Define y actualiza `.cart-indicator` pero nunca se importa. El badge de contador nunca aparece.
**Solucion**: Importar en `Header.astro` o eliminar.

### 3. `ProductDetailDesktop.astro` no importado

**Archivo**: `src/components/ProductDetailDesktop.astro` (444 lineas)
**Problema**: Nunca importado. Los detalles de producto usan `BookDetails.astro` / `PackDetails.astro` / `ExamDetails.astro`. Duplica JSON-LD, mediaItems, levelDisplay.
**Solucion**: Eliminar.

### 4. `sample-book-with-images.json` huerfano

**Archivo**: `src/database/sample-book-with-images.json`
**Problema**: Datos de ejemplo nunca importados. Leftover de desarrollo.
**Solucion**: Eliminar.

### 5. Assets del starter kit no usados

**Archivos**:

- `src/assets/astro.svg` - logo default de Astro starter kit
- `src/assets/background.svg` - nunca referenciado (el background es data-URI en `global.css`)

**Solucion**: Eliminar.

### 6. `catalogFilters.js` no importado

**Archivo**: `src/utils/catalogFilters.js` (204 lineas)
**Problema**: Version `.js` nunca importada. La version `.ts` (264 lineas) se usa server-side. La `.js` tiene funciones client-side (`filterProductElements`, `sortElements`, `updateURLParams`) que divergieron.
**Solucion**: Eliminar la `.js`. Si se necesitan funciones client-side, migrar a `.ts`.

### 7. `videoEmbeds.js` no importado

**Archivo**: `src/utils/videoEmbeds.js`
**Problema**: Version `.js` nunca importada. La `.ts` se usa en `MediaCarousel.astro:6` y `BookDetails.astro:14`.
**Solucion**: Eliminar la `.js`.

### 8. `ValuePropositionHighlight.astro` no importado

**Archivo**: `src/components/details/ValuePropositionHighlight.astro`
**Problema**: Nunca importado. `ValueCard.astro` se usa en su lugar. Duplicado.
**Solucion**: Eliminar.

### 9. Iconos duplicados con versiones

**Archivos**:

- `src/components/icons/Contact.astro` vs `Contact_v2.astro` - `Contact_v2` no se importa
- `src/components/icons/payments/PayPal.astro` vs `Paypal_v2.astro` - `PayPal.astro` se usa en `Hero.astro` y `PaymentMethods.astro`, `Paypal_v2.astro` en `ValueCard.astro`. Inconsistente.

**Solucion**: Elegir una version. Eliminar la otra. Actualizar imports.

### 10. Paginas `ayuda/*.astro` vacias

**Archivos**: `src/pages/ayuda/pagos.astro`, `envios.astro`, `devoluciones.astro` (0 bytes cada uno)
**Problema**: Enlazadas desde `Footer.astro:32-34` pero estan vacias.
**Solucion**: Eliminar los 3 archivos y los enlaces del Footer. Se re-crearan con contenido real (bloque B9).

## Codigo duplicado

### 11. 3 implementaciones de carrito paralelas

**Archivos**:

- `src/components/Cart.jsx` + `CartItem.jsx` (React, muerto)
- `src/utils/cartManager.ts` (canonico, usado por Cart.jsx)
- `src/pages/checkout.astro` (vanilla JS, ignora CartManager, hace `JSON.parse(localStorage)` directo)

**Problema**: Tres implementaciones paralelas del carrito. `checkout.astro` no usa `CartManager.getCart()` ni `CartManager.updateQuantity()`.
**Solucion**: Unificar. `checkout.astro` debe usar `CartManager.ts`. Decidir React vs vanilla (no ambos).

### 12. `BookDetails` / `PackDetails` / `ExamDetails` ~80% identicos

**Archivos**:

- `src/components/details/BookDetails.astro` (~700 lineas)
- `src/components/details/PackDetails.astro` (~700 lineas)
- `src/components/details/ExamDetails.astro` (~700 lineas)

**Problema**: ~80% del codigo es identico: construccion de mediaItems, levelDisplay, breadcrumbs, recommendations, value card section, support section, layouts mobile/desktop.
**Solucion**: Unificar en `ProductDetails.astro` con prop `type: 'book'|'pack'|'exam'` y discriminacion por tipo.

### 13. `ProductCard.astro` vs `Card.astro`

**Archivos**:

- `src/components/ProductCard.astro` - acepta `Product`, usado por catalog containers
- `src/components/Card.astro` - acepta `Book`, usado por `FeaturedCatalog.astro:179`

**Problema**: Dos implementaciones paralelas de card de producto.
**Solucion**: Unificar en un solo componente que acepte `Product` (Book | Pack | Exam).

### 14. 8 componentes sociales con overlap

**Archivos**:

- `src/components/SocialMediaButton.astro`
- `src/components/SocialMediaContent.astro`
- `src/components/SocialShareButtons.astro`
- `src/components/SocialSharing.astro`
- `src/components/icons/Contact.astro` + `Contact_v2.astro`
- `src/components/icons/SocialNetwork.astro`
- `src/components/contact/SocialNetwork.astro`

**Problema**: 8 componentes sociales con responsabilidades superpuestas.
**Solucion**: Consolidar en 2-3 componentes maximo: uno para botones sociales del header/footer, uno para share buttons, uno para contact info.

### 15. 4 icon components benefits con estructura identica

**Archivo**: `src/components/icons/benefits/` (4 archivos)
**Problema**: Los 4 card components importan el mismo set de icons y tienen estructura casi identica.
**Solucion**: Unificar en un componente generico `BenefitsIcon.astro` con prop `name`.

### 16. CSS duplicado en 2 ubicaciones

**Archivos**:

- `src/styles/Benefits.css` + `src/styles/benefits/` (subfolder)
- `src/styles/paymentMethods.css` + `src/styles/paymentMethods/` (subfolder)
- `src/styles/contact/` (subfolder)

**Problema**: Estilos del mismo modulo en archivo top-level + subfolder.
**Solucion**: Elegir subfolder como convencion. Eliminar archivos top-level.

### 17. 5+ definiciones de `@keyframes fadeIn`

**Archivos**: `src/styles/catalog.css`, `src/styles/HeroBanner.css:24-26`, `src/styles/catalog.css:296-305`, `src/components/testimonios/index.astro:403-412`, `src/components/PromoCard.astro:226-235`, `src/components/catalog/CatalogContainer.astro:541-548`
**Problema**: Multiples definiciones de los mismos keyframes con timings diferentes.
**Solucion**: Crear `src/styles/animations.css` con definiciones unicas. Importar desde `global.css`.

### 18. `imagePreloader.js` deberia ser `.ts`

**Archivo**: `src/scripts/imagePreloader.js`
**Problema**: Es `.js` mientras los otros scripts (`HeroBanner.ts`, `mediaCarousel.ts`) son `.ts`. Pierde type-safety. Importado por `mediaCarousel.ts:1`.
**Solucion**: Migrar a `.ts`. Anadir `// @ts-check` o tipos.

### 19. JSON-LD duplicado por pagina

**Archivos**: `src/components/details/BookDetails.astro:138`, `src/pages/catalogo/libros/[id].astro:153`
**Problema**: Componentes de detalle emiten JSON-LD en el body. Paginas `[id].astro` tambien pasan `structuredData` al Layout que lo emite en `<head>`. Doble.
**Solucion**: Centralizar en Layout via props. Eliminar inline de componentes.

### 20. `pageInformation.json` duplica datos de contacto

**Archivo**: `src/database/pageInformation.json:11-16` vs `73-79`
**Problema**: `contact` duplica la misma direccion y telefono que `seo.organizationInfo.address`. Dos fuentes de verdad.
**Solucion**: Centralizar en `src/config/site.ts`. `pageInformation.json` solo contenido editorial.
