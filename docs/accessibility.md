---
status: done
block: B5
priority: P1
---

# Issues de accesibilidad

Lista de problemas de accesibilidad (WCAG 2.1 AA), con referencias `archivo:linea`.

## P1 - Altos (impacto directo en screen readers)

### 1. Boton de menu movil sin ARIA

**Archivo**: `src/components/Header.astro:27-31`
**Problema**: `<button id='mobile-menu-button'>` sin `aria-label`, `aria-expanded`, `aria-controls`. Screen readers no pueden interpretar que hace ni su estado.
**Solucion**:

```astro
<button
  id="mobile-menu-button"
  aria-label="Abrir menu de navegacion"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"></button>
```

### 2. Modal sin focus trap ni aria-labelledby

**Archivo**: `src/components/ImageModal.astro:13-49`
**Problema**:

- `<div role='dialog' aria-modal='true'>` sin `aria-labelledby` (no hay heading ID)
- Close button es `<span>` no `<button>` (linea 20)
- Focus no se mueve al abrir el modal
- Focus no esta trapeado (Tab puede escapar al fondo)
- `aria-hidden` no se setea cuando cerrado

**Solucion**:

- Convertir close a `<button aria-label='Cerrar'>`
- Anadir `aria-labelledby` apuntando al titulo
- Implementar focus trap
- Mover foco al modal al abrir
- Setear `aria-hidden="true"` cuando cerrado

### 3. Divs clickeables en vez de buttons

**Archivos**:

- `src/components/MediaCarousel.astro:60-76` - `<div class='media-image-container cursor-zoom-in'>` (abre modal)
- `src/components/MediaCarousel.astro:104-122` - `<div class='thumbnail-item' data-index={index}>` (clickable)

**Problema**: Divs clickeables no son focusables por teclado, no tienen `role="button"`, `tabindex`, ni `aria-label`. Usuarios de teclado no pueden interactuar.
**Solucion**: Convertir a `<button>` o anadir `role="button" tabindex="0" aria-label="..."` + handler `keydown`.

### 4. Botones de cantidad sin aria-label

**Archivo**: `src/pages/checkout.astro:139-144`
**Problema**: Botones `+`/`-` solo contienen `-` y `+` como texto. Screen readers anuncian "minus" / "plus" sin contexto.
**Solucion**: Anadir `aria-label='Aumentar cantidad'` / `aria-label='Disminuir cantidad'`.

### 5. aria-labels en ingles en sitio espanol

**Archivos**: `src/components/CartItem.jsx:64-80`
**Problema**: `aria-label='Decrease quantity'`, `'Increase quantity'`, `'Remove item'` en ingles. El sitio es en espanol.
**Solucion**: Cambiar a `'Disminuir cantidad'`, `'Aumentar cantidad'`, `'Eliminar item'`.

### 6. Emojis decorativos sin aria-hidden

**Archivos**:

- `src/components/BookTags.astro:42-50,70-79` - emojis como contenido de tags
- `src/components/TestimoniesCard.astro:60-62` - ` ❝` decorativo
- `src/components/paymentMethods/CTA.astro:39-43` - 5 estrellas `★`
- `src/components/paymentMethods/DeliveryTime.astro:155` - `"` decorativo
- `src/components/SectionTitle.astro:13-15` - underline decorativo
- `src/components/QuestionCard.astro:36-45` - chevron SVG sin `aria-hidden`

**Problema**: Screen readers leen emojis y caracteres decorativos ("star star star star star").
**Solucion**: Envolver en `<span aria-hidden="true">` o anadir `aria-hidden="true"` al SVG.

### 7. Inputs de newsletter sin label

**Archivos**: `src/components/Footer.astro:88-94`, `src/components/CTA-Banner.astro:91-96`
**Problema**: `<input type='email'>` con `placeholder` pero sin `<label>` ni `aria-label`.
**Solucion**: Anadir `<label>` visual o `aria-label='Email para newsletter'`.

### 8. Indicador obligatorio `*` dentro de label

**Archivo**: `src/components/contact/Form.astro:157-176`
**Problema**: `<span class='text-accent'>*</span>` dentro del `<label>`. Screen readers leen "asterisk" por cada campo obligatorio.
**Solucion**: Usar `aria-required="true"` en el input + `<span class="sr-only">obligatorio</span>`.

