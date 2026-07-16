---
status: pending
block: B3
priority: P0
---

# Bugs de logica y sintaxis

Lista de bugs que afectan la funcionalidad del sitio, con referencias `archivo:linea`.

## P0 - Criticos (rompen funcionalidad)

### 1. Sintaxis `class` con backticks sin llaves

**Archivos**:

- `src/components/Navbar.astro:16` - `class=\`flex flex-col md:flex-row ...\``
- `src/components/ReviewStars.astro:34` - `class=\`flex items-center ${className}\``
- `src/components/benefits/BenefitsCard.astro:55`
- `src/components/benefits/PurchaseStepsCard.astro:41`
- `src/components/benefits/StatisticsCard.astro:16`

**Problema**: Usan `class=\`...\``(backticks como comillas de atributo) en vez de`class={\`...\``}` (llaves para expression). Resultado: la clase se renderiza como string literal con backticks o no compila.
**Solucion**: Cambiar `class=\`...\``por`class={\`...\``}`.

### 2. Enum `ALL_LEVELS` no coincide con URL

**Archivos**: `src/types/book.ts:7`, `src/utils/bookTags.ts:8,67`, `src/pages/catalogo/index.astro:36`, `src/pages/catalogo/libros/index.astro:30`
**Problema**: Enum tiene `ALL_LEVELS = 'all_levels'` (underscore), pero URL y lookups usan `'all-levels'` (hyphen). El filtro "Multi-nivel" nunca matchea.
**Solucion**: Unificar a `'all-levels'` (hyphen) en enum, `bookTags.ts`, y todas las comparaciones.

### 3. Enum `INTERNATIONAL_EXAM` con 3 convenciones distintas

**Archivos**: `src/types/book.ts:9`, `src/utils/bookTags.ts:10`, `src/components/catalog/Filter.jsx:10`
**Problema**: Enum usa `'internationalExam'` (camelCase), `bookTags.ts` usa `'International Exam'` (con espacio), `Filter.jsx` usa `'International Exam'`. Tres convenciones para el mismo valor.
**Solucion**: Unificar a `'international-exam'` (hyphen) en todos.

### 4. `packs.json` con `level` capitalizado

**Archivo**: `src/database/packs.json:17,41,62,83,104`
**Problema**: Usa `"Beginner"`, `"Intermediate"`, `"Advanced"` (capitalizado). El enum `BookLevel` y toda la logica de filtros usan lowercase. `packs/index.astro:42` `pack.level === initialLevel` nunca matchea.
**Solucion**: Normalizar todos los valores de `level` en `packs.json` a lowercase.

### 5. `exams.json` con valores fuera de enum

**Archivos**: `src/database/exams.json:60,86,62,88`, `src/types/exam.ts:3-12`
**Problema**:

- `examType: "FCE"` y `"CPE"` - no existen en enum `ExamType` (solo `CAMBRIDGE`)
- `difficulty: "upper-intermediate"` y `"proficient"` - no existen en enum `ExamDifficulty` (solo `beginner`/`intermediate`/`advanced`)
- `examenes-internacionales/index.astro:30-36` solo mapea IELTS/TOEFL/CAMBRIDGE/SAT/OTHER

**Solucion**:

- Anadir `FCE`, `CPE`, `PTE`, `GRE` al enum `ExamType`
- Anadir `UPPER_INTERMEDIATE`, `PROFICIENT` al enum `ExamDifficulty`
- Actualizar el mapeo en `examenes-internacionales/index.astro`

### 6. `twitterCard` recibe URL de imagen en vez de card type

**Archivos**:

- `src/pages/catalogo/index.astro:163` - `twitterCard={siteInfo.seo.images.catalog}`
- `src/pages/contacto/index.astro:79`
- `src/pages/testimonios/index.astro:89`
- `src/pages/paymentMethods/index.astro:84`
- `src/database/pageInformation.json:52` - `"twitterCard": "https://res.cloudinary.com/..."`

**Problema**: La propiedad `twitter:card` debe ser un tipo de card (`summary_large_image`, `summary`), no una URL de imagen. Las 4 paginas pasan una URL de imagen. Twitter cards invalidas.
**Solucion**: `twitterCard` debe ser siempre `"summary_large_image"`. La imagen va en `twitterImage` por separado. Corregir el schema en `pageInformation.json:52` y las 4 paginas.

### 7. Referencia a `/api/og` inexistente

**Archivo**: `src/pages/catalogo/index.astro:150`
**Problema**: `ogImage = ... ? '${siteInfo.siteURL}/api/og?title=...' : ...` referencia un endpoint `/api/og` que no existe (no hay `src/pages/api/`). Cuando se aplican filtros, el OG image 404s.
**Solucion**: Eliminar la referencia a `/api/og` o crear el endpoint.

### 8. Paginas vacias enlazadas desde el Footer

**Archivos**:

- `src/pages/ayuda/pagos.astro` (0 bytes)
- `src/pages/ayuda/envios.astro` (0 bytes)
- `src/pages/ayuda/devoluciones.astro` (0 bytes)
- `src/components/Footer.astro:32-34` (enlaces a `/ayuda/envios`, `/ayuda/pagos`, `/ayuda/devoluciones`)

**Problema**: 3 paginas vacias (0 bytes) enlazadas desde el Footer. Click = pagina en blanco.
**Solucion**: Borrar los 3 archivos y quitar los enlaces del Footer. Se re-crearan con contenido real.

### 9. Handler `DOMContentLoaded` duplicado

**Archivo**: `src/components/paymentMethods/DeliveryTime.astro:217-336`
**Problema**: Dos bloques completos de `DOMContentLoaded` (lineas 219-281 y 284-336) hacen exactamente lo mismo (setup del slider de testimonios). Se ejecutan dos veces, attach dos `setInterval`, el segundo resetea al primero. Testimonios flickerean.
**Solucion**: Eliminar el segundo handler duplicado (lineas 284-336).

### 10. `CartIndicator.astro` nunca importado

**Archivo**: `src/components/CartIndicator.astro`
**Problema**: El componente existe pero nunca se importa en ningun archivo. El badge de contador de carrito nunca aparece en el header.
**Solucion**: Importar y renderizar `CartIndicator.astro` en `Header.astro`, o eliminar si se usa otro enfoque.

## P1 - Altos

### 11. Boton de men movil sin aria

**Archivo**: `src/components/Header.astro:27-31`
**Problema**: Boton `#mobile-menu-button` sin `aria-label`, `aria-expanded`, `aria-controls`. Screen readers no pueden interpretar que hace.
**Solucion**: Anadir atributos ARIA.

