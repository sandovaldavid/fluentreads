#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo "  FluentReads DevContainer Setup"
echo "========================================"
echo ""

echo "[1/3] Verifying base tools..."
echo "  Node: $(node --version)"
echo "  bun:  $(bun --version)"
echo ""

echo "[2/3] Installing project dependencies..."
bun install --frozen-lockfile
echo "  Astro: $(bun run --silent astro --version)"
echo ""

echo "[3/3] Setup complete!"
echo ""
echo "Available commands:"
echo "  bun run dev       - Start dev server on http://localhost:4321"
echo "  bun run build     - Type-check and build for production"
echo "  bun run lint      - Run ESLint"
echo "  bun run lint:fix  - Run ESLint with auto-fix"
echo "  bun run format    - Format code with Prettier"
echo "  bun run check     - Run astro check (TypeScript validation)"
echo "  bun run preview   - Preview production build locally"
echo ""
echo "See AGENTS.md for the project workflow."
echo "========================================"
