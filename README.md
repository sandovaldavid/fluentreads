# FluentReads

FluentReads is a 100% static, fast e-commerce platform for digital books, study packs, and international English exam material in Peru. The store uses the Peruvian Sol (PEN) currency and is fully localized with a Spanish user interface.

## Core Business Model

Designed for a low-volume, high-speed static catalog experience. It operates without dynamic database queries or online payment processors (such as Stripe or PayPal) to ensure maximum speed and performance.

- **Cart System**: Client-side cart unifications using `CartManager.ts`. It dispatches custom `cartUpdated` events to dynamically trigger reactive header updates.
- **Offline Support**: Offline capability via a custom Service Worker (`public/sw.js`) that caches key routes and static assets (stale-while-revalidate and network-first-with-offline-fallback caching strategy).
- **Checkout**: Order summary is sent to the seller directly via WhatsApp, which facilitates payment via bank transfers.

## Technical Stack

- **Framework**: Astro 7.0.6
- **UI Islands**: `@astrojs/react` 6.0.1 + React 19 (only for interactive elements like cart and filter)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Package Manager**: Bun 1.3.14
- **Language**: TypeScript (strict)

## Content Collections & Schemas

The project implements Astro Content Collections (using `file()` and `glob()` loaders) validated via strict Zod schemas defined in `src/content.config.ts`. The 12 collections are:

1. **`books`**: Single-file JSON collection (`src/data/books.json`) representing individual digital books. Defines details like ID, title, description, price, discount, cover image, rating, level, format, popularity tags, and included items.
2. **`packs`**: Single-file JSON collection (`src/data/packs.json`) combining multiple book IDs to sell study packs with custom discounts.
3. **`exams`**: Single-file JSON collection (`src/data/exams.json`) representing international English exams (e.g., IELTS, TOEFL, Cambridge, SAT, PTE, FCE, CPE, GRE) with difficulty levels and durations.
4. **`editorial`**: Single-file JSON collection (`src/data/editorial.json`) storing publishing house names and descriptions.
5. **`testimonies`**: Single-file JSON collection (`src/data/testimonies.json`) storing customer feedback (quotation, author, position, avatar URL, rating, date).
6. **`offers`**: Single-file JSON collection (`src/data/offers.json`) managing special visual promotion banners.
7. **`categories`**: Single-file JSON collection (`src/data/categories.json`) outlining catalog categories and their respective icons.
8. **`generalFaqs`**: Single-file JSON collection (`src/data/general-faqs.json`) storing general site FAQs.
9. **`catalogFaqs`**: Single-file JSON collection (`src/data/catalog-faqs.json`) storing product catalog-specific FAQs.
10. **`paymentFaqs`**: Single-file JSON collection (`src/data/payment-faqs.json`) storing bank transfer and checkout FAQs.
11. **`offerHeroBanner`**: Single-file JSON collection (`src/data/offer-hero-banner.json`) configuring active hero countdown banners.
12. **`legal`**: Markdown file collection (`src/content/legal/*.md`) using glob pattern loader to render legal pages dynamically.

## Decap CMS

Decap CMS is configured at `/admin` (via `public/admin/index.html` and `public/admin/config.yml`) to allow site administrators to natively edit JSON database files directly in GitHub.

- **Custom JSON Array Format**: Since Astro single-file JSON databases are top-level arrays and Decap CMS expects top-level objects, we register a custom `json-array` format in `public/admin/index.html`:
  ```javascript
  window.CMS.registerFormat('json-array', 'json', {
    fromFile: (content) => ({ items: JSON.parse(content) }),
    toFile: (data) => JSON.stringify(data.items, null, 2),
  });
  ```
- **Web UI Editing**: Modifying data via `/admin` commits changes directly to GitHub, which triggers a Vercel rebuild and deployment automatically.

## Environment Variables

| Variable              | Description                                                                                               |
| :-------------------- | :-------------------------------------------------------------------------------------------------------- |
| `PUBLIC_PAGECLIP_KEY` | Public key used for secure, serverless submissions from the contact form and newsletter forms.            |
| `PUBLIC_SITE_URL`     | The canonical site URL (e.g. `https://fluentreads.sandovaldavid.com`), used for absolute canonical links. |

## Project Structure

```text
/
├── public/                 # Static assets (favicons, manifests, etc.)
│   └── admin/              # Decap CMS configurations (index.html, config.yml)
├── src/
│   ├── assets/             # Processed assets (optimized images)
│   ├── components/         # Astro and React UI components
│   ├── config/             # Site configuration (site.ts)
│   ├── data/               # Astro content collections JSON databases
│   ├── content/            # Astro glob collections (legal pages)
│   ├── layouts/            # Layout components (Layout.astro, SEO, meta tags)
│   ├── pages/              # File-based routing pages
│   ├── scripts/            # Client-side scripts
│   ├── styles/             # Stylesheets (global.css using Tailwind CSS v4)
│   ├── types/              # Strict TypeScript definitions
│   └── utils/              # Client-side and server-side utilities (CartManager)
├── docs/                   # Sprints, roadmaps, and technical debt documentation
├── tsconfig.json           # TS configuration with import aliases
└── package.json            # NPM scripts and project dependencies
```

## Commands

All commands are run using the Bun package manager:

- `bun run dev`: Starts the local development server at `localhost:4321`.
- `bun run build`: Runs checks and builds the production-ready static site to `dist/`.
- `bun run build:force`: Forces a production build without running validation checks.
- `bun run preview`: Previews the built production site locally.
- `bun run check` (or `bun run typecheck`): Runs Astro checks and TypeScript validation.
- `bun run lint`: Runs ESLint check across all files.
- `bun run lint:fix`: Runs ESLint check and fixes fixable code style violations automatically.
- `bun run format`: Runs Prettier format writing changes to files.
- `bun run format:check`: Verifies the formatting is compliant with Prettier.

## Releases & Branching

- **Conventional Commits**: All commit messages must follow the Conventional Commits rules (e.g., `feat(catalog): add pagination` or `fix(details): handle null difficulty`). No emojis are allowed in commits.
- **Vercel CD Integration**: Any merge or push to the `develop` branch creates a preview deployment. Any merge or push to the `main` branch deploys to production and triggers a new release via `release-please` (which parses commits to generate the changelog and increment semantic version tags automatically).