### 12. Link `/blog` inexistente

**Archivos**: `src/components/Navbar.astro:53`, `src/components/Footer.astro:14`, `src/components/SuccessMessage.astro:54`
**Problema**: Enlace a `/blog` pero no existe `src/pages/blog/`. 404.
**Solucion**: Crear la pagina o eliminar los enlaces.

### 13. `console.log` en produccion

**Archivos**:

- `src/utils/listProducts.ts:38-40` - `console.log(\`Processed ${processedBooks.length} books\`)`
- `src/pages/catalogo/index.astro:87-103`
- `src/pages/catalogo/libros/index.astro:134`
- `src/pages/catalogo/packs/index.astro:130`
- `src/pages/catalogo/examenes-internacionales/index.astro:136`
- `src/utils/catalogFilters.ts:26,32,36,92,96`

**Problema**: Debug logging en codigo de produccion, contamina el output de build.
**Solucion**: Eliminar todos los `console.log`/`console.warn`. La regla ESLint `no-console` previene futuros.

### 14. `Class` (capital C) en vez de `class`

**Archivo**: `src/components/paymentMethods/Hero.astro:84`
**Problema**: `<ArrowBottomIcon Class='h-5 w-5 ml-2' />` - `Class` no es un atributo HTML valido. El icono renderiza sin estilos.
**Solucion**: Cambiar `Class` por `class`.

### 15. `mailto:` con `target="_blank"`

**Archivo**: `src/components/SocialShareButtons.astro:122-130,124`
**Problema**: Link `mailto:` con `target="_blank"` abre un tab vacio + el cliente de mail. UX incorrecta.
**Solucion**: Quitar `target="_blank"` del link `mailto:`.

### 16. `xs:inline` breakpoint inexistente

**Archivos**: `src/components/BookTags.astro:47,76,94-102`
**Problema**: `<span class='hidden xs:inline'>` usa `xs:` que no es breakpoint default de Tailwind v4. Ademas, `BookTags.astro:94-102` redefine manualmente `.xs\:inline` en CSS. Los labels nunca se muestran en ningun screen size.
**Solucion**: Anadir `xs` al `@theme` de Tailwind o usar `sm:inline` (breakpoint existente).

### 17. Footer con `target="_blank"` en enlaces internos

**Archivo**: `src/components/Footer.astro:127`
**Problema**: Todos los links del Footer tienen `target='_blank'`, incluyendo navegacion interna (`/catalogo`, `/testimonios`). Click abre nuevo tab. Mal UX.
**Solucion**: Quitar `target="_blank"` de enlaces internos. Solo mantener en externos con `rel="noopener noreferrer"`.

### 18. `process.env` en contexto browser

**Archivo**: `src/components/contact/Form.astro:38`
**Problema**: `import.meta.env.RECAPTCHA_SITE_KEY || process.env.RECAPTCHA_SITE_KEY` - `process.env` no existe en browser. El fallback es codigo muerto/buggy.
**Solucion**: Eliminar la referencia a `process.env`. Usar solo `import.meta.env`.

