---
status: pending
block: B0, B8
priority: P0
---

# Violaciones de mejores practicas de Astro

Lista de violaciones contra la documentacion oficial de Astro, con referencias `archivo:linea`.

## 1. Sin `astro check` en el build

**Archivo**: `package.json:7`
**Problema**: El script `build` es solo `astro build` sin type-checking. Astro recomienda `astro check && astro build`.
**Solucion**:

```json
"build": "astro check && astro build",
"check": "astro check",
"typecheck": "astro check"
```

## 2. Sin adapter para deploy

**Archivo**: `astro.config.mjs:7-17`
**Problema**: No hay `adapter` configurado. El sitio es estatico por defecto, lo cual es correcto para Vercel, pero deberia documentarse explicitamente. Ademas `ssr.noExternal` (linea 13-14) es irrelevante para un sitio estatico.
**Solucion**: Eliminar `ssr.noExternal` o documentar por que esta ahi. Considerar `@astrojs/vercel` adapter si se necesitan server functions.

## 3. Sin `@astrojs/sitemap`

**Archivo**: `astro.config.mjs`, `public/robots.txt:8`
**Problema**: `robots.txt` referencia `https://fluentreads.devsolution.software/sitemap.xml` pero no hay sitemap generado. Resultado: 404 en `/sitemap.xml`.
**Solucion**: Instalar `@astrojs/sitemap` y anadirlo a `integrations` en `astro.config.mjs`.

## 4. Sin `<ClientRouter />` pero se usan view transitions

**Archivo**: `src/layouts/Layout.astro:267-272`, `src/components/HeroBanner.astro:108,123,129`
**Problema**: `HeroBanner.astro` importa `astro:transitions` y usa `transition:animate={fade(...)}`, pero `Layout.astro` nunca anade `<ClientRouter />` al `<head>`. Las view transitions no estan activas.
**Solucion**: Importar `ClientRouter` de `astro:transitions` en `Layout.astro` y anadirlo al `<head>`, o eliminar las directivas `transition:animate` de `HeroBanner.astro`.

## 5. Favicon con tipo MIME incorrecto

**Archivo**: `src/layouts/Layout.astro:230`
**Problema**: `<link rel='icon' type='image/png' href='/favicon.webp' />` - el `type` dice `image/png` pero el archivo es `.webp`. Debe ser `type='image/webp'`.
**Solucion**: Cambiar `type='image/png'` a `type='image/webp'`.

## 6. Imagen por defecto inexistente

**Archivo**: `src/layouts/Layout.astro:84`
**Problema**: Fallback `'/default-thumbnail.jpg'` no existe en `public/`. Solo existe `default-og-image.png`.
**Solucion**: Cambiar el fallback a `'/default-og-image.png'` o crear el archivo faltante.

## 7. Fuentes Google via `<link>` render-blocking

**Archivo**: `src/layouts/Layout.astro:234-252`
**Problema**: Fuentes Poppins y Lora cargadas via `<link>` a `fonts.googleapis.com` - dos round-trips adicionales, CSS render-blocking. El hack `media='print' onload="this.media='all'"` (linea 244-246) es una anti-pattern en Astro y un riesgo de CSP.
**Solucion**: Self-hostear las fuentes con `@fontsource/poppins` y `@fontsource/lora`, o usar el soporte nativo de fuentes de Astro 7 (`astro:assets` fonts).

## 8. Sin import aliases en tsconfig

**Archivo**: `tsconfig.json`
**Problema**: No hay `compilerOptions.paths`. Todos los imports usan rutas relativas profundas como `../../../utils/...`. Astro recomienda aliases.
**Solucion**:

```json
"compilerOptions": {
  "paths": {
    "@/*": ["./src/*"],
    "@components/*": ["./src/components/*"],
    "@layouts/*": ["./src/layouts/*"],
    "@styles/*": ["./src/styles/*"],
    "@utils/*": ["./src/utils/*"],
    "@types/*": ["./src/types/*"],
    "@database/*": ["./src/database/*"],
    "@assets/*": ["./src/assets/*"]
  }
}
```

## 9. Sin `env.d.ts` para tipado de env vars

**Archivo**: falta `src/env.d.ts`
**Problema**: `Layout.astro:73` usa `import.meta.env.PUBLIC_SITE_URL` y `Form.astro:33-38` usa `import.meta.env.PAGECLIP_KEY`, `RECAPTCHA_SITE_KEY`, `ENABLE_RECAPTCHA`, `IS_DEVELOPMENT` - todos sin tipado.
**Solucion**: Crear `src/env.d.ts`:

