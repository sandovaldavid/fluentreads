#!/usr/bin/env bash
set -euo pipefail

REPOSITORY_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPOSITORY_ROOT"

# VS Code installs user-level dotfiles after postCreate. Refresh signing here so
# the effective profile fragments and forwarded SSH agent are available.
bash .devcontainer/scripts/configure-git-ssh-signing.sh