### 19. `event` global deprecado

**Archivo**: `src/components/contact/Form.astro:510`
**Problema**: `if (event && event.preventDefault)` referencia el global `event` deprecado. En strict mode lanza `ReferenceError`.
**Solucion**: Usar el parametro del handler: `function handler(e: Event) { e.preventDefault(); }`.

### 20. Newsletter con `alert()` sin backend

**Archivos**: `src/components/Footer.astro:88-102`, `src/components/CTA-Banner.astro:88-102,128-131`
**Problema**: Forms de newsletter usan `alert(...)` para confirmar. No envian el email a ningun lado.
**Solucion**: Integrar Pageclip, Mailchimp, o similar. (Feature incompleta - ver `incomplete-features.md`).

### 21. Filtro "Recientes" de testimonios es stub

**Archivo**: `src/pages/testimonios/index.astro:335-344`
**Problema**: Filtro "Recientes" muestra los primeros 3 items sin ordenar por fecha. Comentario explicito "demo purposes" en linea 336.
**Solucion**: Implementar orden por campo `date` real en `testimonies.json`.

### 22. Skeleton con columnas hardcoded

**Archivo**: `src/components/SkeletonCatalog.astro:12`
**Problema**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` hardcoded sin respetar el prop `count` ni el grid real (que usa 3-6 columnas). El skeleton nunca coincide con el grid real.
**Solucion**: Recibir `gridCols` como prop y generar las clases dinamicamente.

### 23. `parseInt` sin guard NaN

**Archivo**: `src/pages/checkout.astro:178,205`
**Problema**: `parseInt(btn.getAttribute('data-index'))` retorna `NaN` si el atributo falta. `cart[NaN]` es `undefined`. `cart[NaN].quantity += 1` lanza TypeError.
**Solucion**: Guard `if (Number.isNaN(index)) return;`.

### 24. Non-null assertion insegura

**Archivo**: `src/components/paymentMethods/CTA.astro:179-187`
**Problema**: `document.getElementById('hours')!.textContent = ...` usa `!`. Si el elemento se renombra/remueve, lanza en runtime y mata el countdown.
**Solucion**: Guard `const el = document.getElementById('hours'); if (!el) return;`.

### 25. `localStorage` sin try/catch en countdown

**Archivo**: `src/components/paymentMethods/CTA.astro:149-166`
**Problema**: `localStorage.getItem/setItem/removeItem('countdownEnd')` sin try/catch. Safari private mode y quota-exceeded lanzan.
**Solucion**: Envolver en try/catch.

### 26. Event listeners globales sin cleanup

**Archivos**:

- `src/scripts/HeroBanner.ts:140-148` - `document.addEventListener('keydown', ...)`
- `src/scripts/mediaCarousel.ts:152-167` - mismo patron

**Problema**: Listeners globales en `document` nunca se remueven. Si el componente se re-monta (view transition), se acumulan.
**Solucion**: Guardar referencia al listener y removerlo en cleanup, o usar `{ once: true }` si aplica.

### 27. ID aleatorio en QuestionCard

**Archivo**: `src/components/QuestionCard.astro:18`
**Problema**: `id = \`question-${Math.random()...}\``- random por render. En server-render, el ID del HTML difiere del ID que el cliente`define:vars`ve. Frágil aunque funciona en build estatico.
**Solucion**: Usar`crypto.randomUUID()` o un contador estatico.

### 28. Skeleton copy button con logica invertida

**Archivo**: `src/components/paymentMethods/PaymentCard.astro:128-143`
**Problema**: Logica del copy button: captura la referencia dentro del `.then`, puede estar detached. Logica invertida (esconde on success, deberia esconder on click y mostrar despues).
**Solucion**: Revisar y corregir el flujo del copy button.

## P2 - Medios

### 29. `new URL` con URL absoluta

**Archivo**: `src/pages/index.astro:15`
**Problema**: `new URL(siteInfo.seo.defaultImage, siteInfo.siteURL).toString()` - `defaultImage` ya es absoluta (`https://res.cloudinary.com/...`). `new URL(absoluta, base)` retorna la absoluta sin cambiar. Funciona por accidente pero la intencion (resolver relativo a base) esta rota para paths relativos.
**Solucion**: Verificar si es absoluta antes de construir URL.

### 30. `getProductDetails` sin validacion de tipo

**Archivo**: `src/components/HeroBanner.astro:46-100`
**Problema**: Switch solo maneja `"book"|"pack"|"exam"`. Si `offerHeroBanner.json` tiene un typo, retorna `null` silenciosamente.
**Solucion**: Anadir case `default` con warning o validacion Zod.
