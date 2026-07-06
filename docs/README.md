# FluentReads - Documentacion de deuda tecnica

Indice de la auditoria tecnica completa del proyecto FluentReads (Astro 7 + React 19 + Tailwind v4 + bun).

## Estado de los bloques

| Bloque | Documento                                    | Estado  | Sprint |
| ------ | -------------------------------------------- | ------- | ------ |
| B0     | Tooling de calidad + CI base                 | pending | S1     |
| B1     | CI/CD: Vercel deploy + release-please        | pending | S1     |
| B2     | Centralizacion de variables mudables         | pending | S2     |
| B3     | Bugs criticos de logica y sintaxis           | pending | S2     |
| B4     | Bugs de estilos                              | pending | S3     |
| B5     | Accesibilidad                                | pending | S3     |
| B6     | Performance                                  | pending | S4     |
| B7     | Seguridad                                    | pending | S4     |
| B8     | Refactor arquitectonico: content collections | pending | S5-S6  |
| B9     | Features incompletas                         | pending | S6-S7  |
| B10    | README + docs finales                        | pending | S8     |

## Indice de documentos

| Documento                                            | Descripcion                               |
| ---------------------------------------------------- | ----------------------------------------- |
| [audit-summary.md](./audit-summary.md)               | Resumen ejecutivo de la auditoria         |
| [astro-best-practices.md](./astro-best-practices.md) | Violaciones de mejores practicas de Astro |
| [bugs-logic.md](./bugs-logic.md)                     | Bugs de logica y sintaxis                 |
| [bugs-styles.md](./bugs-styles.md)                   | Bugs de CSS y estilos                     |
| [accessibility.md](./accessibility.md)               | Issues de accesibilidad                   |
| [performance.md](./performance.md)                   | Issues de rendimiento                     |
| [security.md](./security.md)                         | Issues de seguridad                       |
| [duplicate-dead-code.md](./duplicate-dead-code.md)   | Codigo duplicado y muerto                 |
| [incomplete-features.md](./incomplete-features.md)   | Features incompletas o a medio hacer      |
| [database-schema.md](./database-schema.md)           | Inconsistencias de schema en JSON         |
| [roadmap.md](./roadmap.md)                           | Cronograma de sprints quincenales         |

## Convenciones

- Cada issue referencia `archivo:linea` para navegacion directa.
- `status: pending` = no empezado, `in-progress` = en curso, `done` = completado.
- `priority: P0` = critico (rompe funcionalidad), `P1` = alto, `P2` = medio, `P3` = bajo.
- Los bloques B0-B10 se ejecutan como PRs separados con commits convencionales sin emojis.
