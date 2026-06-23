# CLI style

Reusable terminal output style package for Lewis Howles projects.

## Purpose

Provide a shared CLI style system for local tools, diagnostics, agent-facing reports, and user-facing package commands. Output must stay consistent, compact, readable, and safe across colour, no-colour, Unicode, plain, CI, and JSON modes.

This package is a standalone repo at `Repositories/Packages/cli-style`. Do not edit parent workspace or sibling package configuration unless the user separately approves that scope.

## Functionality

Planned functionality:

- Theme tokens for terminal colour, symbols, spacing, borders, and severity names
- Terminal capability detection for TTY, CI, no-colour, plain, width, and Unicode support
- Pure string renderers for chips, panels, statuses, tables, rows, progress bars, bar charts, dividers, hints, and error blocks
- Opinionated patterns for diagnostics, command results, agent transcripts, audit findings, compact data tables, confirmation results, and next-step blocks
- A read-only gallery command to review every style before adoption

## Tech choices

- JavaScript ESM package
- Bun package manager, matching nearby `@lewishowles/*` packages
- Small string-rendering API first
- Renderer methods return strings; `ui.print()`, `ui.write()`, or the CLI binary handle stdout and stderr
- Library `json` profile returns structured data unchanged; CLI commands serialise JSON
- No full TUI framework unless a future feature needs focus management, keyboard navigation, or live layout
- JSON output remains machine-readable and unstyled

## Architecture notes

- Keep terminal styling separate from `@lewishowles/components`, which is browser/UI focused.
- Keep terminal styling separate from `@lewishowles/helpers`, which is general runtime utility focused.
- Prefer data-led renderers that can return strings and be snapshot-tested.
- Profiles control presentation: `human`, `agent`, `diagnostic`, `ci`, `plain`, and `json`.
- `src/capability/resolve-profile.js` should choose the active profile from flags, environment, and streams.
- `src/profiles/*.js` should define how each profile renders.
- Split single-value progress from multi-row charts: public API should expose `progressBar()` and `barChart()`, not one overloaded `bar()`.
- Shell, Python, and Swift consumers may need native adapters or deliberately small fallbacks; do not force every script through Node without reviewing cost.

## Specs

- `.agent/specs/package-contract.md` defines API, profile, accessibility, symbol, colour, and test-matrix decisions.
- `.agent/specs/implementation-roadmap.md` defines package build order and review gates.
- `.agent/specs/adoption-roadmap.md` defines target repositories and rollout order.

## Gotchas

- Do not style machine-readable JSON.
- Do not rely on colour alone. Every severity needs text and a symbol.
- Keep CI output stable and grep-friendly.
- Respect `NO_COLOR`, `--no-colour`, `--no-color`, `--plain`, non-TTY stdout, and `TERM=dumb`.
- Progress bars must include numeric text.
- Tables must degrade into readable key/value blocks at narrow widths.
- `AGENT_CAPABILITIES.md` has not been generated yet. Generate it only after package scripts exist through the approved capability workflow.
