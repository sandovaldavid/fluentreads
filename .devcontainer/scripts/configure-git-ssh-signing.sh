#!/usr/bin/env bash
set -euo pipefail

config_dir="${XDG_CONFIG_HOME:-$HOME/.config}/git"
allowed_signers="${config_dir}/allowed_signers"

mkdir -p "$config_dir"

# User-level VS Code dotfiles own identity profiles. This repository only
# consumes the effective Git identity after all includes have been applied.
email="$(git config --get user.email || true)"
signing_key="$(git config --get user.signingKey || true)"

if [[ -z "$email" ]]; then
  echo "Warning: Git user.email is unavailable; configure host/user dotfiles before signing." >&2
  exit 0
fi

if [[ "$signing_key" != key::* ]]; then
  echo "Warning: Git user.signingKey is not an inline SSH public key." >&2
  exit 0
fi

public_key="${signing_key#key::}"
key_type="$(awk '{print $1}' <<<"$public_key")"
key_blob="$(awk '{print $2}' <<<"$public_key")"

if [[ -z "$key_type" || -z "$key_blob" ]]; then
  echo "Warning: Git user.signingKey is malformed." >&2
  exit 0
fi

agent_keys="$(ssh-add -L 2>/dev/null || true)"
if [[ -z "$agent_keys" ]]; then
  echo "Warning: SSH agent is unavailable or has no loaded keys." >&2
  exit 0
fi

agent_key="$(
  awk \
    -v expected_type="$key_type" \
    -v expected_blob="$key_blob" \
    '$1 == expected_type && $2 == expected_blob { print $1 " " $2; exit }' \
    <<<"$agent_keys"
)"

if [[ -z "$agent_key" ]]; then
  echo "Warning: the effective Git signing key is not loaded in the forwarded SSH agent." >&2
  exit 0
fi

desired_entry="${email} namespaces=\"git\" ${agent_key}"
current_entry=""
if [[ -f "$allowed_signers" ]]; then
  current_entry="$(cat "$allowed_signers")"
fi

if [[ "$current_entry" != "$desired_entry" ]]; then
  printf '%s\n' "$desired_entry" > "$allowed_signers"
fi
chmod 600 "$allowed_signers"

printf 'Git SSH signing configured for %s.\n' "$email"
