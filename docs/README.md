# FluentReads - Documentacion de deuda tecnica

> [!NOTE]
> **Este directorio es un archivo histórico.** Contiene la auditoría técnica original del proyecto (pre-estabilización) que sirvió de base para las issues [#50](https://github.com/sandovaldavid/fluentreads/issues/50) a [#65](https://github.com/sandovaldavid/fluentreads/issues/65). Casi todos los hallazgos aquí listados ya fueron resueltos. **Para el estado vigente de la deuda técnica, usa el tracker [#65](https://github.com/sandovaldavid/fluentreads/issues/65)** (y los issues individuales que enlaza), no las tablas de este README ni los `status:` en el frontmatter de cada documento — quedaron congelados en el momento de la auditoría y no se actualizan.

## Estado vigente (fuente de verdad: issues de GitHub)

| Issue                                                         | Tema                                                 | Estado                                                            |
| ------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| [#65](https://github.com/sandovaldavid/fluentreads/issues/65) | Tracker de estabilización (fases 1-5)                | Abierto — resume el estado de todo lo demás                       |
| [#50](https://github.com/sandovaldavid/fluentreads/issues/50) | Quality gates estrictos (astro check, CI)            | Cerrado                                                           |
| [#51](https://github.com/sandovaldavid/fluentreads/issues/51) | Cobertura de pruebas (unit + e2e + a11y)             | Cerrado                                                           |
| [#63](https://github.com/sandovaldavid/fluentreads/issues/63) | Gobernanza de `develop`/`main`, releases y deploy    | Abierto — pendiente que se configuren los secrets de Vercel       |
| [#52](https://github.com/sandovaldavid/fluentreads/issues/52) | Decap CMS alineado con el flujo real de publicación  | Cerrado                                                           |
| [#53](https://github.com/sandovaldavid/fluentreads/issues/53) | Reemplazar catálogo demo por datos verificados       | Abierto — requiere datos de negocio reales, no se pueden inventar |
| [#61](https://github.com/sandovaldavid/fluentreads/issues/61) | Formularios de contacto/newsletter confiables        | Cerrado                                                           |
| [#60](https://github.com/sandovaldavid/fluentreads/issues/60) | Headers de seguridad y scripts de terceros           | Cerrado                                                           |
| [#54](https://github.com/sandovaldavid/fluentreads/issues/54) | Totales de WhatsApp checkout confiables              | Cerrado                                                           |
| [#55](https://github.com/sandovaldavid/fluentreads/issues/55) | Service worker sin precios obsoletos                 | Cerrado                                                           |
| [#59](https://github.com/sandovaldavid/fluentreads/issues/59) | Rutas de categorías del catálogo                     | Cerrado                                                           |
| [#58](https://github.com/sandovaldavid/fluentreads/issues/58) | Metadata social y datos estructurados                | Cerrado                                                           |
| [#57](https://github.com/sandovaldavid/fluentreads/issues/57) | Content Collections como fuente única de verdad      | Cerrado                                                           |
| [#56](https://github.com/sandovaldavid/fluentreads/issues/56) | Unificación de filtros/orden/URL del catálogo        | Cerrado                                                           |
| [#62](https://github.com/sandovaldavid/fluentreads/issues/62) | Latencia artificial y contenido destacado            | Cerrado                                                           |
| [#64](https://github.com/sandovaldavid/fluentreads/issues/64) | Sincronizar esta documentación con la implementación | En curso (este cambio)                                            |

## Indice de documentos historicos

| Documento                                            | Descripcion                                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [audit-summary.md](./audit-summary.md)               | Resumen ejecutivo de la auditoria original                                                                                                  |
| [astro-best-practices.md](./astro-best-practices.md) | Violaciones de mejores practicas de Astro (halladas antes de la estabilización)                                                             |
| [bugs-logic.md](./bugs-logic.md)                     | Bugs de logica y sintaxis hallados en la auditoria                                                                                          |
| [bugs-styles.md](./bugs-styles.md)                   | Bugs de CSS y estilos hallados en la auditoria                                                                                              |
| [accessibility.md](./accessibility.md)               | Issues de accesibilidad hallados en la auditoria                                                                                            |
| [performance.md](./performance.md)                   | Issues de rendimiento hallados en la auditoria                                                                                              |
| [security.md](./security.md)                         | Issues de seguridad hallados en la auditoria                                                                                                |
| [duplicate-dead-code.md](./duplicate-dead-code.md)   | Codigo duplicado y muerto hallado en la auditoria                                                                                           |
| [incomplete-features.md](./incomplete-features.md)   | Features incompletas halladas en la auditoria                                                                                               |
| [database-schema.md](./database-schema.md)           | Inconsistencias de schema en JSON halladas en la auditoria (los schemas Zod en `src/content.config.ts` las validan en build time desde #57) |
| [roadmap.md](./roadmap.md)                           | Cronograma de sprints quincenales original                                                                                                  |

## Convenciones (aplican solo dentro de cada documento historico)

- Cada issue referenciado en estos documentos usa el formato `archivo:linea` para navegacion directa — puede haber quedado desactualizado si el archivo se movio o reescribio desde entonces.
- `priority: P0` = critico, `P1` = alto, `P2` = medio, `P3` = bajo (vigente solo como contexto historico de la severidad original).
- El campo `status:` de cada documento es `historical` — no representa si el trabajo esta hecho o no; para eso usa la tabla de issues de arriba.
