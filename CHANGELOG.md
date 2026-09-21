# Changelog

## Unreleased

## 0.16.0 - 2026-09-21

### Breaking changes

- BREAKING: Removed the `panelWidth` option from `panel()` and the `panel` renderer. Use `width` instead.
- BREAKING: Panels now honour the requested total `width`, raise widths below 6 to the minimum usable width, and wrap long lines to fit.

### Fixed

- An explicit JSON `width` now takes precedence over the terminal width for width-aware renderers, so piped output stays within the caller's requested bounds.

## 0.15.0 - 2026-09-20

### Added

- The Python adapter is published to PyPI as `lewishowles-cli-style`, so Python projects can install it with `pip install lewishowles-cli-style` instead of from a local path or this repository. The name it is imported under is unchanged: `import cli_style`.
- `bun run check:adapters` now fails when `package.json` and the Python package declare different versions, or when the Python package's copy of the licence differs from the one at the repository root.
- Releasing a tag whose version does not match `package.json` now fails before anything is published.

## 0.14.0 - 2026-09-20

### Added

- Added a `bulletList()` renderer (`bullet-list` for `cli-style render`) for simple bulleted lists. Section lists in the patterns layer now render through it, with unchanged output.
- Added a `bullet_list` wrapper to the Python adapter.
- The renderer catalogue now describes each renderer's parameters with their types, and the full input contract each renderer accepts, so adapters and agents can work out how to call a renderer without reading the source.
- The Python adapter's wrappers are now generated from the renderer catalogue, so they stay in step with the renderers they wrap.
- The Swift adapter now ships as a Swift package with generated wrappers, exposing a `CliStyle` product.
- The Bash, Python, and Swift adapters now fall back to plain text when the `cli-style` binary is not on `PATH`, instead of failing.
- `bun run check:adapters` now fails when the generated adapter wrappers are out of date with the renderer catalogue.

### Fixed

- The published package now includes the Python and Swift adapter packages, which were missing from the build.

## 0.13.0 - 2026-09-05

### Added

- Added Python `table()` and `row_group()` wrapper functions to the Python adapter, matching the existing shell/JS renderers.
- `table()` columns can now set `maxWidth` and `overflow` (`'truncate'`, the default, or `'wrap'`) to cap a column's width and control how long values render within it.

## 0.12.1 - 2026-08-20

### Fixed

- Fixed `row()` (and `rowGroup()`) wrapping long values one character per line when a long label left very little room for the value. Values now print unwrapped when the available width is too small to wrap usefully; an explicit `wrapWidth` still overrides the fallback.

## 0.12.0 - 2026-08-20

### Added

- Added `labelledLine(label, message, options)`, a general icon/label/message renderer with a configurable tone. `hint()` now delegates to it instead of duplicating its own rendering, with unchanged output for existing callers.
- `row()` now wraps long values within the available row width (64 columns by default), instead of overflowing the line. Override with `wrapWidth`, or disable with `wrap: false`.

## 0.11.0 - 2026-07-24

### Added

- Added a spinner/loading indicator for long-running JavaScript tasks: `ui.spinner.run(text, fn)` wraps a single async call, and `ui.spinner(text)` returns a handle (`update`, `succeed`, `fail`, `stop`) for cases that don't fit one call. Output always goes to stderr, animates only on an interactive terminal, and falls back to a static start/result line under CI, plain, JSON, or agent profiles. JavaScript-only; not available through the Bash, Python, or Swift adapters.

## 0.10.0 - 2026-07-20

### Added

- Added light and dark ANSI-256 colour palettes with automatic theme detection (explicit flag/option, `COLORFGBG`, then a `COLORTERM`/`TERM_PROGRAM` best-effort signal, falling back to dark).
- Added `cli-style list` and `cli-style describe` for static renderer catalogue discovery.
- Added a `sparkline()` renderer (`sparkline` for `cli-style render`) for compact trend display with latest, minimum, and maximum values.
- Added a `diffBlock()` renderer (`diff-block` for `cli-style render`) for structured added/removed/context/header diff presentation.

### Fixed

- Fixed panel body text losing legibility against its background fill in some theme/terminal combinations by giving panels their own explicit theme-matched text colour instead of relying on the terminal-inherited default.

## 0.9.0 - 2026-07-16

### Added

- Added a `rowGroup` primitive (`rowGroup()` in JS, the `row-group` renderer for `cli-style render`, and the same generic `render()`/`cli_style_render`/`CliStyle.render` entry points in Python, Bash, and Swift) that aligns a group of related rows automatically, without the caller computing `labelWidth` by hand.

### Fixed

