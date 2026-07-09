---
status: done
block: B9
priority: P2
---

# Features incompletas

Lista de features a medio hacer, rutas rotas y placeholders, con referencias `archivo:linea`.

## Features a medio hacer

### 1. Sistema de carrito huerfano

**Archivos**:

- `src/components/Cart.jsx` + `CartItem.jsx` (React, muerto - ver duplicate-dead-code.md)
- `src/components/CartIndicator.astro` (no importado)
- `src/utils/cartManager.ts` (canonico)
- `src/pages/checkout.astro` (vanilla JS, ignora CartManager)

**Estado**: 3 implementaciones paralelas. Ninguna completa. El badge del carrito nunca aparece en el header.
**Solucion**: Decidir enfoque (React island o vanilla). Unificar. Renderizar `CartIndicator.astro` en `Header.astro`. `checkout.astro` debe usar `CartManager.ts`.

### 2. Newsletter sin backend

**Archivos**: `src/components/Footer.astro:88-102`, `src/components/CTA-Banner.astro:88-102,128-131`
**Estado**: Forms de newsletter usan `alert(...)` para confirmar. No envian el email a ningun lado.
**Solucion**: Integrar Pageclip (ya usado para form de contacto), Mailchimp, o Buttondown. Crear endpoint o usar servicio externo.

### 3. Filtro "Recientes" de testimonios es stub

**Archivo**: `src/pages/testimonios/index.astro:335-344`
**Estado**: Filtro "Recientes" muestra los primeros 3 items sin ordenar por fecha. Comentario "demo purposes" en linea 336.
**Solucion**: Anadir campo `date` real a `testimonies.json`. Implementar orden cronologico descendente.

### 4. Busqueda server-side no implementada

**Archivos**: `src/layouts/Layout.astro:114-118`, `src/pages/catalogo/index.astro`, `src/components/catalog/Filter.jsx:461`
**Estado**: JSON-LD declara `SearchAction` apuntando a `/catalogo?search={search_term_string}`, pero `catalogo/index.astro` lee `?level`, `?format`, `?sort`, `?type` - nunca lee `?search` o `?q`. `Filter.jsx` tiene search input que funciona client-side, pero el server-rendered HTML ignora el URL param. Deep-linking de busqueda no funciona.
**Solucion**: Leer `?search=`/`?q=` en `catalogo/index.astro` y filtrar server-side antes de renderizar.

### 5. PWA sin service worker

**Archivos**: `public/manifest.json`, falta service worker
**Estado**: `manifest.json` declara icons y standalone display, pero no hay `service-worker.js` ni `@vite-pwa/astro`. El prompt de install no funciona para offline.
**Solucion**: Integrar `@vite-pwa/astro` con service worker. Configurar cache strategy para paginas estaticas e imagenes.

### 6. Ruta `/api/og` referenciada, no existe

**Archivo**: `src/pages/catalogo/index.astro:150`
**Estado**: `ogImage` referencia `${siteInfo.siteURL}/api/og?title=...` cuando hay filtros. No hay `src/pages/api/`. OG image 404s.
**Solucion**: Crear endpoint `src/pages/api/og.ts` que genere imagenes OG dinamicas (con `@vercel/og` o `satori`), o eliminar la referencia y usar una imagen estatica.

## Rutas rotas (enlazadas pero inexistentes)

### 7. Pagina `/blog`

**Enlazada en**: `src/components/Navbar.astro:53`, `src/components/Footer.astro:14`, `src/components/SuccessMessage.astro:54`
**Estado**: No existe `src/pages/blog/`. 404.
**Solucion**: Crear `src/pages/blog/` con content collection, o eliminar todos los enlaces.

### 8. Pagina `/ofertas`

**Enlazada en**: `src/components/PromoSection.astro:114` (referencia `link: "/ofertas"`)
**Estado**: No existe.
**Solucion**: Crear pagina o eliminar el enlace/PromoSection.

### 9. Paginas legales

**Enlazadas en**: `src/components/Footer.astro:145,152,158`

- `/politica-privacidad`
- `/terminos-condiciones`
- `/cookies`

**Estado**: Ninguna existe. E-commerce requiere estas paginas por ley (Peru/GDPR si aplica a usuarios europeos).
**Solucion**: Crear las 3 paginas con contenido legal real (requiere input legal). Usar content collection para texto.

### 10. Paginas de ayuda vacias

**Enlazadas en**: `src/components/Footer.astro:32-34`

- `/ayuda/envios` - `src/pages/ayuda/envios.astro` (0 bytes)
- `/ayuda/pagos` - `src/pages/ayuda/pagos.astro` (0 bytes)
- `/ayuda/devoluciones` - `src/pages/ayuda/devoluciones.astro` (0 bytes)

**Estado**: Archivos existen pero vacios.
**Solucion**: Borrar (decision confirmada). Se re-crearan con contenido real en bloque B9.

### 11. Rutas en `robots.txt` que no existen

**Archivo**: `public/robots.txt:5-7`