### 9. Botones de filtro sin aria-pressed

**Archivo**: `src/pages/testimonios/index.astro:174-188`
**Problema**: Botones de filtro solo tienen clase CSS `.active`. Screen readers no pueden saber cual esta activo.
**Solucion**: Anadir `aria-pressed={isActive}`.

### 10. Switch sin texto sr-only

**Archivo**: `src/components/catalog/Filter.jsx:512-522`
**Problema**: Switch con `role="switch"` y `aria-checked` (bien), pero el `<span class='sr-only'>` falta. El estado on/off no se anuncia en palabras.
**Solucion**: Anadir `<span class='sr-only'>{isOn ? 'Activado' : 'Desactivado'}</span>`.

## P2 - Medios

### 11. Logo sin width/height (CLS)

**Archivo**: `src/components/Header.astro:16-20`
**Problema**: `<img src='/assets/logo_v4.webp' alt='FluentReads'>` sin `width`/`height`. Layout shift al cargar.
**Solucion**: Anadir dimensiones o usar `<Image>` de astro:assets.

### 12. Indicator dots sin focus visible

**Archivo**: `src/components/HeroBanner.astro:200-204`
**Problema**: `<button class='indicator-dot'>` focusable pero sin estilo de focus visible mas alla del default de Tailwind.
**Solucion**: Anadir `focus-visible:ring-2 focus-visible:ring-offset-2`.

### 13. Card entera clickable sin keyboard support

**Archivo**: `src/components/Card.astro:197-210`
**Problema**: `.book-card` tiene `addEventListener('click', ...)` en toda la card. No hay `role="button"`, `tabindex`, ni handler de teclado.
**Solucion**: Anadir `role="button" tabindex="0"` + handler `keydown` para Enter/Space, o usar un `<a>` wrapper.

### 14. SVGs decorativos sin aria-hidden

**Archivos**: `src/components/Cart.jsx:128-145` (close button icon-only sin aria-label), `src/components/Cart.jsx:170-180` (SVG sin aria-hidden), `src/components/QuestionCard.astro:36-45` (chevron)
**Problema**: SVGs decorativos se leen por screen readers.
**Solucion**: `aria-hidden="true"` en SVGs decorativos. `aria-label` en buttons icon-only.

### 15. Label "Compartir" oculta en mobile

**Archivo**: `src/components/SocialShareButtons.astro:69-75`
**Problema**: `<span class='hidden sm:inline-block'>Compartir</span>` - en mobile solo se ve el icono, sin `sr-only` text.
**Solucion**: Anadir `<span class='sm:hidden sr-only'>Compartir</span>`.

### 16. Copy button sin texto visible en mobile

**Archivo**: `src/components/paymentMethods/PaymentCard.astro:80-85`
**Problema**: Copy button con `aria-label='Copiar numero'` (bien) pero `lg:opacity-0` - en mobile no hay texto visible ni tooltip.
**Solucion**: Mostrar texto o icono siempre visible.

## P2 - Animaciones

### 17. Sin `prefers-reduced-motion`

**Archivos**: toda la codebase
**Problema**: No hay `@media (prefers-reduced-motion: reduce)` en ningun lado. `animate-pulse`, `fadeIn`, carruseles, etc. violan la preferencia de usuario.
**Solucion**: Anadir global:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## P3 - Bajos

### 18. Contraste de color

**Archivo**: `src/styles/global.css:24-26`
**Problema**: `--color-neutral: #e5e7eb` (gris muy claro) usado como `text-neutral-light` en `Footer.astro:54,84,103,129,142,163`. En fondos blancos falla WCAG AA.
**Solucion**: Verificar contraste en cada uso. Usar `--color-neutral-dark` (#9ca3af) para texto sobre blanco.

### 19. Sin route announcement nativo

**Archivo**: `src/layouts/Layout.astro`
**Problema**: Sin `<ClientRouter />`, las navegaciones son full-page reload (el navegador anuncia el titulo automaticamente). Si se anade ClientRouter, el route announcer de Astro se activa solo. Cada pagina tiene `<title>` (bien).
**Solucion**: Asegurar que cada pagina tiene `<title>` unico (ya cumplen).
