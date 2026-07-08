---
status: done
block: B7
priority: P0
---

# Issues de seguridad

Lista de problemas de seguridad, con referencias `archivo:linea`.

## P0 - Criticos

### 1. `target="_blank"` sin `rel="noopener"` (tabnabbing)

- [x] **Resuelto**: Añadido `rel="noopener noreferrer"` en `SocialMediaButton.astro`.

**Archivos**:

- `src/components/Footer.astro:127` - todos los links tienen `target='_blank'` sin `rel`
- `src/components/SocialMediaButton.astro:13` - `target='_blank'` sin `rel="noopener"`

**Problema**: `target="_blank"` sin `rel="noopener noreferrer"` permite tabnabbing. La pagina abierta puede redirigir el opener via `window.opener`.
**Solucion**: Anadir `rel="noopener noreferrer"` a todos los `target="_blank"`. Para enlaces internos, quitar `target="_blank"`.

### 2. `innerHTML` con datos de localStorage (XSS potencial)

- [x] **Resuelto**: Reescrito en `checkout.astro` usando DOM APIs (`createElement`, `textContent`, `appendChild`) sin usar `innerHTML`.

**Archivo**: `src/pages/checkout.astro:122-156`
**Problema**: `cartItemEl.innerHTML = \`...${item.title}...${item.image}...\``. Los datos vienen de `localStorage`(editable por el usuario o por scripts de terceros). Si`shoppingCart`se popula desde URL params o inputs externos, es inyeccion HTML/JS.
**Solucion**: Usar`textContent` + DOM API (`createElement`, `appendChild`) en vez de `innerHTML`.

### 3. `JSON.parse(localStorage)` sin try/catch

