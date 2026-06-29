# Changelog

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
