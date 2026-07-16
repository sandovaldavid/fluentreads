---
name: kioku-project-workflow
description: Use when a user asks to start, resume, plan, implement, review, debug, or document work for a project managed through the Kioku MCP server.
---

# Kioku project workflow

Use this skill to turn a project task into a deliberate agent workflow. It orchestrates Kioku's
atomic tools; it does not replace them and it does not execute tools automatically.

## Inputs

Extract these from the user request:

- `project`: the Kioku project identifier, such as `product-api` or `atena/api.core`.
- `task`: the requested outcome, including constraints and acceptance criteria.

If the project is missing or ambiguous, call `list_projects` and ask one focused clarification
before creating project documents. Do not guess a project from a similarly named folder.

## Workflow

### 1. Load context

For a project task, call `get_project_context` before editing project notes or code. Read only the
relevant documents, normally in this order:

1. Project MOC and the latest session summary.
2. Active plans and open bugs.
3. Relevant ADRs, tickets, backlog items, and knowledge notes.

Use `read_note` for full content and `search_notes` for prior art across the vault. The project
workspace is context, not a substitute for inspecting the source repository with native shell,
editor, or code-navigation tools.

### 2. Classify the request

Choose the smallest workflow that can produce the requested result:

| Request                            | Default action                                                |
| ---------------------------------- | ------------------------------------------------------------- |
| Explanation, lookup, or status     | Read/search only; do not start a session                      |
| Multi-step implementation          | Start a session; create or update a plan when useful          |
| Bug investigation or fix           | Start a session; create a bug note if the finding is reusable |
| Architecture choice                | Read existing ADRs; create a proposed ADR before acceptance   |
| Reusable lesson or setup knowledge | Create a knowledge note after verification                    |
| Deferred improvement               | Add a backlog item instead of expanding the current scope     |
| Daily/status update                | Use the daily workflow and link the session or project        |

Do not create an ADR, bug, plan, or knowledge note merely because the tool exists. Create an
artifact when it captures a decision, reusable finding, implementation boundary, or handoff that
another agent will need.

### 3. Start the session when justified

For substantial implementation, investigation, review, or documentation work:

1. Call `start_work_session` with the project and a concise goal.
2. Keep the session summary and modified-note tracking in mind throughout the work.
3. Do not start a second session if an active session already covers the same work.

For a read-only answer or a one-line edit, skip the session lifecycle.

### 4. Perform the task

Use the client's native code, shell, test, and Git tools for repository work. Use Kioku for vault
context and documentation:

- `create_project_doc` for ADRs, bugs, plans, backlog items, and knowledge.
- `edit_note` for body changes and checkbox updates.
- `set_task_state` only after `list_tasks` provides the current line number.
- `update_frontmatter` for supported status, type, and tag changes.
- `suggest_links` in preview mode before applying links.
- `get_project_context` again after major documentation changes when the handoff needs validation.

Keep writes incremental and narrow. Preserve human-written requirements and existing note content.
Never use permanent deletion, bulk tag changes, or inbox application without explicit approval in
the current turn, even when the task sounds like cleanup.

### 5. Verify and document

Before closing the task:

1. Run the relevant tests, build, lint, or review commands.
2. Check the actual changed files and statuses.
3. Update plan checkboxes only for work that is verified complete.
4. Set a plan to `done` explicitly with `update_frontmatter` when all its work is complete.
5. Record a bug, ADR, knowledge note, or backlog item only when its content is complete enough for
   a future agent to act on it.

Do not claim a tool or optional capability was used if it was not exposed by the current MCP
connection. Report unavailable capability groups explicitly.

### 6. Close the handoff

If a session was started, call `end_work_session` with a summary containing:

- What changed.
- What was verified and the exact command/result when useful.
- Remaining risks, blockers, or open decisions.
- The next action for the next agent.

The final response to the user should distinguish code changes, vault changes, verification, and
items that were intentionally not changed.

## MCP entry point

When the client supports MCP prompts, use `project_task(project, task)` as the reusable entry
point. It supplies the same lifecycle but still requires the agent to call each tool, perform the
work, and obtain confirmation before destructive operations.
