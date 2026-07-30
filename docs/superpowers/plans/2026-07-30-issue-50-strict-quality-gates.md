# Issue #50 — Restore Strict Astro Check and Trustworthy Quality Gates — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `bun run check` and CI actually fail on real TypeScript/Astro errors, and make GitHub branch protection actually require `lint`, `check`, and `build` to pass before merging into `develop`/`main`.

**Architecture:** This is a config-only fix — no application code changes. Three surfaces change: (1) `package.json` script definitions, (2) `.github/workflows/ci.yml` job steps, (3) GitHub repository rulesets (branch protection) for `develop` and `main`, mutated via `gh api`.

**Tech Stack:** bun, astro check, GitHub Actions, GitHub Rulesets API.

## Global Constraints

- Commits: Conventional Commits, no emojis, scope required (use `ci`), imperative, lowercase, no trailing period, max 100 chars subject.
- Branch naming: `fix/*` for bugfix branches, PR targets `develop` (never `main` directly).
- CI required checks today are NOT actually enforced by GitHub rulesets (verified via `gh api repos/sandovaldavid/fluentreads/rulesets/18647267` and `.../18647268` — neither has a `required_status_checks` rule, only `pull_request`, `non_fast_forward`, `deletion`).
- Current baseline (verified locally before any change): `astro check` → 0 errors, 0 warnings, 1 hint (clean). `eslint .` → 0 errors, 130 warnings (clean, warnings don't fail lint). `prettier --check .` → clean. `astro build` (via `build:force`) → succeeds, 29 pages. This means flipping the gate does NOT currently break anything — the fix is purely about making the gate real, not about fixing hidden errors.
- Must finish with `bun run lint && bun run check && bun run build` passing clean (per AGENTS.md).

---

### Task 1: Make `astro check` a real gate in package.json

**Files:**

- Modify: `package.json:15` (`check` script)

**Interfaces:**

- Produces: `bun run check` now exits non-zero on real `astro check` errors. `bun run typecheck` (already aliased to `bun run check`) and `bun run build` (already `bun run check && astro build`) inherit this automatically — no changes needed to those two scripts.

- [ ] **Step 1: Prove the current gate is fake**

Run: `bun run check; echo "exit code: $?"`
Expected: exits 0 regardless of errors, because of the `|| true`.

- [ ] **Step 2: Edit `package.json`**

Change:

```json
"check": "astro check || true",
```

to:

```json
"check": "astro check",
```

- [ ] **Step 3: Verify the gate is now real (negative test)**

Temporarily introduce a type error to prove it fails:

```bash
echo 'const __issue50Probe: number = "not-a-number";' >> src/env.d.ts
bun run check; echo "exit code: $?"
```

Expected: non-zero exit code, TypeScript error reported for `__issue50Probe`.

Then remove the probe line:

```bash
git checkout -- src/env.d.ts
```

- [ ] **Step 4: Verify the gate passes clean on real code**

Run: `bun run check`
Expected: `Result (176 files): 0 errors, 0 warnings, 1 hint` (the one hint is a pre-existing `document.execCommand` deprecation notice in `PaymentCard.astro`, out of scope for this issue).

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "fix(ci): make astro check a real quality gate"
```

---

### Task 2: Stop CI from bypassing validation via build:force

**Files:**

- Modify: `.github/workflows/ci.yml:68` (`build` job's Build step)

**Interfaces:**

- Consumes: Task 1's now-strict `bun run check` (transitively, via `bun run build`).
- Produces: CI `build` job runs `bun run build` (which is `bun run check && astro build`) instead of `bun run build:force` (plain `astro build`, no check). `build:force` itself stays in `package.json` as a documented local-only emergency escape hatch — it is just no longer reachable from CI.

- [ ] **Step 1: Edit `.github/workflows/ci.yml`**

Change the `build` job's step (currently):

```yaml
- name: Build
  run: bun run build:force
```

to:

```yaml
- name: Build
  run: bun run build
```

- [ ] **Step 2: Confirm no other workflow bypasses validation**

Run: `grep -rn "build:force\|continue-on-error\|check || true" .github/workflows/`
Expected: no matches (deploy-vercel.yml and devcontainer.yml don't reference these scripts — confirm output is empty).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci(ci): stop bypassing astro check via build:force"
```

---

### Task 3: Require lint, check, and build in GitHub rulesets for develop and main

**Files:**

- No repo files — this is a GitHub repository configuration change made via `gh api` against the existing rulesets (id `18647267` for `develop`, `18647268` for `main`).

**Interfaces:**

- Consumes: the three CI job names defined in `.github/workflows/ci.yml`: `lint`, `check`, `build` (these are the `name:` values under each `jobs.*`, which is what GitHub matches against as the "context" name).
- Produces: PRs into `develop`/`main` cannot merge (for non-bypass roles) unless all three contexts report success on the latest commit.

**This task changes shared branch-protection config, not code — confirm with the user in chat before applying the API mutation, even though it is listed in this plan.**

- [ ] **Step 1: Fetch current ruleset JSON for develop (id 18647267) and main (id 18647268)** as a backup, save to a scratch file before mutating, e.g.:

```bash
gh api repos/sandovaldavid/fluentreads/rulesets/18647267 > /tmp/claude-1000/*/scratchpad/ruleset-develop-before.json
gh api repos/sandovaldavid/fluentreads/rulesets/18647268 > /tmp/claude-1000/*/scratchpad/ruleset-main-before.json
```

- [ ] **Step 2: PATCH each ruleset to add a `required_status_checks` rule**

Append this rule object to the existing `rules` array (keep `pull_request`, `non_fast_forward`, `deletion` untouched) for both rulesets:

```json
{
  "type": "required_status_checks",
  "parameters": {
    "strict_required_status_checks_policy": true,
    "do_not_enforce_on_create": false,
    "required_status_checks": [
      { "context": "lint" },
      { "context": "check" },
      { "context": "build" }
    ]
  }
}
```

Apply via `gh api --method PUT repos/sandovaldavid/fluentreads/rulesets/{id}` with the full existing ruleset body (conditions + all rules including the new one) as the payload — the Rulesets API PUT replaces the whole ruleset, so build the payload from the fetched JSON in Step 1 plus the new rule, not from scratch.

- [ ] **Step 3: Verify enforcement**

```bash
gh api repos/sandovaldavid/fluentreads/rulesets/18647267 --jq '.rules[] | select(.type=="required_status_checks")'
gh api repos/sandovaldavid/fluentreads/rulesets/18647268 --jq '.rules[] | select(.type=="required_status_checks")'
```

Expected: both print the `required_status_checks` rule with the three contexts.

- [ ] **Step 4: No git commit** — this is a GitHub-side config change, not a file change. Note it in the PR description for Task 1/2 instead.

---

### Task 4: Open PR against develop and verify CI is green end-to-end

**Files:** none (repo operations only).

- [ ] **Step 1: Push branch and open PR**

```bash
git push -u origin fix/ci-strict-quality-gates
gh pr create --base develop --title "fix(ci): restore strict astro check and trustworthy build gate" --body "Resolves #50."
```

- [ ] **Step 2: Watch CI**

```bash
gh pr checks --watch
```

Expected: `lint`, `check`, `build` all pass.

- [ ] **Step 3: Merge (squash, per repo convention) once green, then confirm with the user before merging** since merging to `develop` is a shared-branch action.

```bash
gh pr merge --squash
```

- [ ] **Step 4: Close issue #50 reference** — handled automatically by "Resolves #50" in the PR body once merged.