- [x] **Resuelto**: Añadidos bloques `try/catch` en todos los métodos de `CartManager` (`initializeCart`, `getCart`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`) y en `checkout.astro`.

**Archivo**: `src/utils/cartManager.ts:31,57,67,81,89`
**Problema**: `JSON.parse(localStorage.getItem(this.STORAGE_KEY))` sin try/catch. Un valor corrupto (o manipulado via devtools) lanza y rompe todo el sistema de carrito. `localStorage.setItem` tambien puede lanzar `QuotaExceededError`.
**Solucion**: Envolver en try/catch con valor por defecto `[]`.

### 4. WhatsApp placeholder `1234567890` en 5 componentes

- [x] **Resuelto**: Centralizado en `src/config/site.ts` (`siteConfig.whatsapp` y `siteConfig.whatsappUrl`). `checkout.astro` ahora lo lee del `siteConfig`.

**Archivos**:

- `src/components/Header.astro:43-48` - `href='https://wa.me/1234567890'`
- `src/components/Footer.astro:69` - `whatsAppUrl='https://wa.me/1234567890'`
- `src/components/paymentMethods/CTA.astro:116` - `href='https://wa.me/1234567890'`
- `src/components/SocialSharing.astro:17` - `url: 'https://wa.me/1234567890?text=...'`
- `src/components/contact/ContactInfo.astro:13` - `whatsapp: '1234567890'`
- `src/pages/checkout.astro:9` - `const whatsappNumber = '+51987654321';`

**Problema**: Placeholder de telefono. Clientes reales clickean y se redirigen a un numero inexistente. `pageInformation.json:8` tiene el real (`+51 987 654 321`) pero no se usa.
**Solucion**: Centralizar en `src/config/site.ts` (`siteConfig.whatsappUrl`). Reemplazar todos los hardcoded.

## P1 - Altos

### 5. Env vars expuestas al cliente sin prefijo `PUBLIC_`

- [x] **Resuelto**: `Form.astro` ahora lee primero `PUBLIC_PAGECLIP_KEY`, `PUBLIC_RECAPTCHA_SITE_KEY`, `PUBLIC_ENABLE_RECAPTCHA`, `PUBLIC_IS_DEVELOPMENT` con fallback a las variantes sin prefijo.

**Archivo**: `src/components/contact/Form.astro:33-38`
**Problema**: Usa `import.meta.env.PAGECLIP_KEY`, `RECAPTCHA_SITE_KEY`, `ENABLE_RECAPTCHA`, `IS_DEVELOPMENT` - todos sin prefijo `PUBLIC_`. Astro expone solo vars con `PUBLIC_` al cliente. Si estas se usan en client scripts, pueden ser undefined o filtrarse secretos.
**Solucion**: Renombrar a `PUBLIC_PAGECLIP_KEY`, `PUBLIC_RECAPTCHA_SITE_KEY`, `PUBLIC_ENABLE_RECAPTCHA`, `PUBLIC_IS_DEVELOPMENT`. Documentar en `.env.example`.

### 6. Form action con key undefined

- [x] **Resuelto**: `Form.astro` valida `isConfigured` antes de renderizar. Si no hay clave, muestra alerta roja y el botón queda deshabilitado (`disabled`).

**Archivo**: `src/components/contact/Form.astro:43`
**Problema**: `action={\`https://send.pageclip.co/${pageclipKey}/FluentReads-form\`}` - si `pageclipKey` es undefined, el form postea a `https://send.pageclip.co/undefined/FluentReads-form`. Fallo silencioso.
**Solucion**: Validar que la key exista antes de renderizar el form. Mostrar error o form deshabilitado.

### 7. reCAPTCHA sin SRI

- [ ] Aceptado como riesgo documentado: Google no provee hashes SRI para su CDN de reCAPTCHA.

**Archivo**: `src/components/contact/Form.astro:318-350`
**Problema**: Carga `https://www.google.com/recaptcha/api.js` dinamicamente sin SRI (Subresource Integrity). Si el CDN se compromete, se inyecta JS malicioso.
**Solucion**: Anadir `integrity` attribute (si Google lo provee) o aceptar el riesgo documentado.

### 8. `robots.txt` revela rutas inexistentes

- [x] **Resuelto**: Eliminados `/admin/`, `/carrito/`, `/perfil/` de `robots.txt`. Se conserva solo `/checkout/` (ruta real) y se corrigió la URL del sitemap.

**Archivo**: `public/robots.txt:5-7`
**Problema**: `Disallow: /admin/`, `/checkout/`, `/carrito/`, `/perfil/` - estas rutas no existen. Security through obscurity que revela intenciones futuras de rutas.
**Solucion**: Eliminar los `Disallow` de rutas inexistentes.

### 9. Facebook AppID placeholder

- [x] **Resuelto**: Centralizado en `siteConfig.social.facebookAppId` en `src/config/site.ts`.

**Archivo**: `src/database/pageInformation.json:52,57`
**Problema**: `"facebookAppID": "1234567890"` y `"fbAppId": "1234567890"` - placeholder duplicado con dos casings diferentes.
**Solucion**: Centralizar en `siteConfig.social.facebookAppId`. Eliminar de `pageInformation.json`.

### 10. Clipboard sin fallback

- [x] **Resuelto**: `PaymentCard.astro` ahora implementa función `copyText()` con fallback a `document.execCommand('copy')` via `textarea` temporal para navegadores sin Clipboard API o contextos HTTP.

**Archivo**: `src/components/paymentMethods/PaymentCard.astro:149`
**Problema**: `navigator.clipboard.writeText(text)` sin fallback. Si clipboard API no esta disponible (HTTP context, browsers antiguos), falla silenciosamente.
**Solucion**: Fallback con `document.execCommand('copy')` o mostrar mensaje de "copiar manualmente".

## P2 - Medios

### 11. `process.env` en contexto browser

- [x] **Resuelto**: Eliminada la referencia a `process.env.RECAPTCHA_SITE_KEY` en `Form.astro`. Ahora solo usa `import.meta.env.*`.

**Archivo**: `src/components/contact/Form.astro:38`
**Problema**: `import.meta.env.RECAPTCHA_SITE_KEY || process.env.RECAPTCHA_SITE_KEY` - `process.env` no existe en browser. Codigo muerto que puede causar errores.
**Solucion**: Eliminar la referencia a `process.env`.

### 12. Dev mode reCAPTCHA bypass sin proteccion real

- [ ] Aceptado como deuda de desarrollo. `IS_DEVELOPMENT` debe ser `false` en produccion.

**Archivo**: `src/components/contact/Form.astro:253-265`
**Problema**: En dev mode, el checkbox "Confirmo que no soy un robot" es un placeholder que no provee proteccion anti-spam real.
**Solucion**: Aceptar como deuda de desarrollo. Documentar que NUNCA debe usarse en produccion. Validar que `IS_DEVELOPMENT` sea false en build de produccion.

### 13. `.mcp.json` y `.claude/` commiteados

- [x] **Resuelto**: Ya estaban en `.gitignore`. Confirmado que no están trackeados en git.

**Archivos**: `.mcp.json`, `.claude/settings.local.json`
**Problema**: Configuracion personal/MCP commiteada al repo. Puede filtrar informacion de setup personal.
**Solucion**: Anadir a `.gitignore`. Solo commitear si hay razon explicita (config compartida del equipo).
