# Guía de Contribución para FluentReads

¡Gracias por tu interés en contribuir a FluentReads!

Para mantener la calidad y consistencia del proyecto, seguimos algunas reglas estrictas para el código y el historial de Git. Por favor, lee esta guía antes de empezar a contribuir.

## Flujo de Trabajo (Git Workflow)

1. Crea una rama a partir de `develop` para nuevas características o arreglos (ej. `feat/nueva-funcion`, `fix/bug-catalogo`).
2. Realiza tus cambios y asegúrate de que los linters, el formateador y el compilador funcionen correctamente.
3. Haz un commit siguiendo nuestras reglas de Conventional Commits.
4. Envía un Pull Request a `develop`.

## Convención de Commits (OBLIGATORIO)

El proyecto utiliza **Conventional Commits SIN EMOJIS**. El historial de commits es la base para automatizar nuestros releases con `release-please`, por lo tanto, el formato es estricto.

El formato general es:

```
type(scope): descripción en imperativo
```

### Tipos permitidos

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Scopes permitidos

`catalog`, `details`, `payment`, `contact`, `cart`, `checkout`, `home`, `testimonios`, `header`, `footer`, `navbar`, `hero`, `benefits`, `seo`, `db`, `config`, `ci`, `env`, `devcontainer`, `vscode`, `agents`, `docs`, `deps`, `security`, `a11y`, `perf`, `styles`, `utils`, `types`, `layouts`, `components`, `pages`, `scripts`, `assets`, `release`

### Reglas para los commits

- **SIN EMOJIS**: Está estrictamente prohibido usar emojis (como ✨, 🐛, etc.). Rompen el parseo automático de `release-please` para la generación del Changelog.
- El **subject** (descripción) debe estar en minúscula, no debe terminar en punto final y debe tener un máximo de 100 caracteres.
- El **scope** es obligatorio y debe ser uno de los permitidos (deriva de la estructura del proyecto).
- El body y footer son opcionales, y deben estar separados por una línea en blanco.

### Ejemplos Válidos

```text
feat(catalog): add server-side search filtering
fix(details): correct exam difficulty enum mapping
docs(agents): add project context for AI agents
ci(devcontainer): publish image to ghcr on main push
```

### Ejemplos Inválidos (serán rechazados)

```text
✨ Add new feature                    # Uso de emoji
feat: add feature                     # Falta el scope
Feat(Catalog): Add feature            # Uso de mayúsculas, verbo no en imperativo
feat(catalog): add feature.           # Termina con punto final
```

## Configuración de Husky (Git Hooks)

El proyecto incluye githooks automatizados a través de **Husky** para garantizar la calidad antes de que los commits se guarden en el historial:

1.  **`pre-commit`**: Ejecuta `lint-staged`. Este hook correrá ESLint y Prettier únicamente sobre los archivos que están en el área de _stage_. Si hay errores de formato o linting que no se puedan arreglar automáticamente, el commit será bloqueado.
2.  **`commit-msg`**: Ejecuta `commitlint`. Analiza el mensaje de tu commit y valida que cumpla estrictamente con el formato Conventional Commits sin emojis. Si el mensaje es inválido, el commit será rechazado.

## Comandos Útiles

Antes de crear un commit o un Pull Request, te sugerimos correr los checks localmente:

```sh
bun run lint             # Verifica errores de ESLint
bun run check            # Verifica tipado de TypeScript y archivos .astro (Type-check)
bun run build            # Realiza el build del proyecto asegurando que todo compila
```

¡Gracias por ayudar a construir FluentReads!
