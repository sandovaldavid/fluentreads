# FluentReads

FluentReads is a high-performance, 100% static e-commerce platform designed for digital books, study packs, and international English exam preparation materials in Peru. Built for low-volume, high-speed catalog navigation, it uses the Peruvian Sol (PEN) currency and features a fully localized Spanish user interface.

> [!IMPORTANT]
> This platform is entirely static and serverless. It operates without dynamic database engines, user authentication, or online payment gateways (like Stripe or PayPal). Checkout is processed via WhatsApp, and payments are managed through direct bank transfers.

## Key Features

- **Dynamic Static Catalog**: Products are defined as JSON content collections and baked directly into HTML at build time, yielding near-instant page loads.
- **Client-Side Cart**: Managed entirely via `CartManager.ts`, synchronizing state in `localStorage` and dispatching custom reactive events.
- **WhatsApp Checkout**: Generates checkout summaries and transfers order details directly to the seller via WhatsApp.
- **Decap CMS Support**: Administrators can manage and edit the catalog using a web UI at `/admin`. Changes are saved back to GitHub, triggering an automatic Vercel build.
- **Service Worker Integration**: Integrates a custom service worker (`public/sw.js`) supporting stale-while-revalidate and offline-first cache strategies for resources.

## Architecture and Structure

The codebase is organized as follows:

```text
/
├── public/                 # Static assets (favicons, manifests, decals)
│   └── admin/              # Decap CMS configuration (index.html, config.yml)
├── src/
│   ├── assets/             # Processed assets (optimized images)
│   ├── components/         # Astro and React UI components
│   ├── config/             # Centralized site configurations
│   ├── data/               # Content collection data files (JSON)
│   ├── content/            # Glob-based collections (Markdown legal files)
│   ├── layouts/            # Page layouts and global SEO metadata
│   ├── pages/              # File-based routing pages
│   ├── scripts/            # Client-side scripts and interaction logic
│   ├── styles/             # Global styling (Tailwind CSS v4)
│   ├── types/              # Strict TypeScript type declarations
│   └── utils/              # Helper utilities (CartManager, filtering)
├── docs/                   # Roadmaps, technical audits, and sprint documentation
└── package.json            # Scripts, dependencies, and configuration
```

## Tech Stack

The application leverages the following modern frontend technologies:

| Dependency       | Version | Role / Context                                        |
| :--------------- | :------ | :---------------------------------------------------- |
| **Astro**        | 7.0.6   | Core static site generator framework                  |
| **React**        | 19.2.7  | Interactive UI islands (filters, cart actions)        |
| **Tailwind CSS** | 4.3.2   | Modern utility-first styling with `@tailwindcss/vite` |
| **Bun**          | 1.3.14  | JavaScript runtime, package manager, and test runner  |
| **TypeScript**   | 6.0.3   | Strict type validation                                |

> [!NOTE]
> This repository requires Bun 1.3.14 or later. Standard npm, yarn, or pnpm commands should not be used.

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js >= 22.0.0
- Bun >= 1.3.14

### Installation

Clone the repository and install the development dependencies:

```bash
bun install
```

### Development Server

Start the local server at `http://localhost:4321`:

```bash
bun run dev
```

### Build for Production

Validate files and build the production bundle to the `dist/` directory:

```bash
bun run build
```

To bypass linting and TypeScript checks (for emergencies only), run:

```bash
bun run build:force
```

### Preview Production Build

Launch a local server to preview the built static output:

```bash
bun run preview
```

## Available Scripts

The following helper scripts are configured in `package.json`:

| Script         | Command                        | Purpose                                          |
| :------------- | :----------------------------- | :----------------------------------------------- |
| `dev`          | `astro dev`                    | Run the local dev server                         |
| `build`        | `bun run check && astro build` | Verify and bundle static files                   |
| `build:force`  | `astro build`                  | Build without verification checks                |
| `preview`      | `astro preview`                | Serve the production build locally               |
| `check`        | `astro check`                  | Run Astro validation and TypeScript verification |
| `typecheck`    | `bun run check`                | Run type checking across the project             |
| `lint`         | `eslint .`                     | Verify codebase styles with ESLint               |
| `lint:fix`     | `eslint . --fix`               | Automatically fix linting violations             |
| `format`       | `prettier --write .`           | Format files according to Prettier settings      |
| `format:check` | `prettier --check .`           | Check files formatting without writing           |

## Content Collections

This project leverages Astro Content Collections validated with strict Zod schemas inside `src/content.config.ts`. The catalog comprises 12 distinct collections:

1. **books**: Single-file JSON representing individual digital books.
2. **packs**: Single-file JSON combining multiple books into discounted study bundles.
3. **exams**: Single-file JSON detailing international English exam types.
4. **editorial**: Single-file JSON containing publisher descriptions.
5. **testimonies**: Single-file JSON representing customer reviews.
6. **offers**: Single-file JSON listing active banner promotions.
7. **categories**: Single-file JSON defining product categories and navigation icons.
8. **generalFaqs**: Single-file JSON for general FAQs.
9. **catalogFaqs**: Single-file JSON for catalog FAQs.
10. **paymentFaqs**: Single-file JSON for billing FAQs.
11. **offerHeroBanner**: Single-file JSON for countdown banner configurations.
12. **legal**: Markdown-based collection representing legal guidelines.

## Decap CMS Configuration

Decap CMS is embedded at `/admin` (configured via `public/admin/index.html` and `public/admin/config.yml`).

Because Astro single-file collections are structured as JSON arrays and Decap CMS defaults to object files, we register a custom `json-array` serialization format inside the CMS:

```javascript
window.CMS.registerFormat('json-array', 'json', {
  fromFile: (content) => ({ items: JSON.parse(content) }),
  toFile: (data) => JSON.stringify(data.items, null, 2),
});
```

Modifying content in the `/admin` portal commits files directly to GitHub, triggering a rebuild on Vercel automatically.

## Environment Variables

Configure the following variables in a local `.env` file for development:

| Name                  | Scope  | Description                                          |
| :-------------------- | :----- | :--------------------------------------------------- |
| `PUBLIC_PAGECLIP_KEY` | Public | Key for serverless form processing via Pageclip      |
| `PUBLIC_SITE_URL`     | Public | Canonical URL of the site, used for absolute routing |

## Git Workflow & Releases

We enforce conventional commit messages. All pull requests and commits must follow standard prefixes:

```text
type(scope): description in imperative
```

- **Branching Policy**: Merges to the `develop` branch generate Vercel preview environments. Merges to `main` update the production site and trigger `release-please` to auto-bump version numbers and generate changelogs.
- **Git Hooks**: Pre-commit hooks run ESLint and Prettier check formatting before code is allowed to commit.
