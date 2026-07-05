# Changelog

## Unreleased

### Added

- Added Swift adapter with convenience functions for scalar primitives and per-script patterns: `CliStyle.status`, `CliStyle.row`, `CliStyle.span`, `CliStyle.hint`, `CliStyle.divider`, `CliStyle.commandResult`, `CliStyle.auditFinding`, `CliStyle.taskSummary`, `CliStyle.confirmationResult`, and `CliStyle.nextStepBlock`.
- Added `cli-style adapter-path swift` support for discovering the Swift adapter file path.

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