```ts
interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_PAGECLIP_KEY: string;
  readonly PUBLIC_RECAPTCHA_SITE_KEY: string;
  readonly PUBLIC_ENABLE_RECAPTCHA: string;
  readonly PUBLIC_IS_DEVELOPMENT: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 10. Sin `astro:content` collections

**Archivos**: `src/database/*.json`, `src/utils/listProducts.ts:3-5`
**Problema**: Los 13 archivos JSON en `src/database/` se importan directamente sin schema validation. Astro 5+ ofrece `astro:content` con `file()` loader y schemas Zod que validarian en build time todos los bugs de schema detectados.
**Solucion**: Crear `src/content.config.ts` con collections para books, packs, exams, editorial, categories, testimonies, offers, faqs, pageInformation. Mover JSON a `src/data/`.

## 11. Sin uso de `<Image>` de `astro:assets`

**Archivos**: 22+ tags `<img>` en componentes y paginas
**Problema**: Ninguna imagen usa el componente `<Image>` de Astro. Todas son `<img>` crudos sin optimizacion, sin `width`/`height` (CLS), sin `srcset` responsive.
**Solucion**: Migrar imagenes locales a `src/assets/` y usar `<Image>`. Para Cloudinary, configurar `image.remotePatterns` en `astro.config.mjs`.

## 12. Scripts con `define:vars` sin `is:inline`

**Archivos**:

- `src/components/contact/Form.astro:353` (`<script define:vars={{ contactForm }}>`)
- `src/pages/checkout.astro:83` (`<script define:vars={{ whatsappNumber }}>`)
- `src/components/QuestionCard.astro:63` (`<script define:vars={{ id, expanded }}>`)

**Problema**: `define:vars` solo funciona con `is:inline`. Sin `is:inline`, Astro intenta hacer bundle del script pero `define:vars` es incompatible con bundling. Puede emitir warnings o romper el build.
**Solucion**: Anadir `is:inline` a estos scripts o reescribir para usar `data-*` attributes + `document.querySelector`.

## 13. CSS global importado doble

**Archivos**: `src/pages/index.astro:5`, `src/pages/catalogo/index.astro:10`, `src/layouts/Layout.astro:4`
**Problema**: `Layout.astro:4` importa `global.css`. Pero `index.astro:5` y `catalogo/index.astro:10` tambien lo importan. CSS cargado dos veces en home y catalogo.
**Solucion**: Eliminar los imports de `global.css` (y `catalog.css`) de las paginas; el Layout ya los gestiona.

## 14. JSON-LD duplicado por pagina

**Archivos**: `src/components/details/BookDetails.astro:138`, `src/pages/catalogo/libros/[id].astro:153`
**Problema**: Los componentes de detalle emiten `<script type='application/ld+json'>` en el body, pero las paginas `[id].astro` tambien pasan `structuredData={...}` al `<Layout>` que lo emite en el `<head>`. Doble JSON-LD por pagina.
**Solucion**: Centralizar JSON-LD en el Layout via props; eliminar los blocks inline de los componentes de detalle.

## 15. Import desde `public/` (anti-pattern)

**Archivos**: `src/components/details/ValueCard.astro:11-12`
**Problema**: Importa imagenes de `../../../public/images/paymentMethods/yape.webp`. Importar desde `public/` bypassa el pipeline de Vite/Astro.
**Solucion**: Mover las imagenes a `src/assets/` e importar desde ahi, o usar la ruta string `/images/paymentMethods/yape.webp` directamente.

## 16. Sin `prefetch` configurado

**Archivo**: `astro.config.mjs`
**Problema**: No hay configuracion de `prefetch`. Astro recomienda habilitarlo para mejorar la percepcion de velocidad.
**Solucion**: Anadir `prefetch: { prefetchAll: true }` (o selectivo con `data-astro-prefetch`) en `astro.config.mjs`.

## 17. Script `src=` en vez de `import`

**Archivo**: `src/components/HeroBanner.astro:212`
**Problema**: `<script src="../scripts/HeroBanner.ts"></script>` usa la forma `src=` deprecada. Astro 7 prefiere `import` dentro de `<script>`.
**Solucion**:

```astro
<script>
  import '../scripts/HeroBanner.ts';
</script>
```
