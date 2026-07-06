---
status: pending
block: B8
priority: P0
---

# Inconsistencias de schema en base de datos JSON

Lista de problemas de schema en los 13 archivos JSON de `src/database/`. La solucion a todos es migrar a `astro:content` collections con schemas Zod que validen en build time.

## P0 - Criticos (causan bugs funcionales)

### 1. `packs.json` con `level` capitalizado

**Archivo**: `src/database/packs.json:17,41,62,83,104`
**Problema**: Usa `"Beginner"`, `"Intermediate"`, `"Advanced"` (capitalizado). El enum `BookLevel` y toda la logica de filtros usan lowercase. `packs/index.astro:42` `pack.level === initialLevel` nunca matchea.
**Solucion**: Normalizar a lowercase: `"beginner"`, `"intermediate"`, `"advanced"`.

### 2. `exams.json` con `examType` fuera de enum

**Archivo**: `src/database/exams.json:60,86`
**Problema**: Usa `"examType": "FCE"` y `"CPE"`. El enum `ExamType` (`src/types/exam.ts:3-12`) no tiene `FCE` ni `CPE` (solo `CAMBRIDGE`). `examenes-internacionales/index.astro:33` solo mapea IELTS/TOEFL/CAMBRIDGE/SAT/OTHER. FCE/CPE renderizan como "Otros Examenes".
**Solucion**: Anadir `FCE`, `CPE`, `PTE`, `GRE` al enum. Actualizar el mapeo.

### 3. `exams.json` con `difficulty` fuera de enum

**Archivo**: `src/database/exams.json:62,88`
**Problema**: Usa `"difficulty": "upper-intermediate"` y `"proficient"`. El enum `ExamDifficulty` solo tiene `beginner`/`intermediate`/`advanced`. `levelDisplay` es `null` para esos examenes.
**Solucion**: Anadir `UPPER_INTERMEDIATE` y `PROFICIENT` al enum.

### 4. `pageInformation.json` con `twitterCard` como URL

**Archivo**: `src/database/pageInformation.json:52`
**Problema**: `"twitterCard": "https://res.cloudinary.com/..."` - schema wrong. `twitterCard` debe ser un tipo de card (`summary_large_image`), no una URL.
**Solucion**: Cambiar a `"twitterCard": "summary_large_image"`. La imagen va en campo separado.

### 5. `editorial.json` referencia rota

**Archivos**: `src/database/editorial.json`, `src/database/books.json:75`
**Problema**: `books.json:75` referencia `editorialId: "longman"` pero `editorial.json` no tiene `longman` (tiene penguin, harpercollins, cambridge, oxford, pearson, barrons, kaplan, macmillan, cengage, heinemann). `libros/index.astro:131` `editorialMap.get("longman")` retorna `undefined` → editorial en blanco.
**Solucion**: Anadir `longman` a `editorial.json` o cambiar `books.json` para usar un editorial existente.

## P1 - Altos

### 6. `offers.json` con precios como strings

**Archivo**: `src/database/offers.json:23-41`
**Problema**: Usa `"originalPrice": "S/199.99"`, `"salePrice": "S/149.99"`, `"discount": "25%"` (strings con prefijo `S/` y `%`). Mientras `books.json`/`packs.json`/`exams.json` usan numeros (`"price": 39.99`, `"discount": 15`). Dos schemas incompatibles para el mismo concepto.
**Solucion**: Normalizar a numeros. El prefijo `S/` se anade en la capa de presentacion.

### 7. `offers.json` con entradas duplicadas

**Archivo**: `src/database/offers.json:23-41`
**Problema**: Tres entradas (`pack-certificaciones`, `pack-certificaciones-2`, `pack-certificaciones-3`) con titulos identicos ("Pack Certificaciones 2", "Pack Certificaciones 3"), descripciones identicas, imagenes identicas, y `link: "/checkout/pack-certificaciones"`. Placeholder/duplicate test data.
**Solucion**: Eliminar duplicados. Mantener solo entradas unicas con datos reales.

### 8. `editorial.json` con nombres de campos en espanol

**Archivo**: `src/database/editorial.json`
**Problema**: Usa `"nombre"`, `"descripcion"` (espanol) mientras todos los demas JSON usan `"title"`, `"description"` (ingles). Inconsistencia.
**Solucion**: Renombrar a `"name"`, `"description"`.

### 9. `categories.json` con accent faltante

**Archivo**: `src/database/categories.json:17`
**Problema**: `"Examenes Internacionales"` - falta accent (debe ser `"Exámenes Internacionales"` como se usa en los titulos de pagina).
**Solucion**: Corregir el accent.

### 10. `categories.json` con imagenes identicas

**Archivo**: `src/database/categories.json:6,13,20`
**Problema**: Las 3 categorias usan `"image": "/images/libros-template.jpg"`. Sin diferenciacion visual.
**Solucion**: Asignar imagenes unicas por categoria.

