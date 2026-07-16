---
name: kioku-vault
description: Use when working with an Obsidian vault via the Kioku MCP server. Covers the implemented 49-tool surface, workflows, capability gating, and safety notes.
---

# Kioku vault skill

Kioku reads, searches, and writes an Obsidian vault directly on disk. It works with Obsidian
closed. The optional WebSocket bridge only matters for UI actions and plugin integrations.

This skill summarizes what exists and when to use it. For exact parameters, read the tool's MCP
description or `docs/commands-reference.md`; do not guess parameter names.

## Tool categories

- **Query**: `find_similar_notes`, `get_links`, `list_notes`, `read_note`, `search_notes`.
- **Write**: `create_note`, `delete_note`, `edit_note`, `manage_trash`, `move_note`, `update_frontmatter`.
- **Tasks**: `list_tasks`, `set_task_state`.
- **Organization**: `audit_vault`, `find_duplicate_notes`, `manage_tags`, `process_inbox`, `suggest_folder`, `suggest_tags`.
- **Sessions**: `end_work_session`, `get_work_context`, `list_work_sessions`, `start_work_session`.
- **Engineering**: `create_project_doc`, `get_project_context`, `list_projects`, `setup_agent_workflow`.
- **Templates**: `manage_templates`.
- **Knowledge graph**: `get_concept_map`, `get_vault_snapshot`, `suggest_links`.
- **Research**: `audit_citations`, `export_citations`, `import_bibtex`.
- **Local generation**: `generate_flashcards`, `summarize_note`.
- **CSS**: `manage_css_snippets`.
- **Assets**: `find_orphan_assets`, `tidy_attachments`.
- **Plugin bridge**: `apply_template`, `get_installed_plugins`, `lint`, `query_dataview`.
- **Obsidian UI**: `edit_in_obsidian`, `get_obsidian_state`, `open_note_in_obsidian`, `trigger_obsidian_command`.
- **Utilities**: `get_server_status`, `rebuild_index`.

The core groups are always available. `research`, `generation`, `css`, `assets`, `bridge`, and
`plugin` are disabled by default. `git`, `restore`, and `zettelkasten` are removed groups. Check
`.kioku/config.yml` when a capability is unavailable instead of assuming an unknown-tool error is
a code defect.

## Search and reading

- Use `search_notes` with `mode='keyword'` for exact terms, tags, or filenames.
- Use `search_notes` with `mode='semantic'` when the concept is likely phrased differently; it requires Ollama.
- Use `search_notes` with `mode='hybrid'` as the default; it falls back to keyword search without Ollama.
- Use `list_notes` for folder and frontmatter filters, and `read_note` with `metadata_only=true` for metadata only.
- Use `get_links` with `direction='in'` for backlinks, `'out'` for outgoing links, or `'both'` for both.

## Notes and organization

- Use `create_note` for normal notes and structured `kind` values `zettel`, `literature`, `moc`, or `folder-readme`.
- Use `edit_note` with `mode='replace'`, `'append'`, or `'prepend'`; frontmatter is preserved.
- Use `update_frontmatter` for status, type, and incremental tag changes.
- Use `move_note` for moving or renaming; it can update inbound wikilinks.
- Use `process_inbox`, `manage_tags`, and `suggest_links` in preview mode before applying changes.
- Use `manage_trash` to list or restore Kioku soft-deleted notes.

## Tasks and engineering

Tasks are native Markdown checkboxes. Call `list_tasks` first, then `set_task_state` with the
returned note and line number.

For project work, call `get_project_context` before resuming. Use `create_project_doc` with
`doc_type` `adr`, `bug`, `plan`, `backlog`, or `knowledge`, then use `edit_note` and
`update_frontmatter` for follow-up changes. Use `start_work_session` and `end_work_session` for
handoffs. Use `manage_templates` for vault or engineering template overrides.

For a user request that involves substantial work on a named project, use the focused
`kioku-project-workflow` skill when available, or follow the `project_task` MCP prompt. That
workflow decides whether the task needs a session, plan, bug, ADR, knowledge note, or no document
at all. Do not create every document type by default.

MCP prompts return instructions for the agent; they do not execute the referenced tools by
themselves. The agent remains responsible for reviewing context, asking for confirmation before
destructive changes, performing code work with the client's native tools, and closing the session.

## Native Git guidance

Kioku does not provide Git tools. For a Git-backed vault, use the client's shell commands:

```bash
git status
git diff -- path/to/note.md
git add path/to/note.md
git commit -m "Review vault changes"
git restore -- path/to/note.md
git log -- path/to/note.md
```

Inspect `git diff` before a bulk operation and suggest a commit when the user wants a rollback
point. `git restore` discards working-tree changes, so require explicit confirmation before using
it. If the vault is not a Git repository, do not imply that Git recovery is available.

## Safety

Any tool with a `dry_run` parameter should be called with `dry_run=true` first and shown to the
user before applying, unless the user explicitly asked to skip confirmation in the current turn.
This is especially important for permanent `delete_note`, vault-wide `manage_tags`, and inbox
`process_inbox` changes.

## Finding the full tool list

The complete 49-tool inventory and exact schemas are in `docs/commands-reference.md`, or can be
queried through MCP `tools/list`.