- `/admin/`
- `/checkout/`
- `/carrito/`
- `/perfil/`

**Estado**: Ninguna existe. Security through obscurity que revela rutas futuras.
**Solucion**: Eliminar los `Disallow` de rutas inexistentes.

## Features con datos huerfanos

### 12. `BookLevel.INTERNATIONAL_EXAM` sin productos

**Archivos**: `src/types/book.ts:9`, `src/utils/bookTags.ts:77-81`, `src/database/*.json`
**Estado**: El enum value, el levelStyle, y el levelConfig estan definidos, pero ningun producto en ningun JSON los usa. Dead/incomplete.
**Solucion**: O anadir productos que lo usen, o eliminar el enum value y sus configs.

### 13. `PopularityTag.PHRASAL_VERBS` sin config

**Archivos**: `src/types/book.ts`, `src/database/books.json:102` (`"phrasalVerbs"`)
**Estado**: `books.json` referencia `phrasalVerbs` pero no existe en el enum `PopularityTag`. El tag no tiene config y no renderiza en `BookTags`.
**Solucion**: Anadir `PHRASAL_VERBS` al enum + config, o eliminar el tag del JSON.

### 14. `difficultyConfig` incompleto

**Archivos**: `src/utils/examTags.ts`, `src/database/exams.json:62,88`
**Estado**: `difficultyConfig` solo tiene `beginner/intermediate/advanced`. `exams.json` usa `upper-intermediate` y `proficient` que no tienen config. `levelDisplay` es `null` para esos examenes.
**Solucion**: Anadir configs para `upper-intermediate` y `proficient`.

### 15. `ssr.noExternal` irrelevante

**Archivo**: `astro.config.mjs:13-14`
**Estado**: `ssr.noExternal: ['@justinribeiro/lite-youtube']` - config SSR irrelevante porque el sitio es estatico. Leftover de cuando se probo un adapter SSR.
**Solucion**: Eliminar o documentar por que es necesario.

### 16. `exam.duration` field no tipado

**Archivos**: `src/types/exam.ts`, `src/database/exams.json:10,36,62,88,114,140`
**Estado**: `exams.json` tiene `"duration": "4 semanas"` pero `Exam` interface no declara `duration`. Campo silenciosamente ignorado por el type system.
**Solucion**: Anadir `duration?: string` al interface `Exam` o eliminar el campo del JSON.

### 17. `requirements` field dead

**Archivos**: `src/types/exam.ts` (`requirements?: string[]`), `src/database/exams.json`
**Estado**: Interface declara `requirements` pero ningun exam lo usa. `examenes-internacionales/index.astro:82` lo defaultea a `[]`.
**Solucion**: Anadir requirements reales a los exams o eliminar el field.

### 18. `stock` inconsistente entre tipos

**Archivos**: `src/types/book.ts`, `src/types/pack.ts`, `src/types/exam.ts`, `src/database/books.json`, `src/database/packs.json`
**Estado**: `packs.json` tiene `"stock": 50`, `Pack` interface tiene `stock?: number`. `Book` y `Exam` no tienen `stock`. `packs/index.astro:95` lo defaultea a 10. Inconsistente.
**Solucion**: Decidir si stock es relevante para todos los tipos. Unificar.

## Database approach (edicion sin codigo)

### 19. Gist descartado

**Estado**: ~~Usar GitHub Gist para editar JSON sin deploy~~ **DESCARTADO**.
**Razon**: El sitio es 100% estatico. Editar el Gist no actualiza el sitio en produccion sin un nuevo build + deploy. Sin validacion de schema. Rate limits de la API (5000/hr auth). Requeriria un webhook manual o Action para triggerear rebuild.

### 20. Decap CMS (Sprint 7)

**Estado**: Completado (`done`).
**Solucion**:

- Instalado y configurado `decap-cms-app` en [public/admin/index.html](file:///home/sandovaldavid/workspaces/me/projects/fluentreads/public/admin/index.html) y [public/admin/config.yml](file:///home/sandovaldavid/workspaces/me/projects/fluentreads/public/admin/config.yml).
- Implementado proxy de desarrollo local en puerto `8081` (`decap-server`).
- Creadas **previsualizaciones personalizadas en tiempo real de alta fidelidad** en React + CSS personalizado [public/admin/preview.css](file:///home/sandovaldavid/workspaces/me/projects/fluentreads/public/admin/preview.css) para todas las colecciones (Libros, Packs, Exámenes, Editoriales, Categorías, Testimonios, Ofertas Especiales, FAQs y Banner Hero de Ofertas).
- Añadido motor de **autogeneración de metadatos** (IDs, detalles y enlaces de compra automáticos al escribir el título de un ítem) con sincronización de estado en React.
- Configurado widget `select` estático para la asignación de editoriales de forma consistente y robusta.
- Implementadas **validaciones de rangos numéricos** (`min`/`max`) en todas las colecciones para puntajes, precios, descuentos y contadores.
- Activado soporte inicial de **internacionalización (i18n)** para inglés y español en las páginas legales de tipo Markdown.