### 11. `pageInformation.json` duplica datos de contacto

**Archivo**: `src/database/pageInformation.json:11-16` vs `73-79`
**Problema**: `contact` duplica la misma direccion y telefono que `seo.organizationInfo.address`. Dos fuentes de verdad.
**Solucion**: Centralizar en `src/config/site.ts`. `pageInformation.json` solo contenido editorial.

### 12. `pageInformation.json` con Facebook AppID duplicado

**Archivo**: `src/database/pageInformation.json:52,57`
**Problema**: `"facebookAppID": "1234567890"` y `"fbAppId": "1234567890"` - placeholder con dos casings diferentes para la misma key.
**Solucion**: Centralizar en `siteConfig.social.facebookAppId`. Eliminar de JSON.

### 13. WhatsApp en formatos incompatibles

**Archivos**:

- `src/database/pageInformation.json:8` - `"+51 987 654 321"` (con espacios y +)
- `src/components/Header.astro:46` - `"1234567890"` (placeholder)
- `src/pages/checkout.astro:9` - `"+51987654321"` (sin espacios)

**Problema**: `wa.me` API no acepta espacios ni `+`. `CustomerSupport.astro:10` los strippea con `.replace(/\+|\s/g, '')`, pero otros componentes no.
**Solucion**: Centralizar en `siteConfig.whatsapp` (formato E.164 sin espacios: `"51987654321"`) y `siteConfig.whatsappUrl` (`"https://wa.me/51987654321"`).

## P2 - Medios

### 14. `testimonies.json` con casing inconsistente

**Archivo**: `src/database/testimonies.json`
**Problema**: Usa `"avatarUrl"` (camelCase) mientras el resto usa snake_case para IDs (`booksIds` en `packs.json:9`, `editorialId` en `books.json:7`). No hay convencion consistente.
**Solucion**: Estandarizar a camelCase (convencion JS/TS) o snake_case para todos los IDs.

### 15. `offerDays` solo en `books.json`

**Archivos**: `src/database/books.json:8` (`"offerDays": 20`), `src/types/book.ts:41`, `src/components/details/ValueCard.astro:29`
**Problema**: `offerDays` esta en `Book` interface y `books.json`, pero no en `Pack` ni `Exam`. `PackDetails.astro` y `ExamDetails.astro` no lo pasan a `ValueCard` → siempre defaultea a 7 dias.
**Solucion**: Anadir `offerDays` a `Pack` y `Exam` interfaces + JSON, o eliminar si no aplica.

### 16. `exam.duration` no tipado

**Archivos**: `src/database/exams.json:10,36,62,88,114,140`, `src/types/exam.ts`
**Problema**: `exams.json` tiene `"duration": "4 semanas"` pero `Exam` interface no declara `duration`. Campo silenciosamente ignorado.
**Solucion**: Anadir `duration?: string` al interface o eliminar el campo.

### 17. `stock` inconsistente

**Archivos**: `src/types/book.ts`, `src/types/pack.ts` (`stock?: number`), `src/types/exam.ts` (sin stock), `src/database/packs.json` (`"stock": 50`), `src/database/books.json` (sin stock)
**Problema**: Solo `packs.json` tiene `stock`. Solo `Pack` interface lo declara. `packs/index.astro:95` lo defaultea a 10. Inconsistente.
**Solucion**: Decidir si stock aplica a todos los tipos. Unificar schema.

### 18. `pageInformation.json` con `images.blog` vacio

**Archivo**: `src/database/pageInformation.json:55-62`
**Problema**: `"images": { "blog": "" }` - string vacio. Referenciado en ningun lado ahora, pero si se anade blog, producira OG images rotas.
**Solucion**: Anadir imagen o eliminar el campo hasta que blog exista.

## Solucion global: content collections

La solucion estructural a todos estos problemas es migrar a `astro:content` collections:

### Plan de migracion (bloque B8)

1. Crear `src/content.config.ts` con collections para cada JSON:

   ```ts
   import { defineCollection, z } from 'astro:content';
   import { file } from 'astro/loaders';

   const books = defineCollection({
     loader: file('src/data/books.json'),
     schema: z.object({
       id: z.string(),
       title: z.string(),
       price: z.number(),
       level: z.enum(['beginner', 'intermediate', 'advanced', 'professional', 'all-levels', 'international-exam']),
       // ... campos validados
     }),
   });
   // ... packs, exams, editorial, categories, testimonies, offers, faqs, pageInformation
   export const collections = { books, packs, exams, ... };
   ```

2. Mover `src/database/*.json` a `src/data/` (convencion Astro 5+).
3. Migrar imports de `import books from '../database/books.json'` a `await getCollection('books')`.
4. Los schemas Zod validaran en build time todos los bugs anteriores (capitalizacion, enum values, campos faltantes).
5. Astro genera JSON Schemas en `.astro/collections/` para IntelliSense en el editor.