- Fixed the Python, Bash, and Swift adapters silently dropping `row()`, `span()`, and `divider()` options beyond their two or three main fields. `row()` now forwards `labelWidth`, `labelColour`, `valueColour`, and `separator`; `span()` forwards `weight`; `divider()` forwards `dividerWidth`, `dividerColour`, and `labelColour`.

## 0.8.1 - 2026-07-15

### Fixed

- Fixed the Python and Swift adapters losing ANSI colour: they now set `FORCE_COLOR=1` for the child process when the caller's own stdout is a TTY, unless the caller has already set `FORCE_COLOR` or `NO_COLOR`.
- Documented that captured Bash output (command substitution) cannot auto-detect its eventual destination and requires an explicit `FORCE_COLOR=1` to opt into colour.

## 0.8.0 - 2026-07-05

### Added

- Added Swift adapter with convenience functions for scalar primitives and per-script patterns: `CliStyle.status`, `CliStyle.row`, `CliStyle.span`, `CliStyle.hint`, `CliStyle.divider`, `CliStyle.commandResult`, `CliStyle.auditFinding`, `CliStyle.taskSummary`, `CliStyle.confirmationResult`, and `CliStyle.nextStepBlock`.
- Added `cli-style adapter-path swift` support for discovering the Swift adapter file path.

### Changed

- Extended the README renderer table with a Swift helper column covering all 20 renderers.

## 0.7.0 - 2026-07-05

### Added

- Added Python adapter convenience functions for scalar pattern usage: `command_result`, `audit_finding`, `task_summary`, `confirmation_result`, and `next_step_block`.
- Added Python adapter convenience functions for common primitives: `status`, `row`, `span`, `hint`, and `divider`.
- Added Bash adapter convenience functions for scalar pattern usage: `cli_style_command_result`, `cli_style_audit_finding`, `cli_style_task_summary`, `cli_style_confirmation_result`, and `cli_style_next_step_block`.
- Added Bash adapter helpers for JSON string arrays and integer/null fields, so pattern wrappers can safely pass single-item list fields and exit codes.

### Changed

- Extended the README renderer table with a Python helper column covering all 20 renderers, including convenience functions and `render()` fallbacks for aggregate patterns.

## 0.6.0 - 2026-07-03

### Added

- Added result-state support to `row()` and `cli_style_row`, so label/value rows can render failed, warning, success, or other status cues while keeping column alignment.
- Added the `span()` inline emphasis primitive and `cli_style_span` Bash helper for highlighting commands, files, or values inside existing line renderers such as `hint()`.
- Added `span` support to `cli-style render` and the public JavaScript export.

### Changed

- Reworked the README around integration paths, available renderers, primitive data shapes, patterns, options, profiles, result types, and gallery commands.

## 0.5.0 - 2026-07-02

### Added

- Added Bash adapter convenience functions for common renderers: `cli_style_status`, `cli_style_row`, `cli_style_divider`, and `cli_style_hint`.
- Added Bash adapter escaping for dynamic string values, so scripts can pass quotes, backslashes, paths, and messages without hand-building JSON.
- Added README examples for JS CLI entrypoint wiring with `createCliStyle({ argv, env, stdout })` and helper-first Bash adapter usage.

### Changed

- Lightened the muted colour token so secondary text stays readable on dark surfaces.

## 0.4.1 - 2026-07-01

### Fixed

- Updated grouped reporter summaries so skipped rows outrank success rows while warnings and failures still take precedence.
- Added the project-local vite-plus pre-commit hook setup so commits run the existing staged checks.

## 0.4.0 - 2026-06-30

### Added

- Added `reporter.divider()` for compact phase headings in grouped CLI output.
- Added `renderReporterDivider()` for rendering reporter phase dividers without a reporter instance.

### Changed

- Updated reporter docs and gallery examples to use dividers for major phases and reserve panels for framed content blocks.

## 0.3.0 - 2026-06-29

### Added

- Added `createReporter()` for grouped setup and diagnostics output.
- Added `severityOrder` and `getHighestSeverityResult()` for group result summaries.
- Added shared `normaliseWidth()` helpers for width-aware renderers.
- Added reporter output to the style gallery.

### Changed

- Darkened the muted colour token so unchanged rows are easier to distinguish from normal foreground text.

## 0.2.2 - 2026-06-29

### Added

- Added an `unchanged` status result type for muted no-op rows.

## 0.2.1 - 2026-06-29

### Added

- Added an `info` status result type for neutral progress rows.

## 0.2.0 - 2026-06-27

### Added

- Added standalone binary packaging with `bun run package:binary`.
- Added release tarballs containing `bin/cli-style` and Bash/Python adapters.
- Added tagged GitHub release workflow for npm trusted publishing and binary assets.
- Added `cli-style adapter-path bash|python` for adapter discovery.

### Changed

- Configured package publishing for public npm.
- Documented binary install flow for non-JS projects.
