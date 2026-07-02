# CLI style

Shared terminal output styles for local tools, diagnostics, agent-facing reports, and package CLIs.

Use it directly from JavaScript, or call the same renderers from Bash and Python through the `cli-style` binary.

## Requirements

- Bun and Node.js 20 or newer for JavaScript projects and local binary builds
- The standalone `cli-style` binary for Bash or Python projects that should not install Bun

## Install

JavaScript projects can install the package directly:

```bash
bun add @lewishowles/cli-style
```

Bash and Python projects call the `cli-style` binary through thin adapters. If the project already has Node or Bun tooling, add this package as a dev dependency and use the package binary. Otherwise, install or vendor the standalone binary and put it on `PATH`:

```bash
export PATH="/path/to/cli-style/bin:$PATH"
```

Build a standalone binary when a repo should not need Bun at runtime:

```bash
bun run build:binary
bun run smoke:binary
```

Create a binary install tarball:

```bash
bun run package:binary
tar -tzf dist/release/cli-style-*.tar.gz
```

The package contains `bin/cli-style` and `adapters/`.

## Choose an integration

All renderers return text. JavaScript imports functions directly. CLI, Bash, and Python integrations pass JSON-compatible data to a named renderer.

### JavaScript

Create the `ui` instance at the CLI entrypoint, then pass `ui.options` to renderers. That keeps flag, environment, stream, colour, Unicode, and width detection in one place.

```js
import { createCliStyle, status } from "@lewishowles/cli-style";

const ui = createCliStyle({
	argv: process.argv.slice(2),
	env: process.env,
	stdout: process.stdout,
});

const output = status("success", "184 tests", {
	...ui.options,
	label: "Build passed",
});

ui.print(output);
```

Renderer methods return strings. `ui.print()`, `ui.write()`, and CLI commands handle stdout and stderr.

### CLI render

Use `cli-style render <renderer>` when a script needs rendered text from JSON input:

```bash
cli-style render status --profile diagnostic <<'JSON'
{
  "type": "success",
  "label": "Build passed",
  "detail": "184 tests"
}
JSON
```

Use renderer names from the tables below, for example `status`, `row`, `diagnostic-report`, or `task-summary`.

### Bash

Source the Bash adapter, then use convenience helpers for common primitive and per-script pattern renderers:

```bash
source "$(cli-style adapter-path bash)"

label='Build "passed"'
detail="/path/to/project"

cli_style_status success "$label" "$detail" --profile diagnostic
cli_style_row "Workspace" "$detail" --plain
cli_style_row "Bundle" "is 22.3 KB, above the 12.0 KB budget" failed --plain
command="$(cli_style_span "npm run docs:readme" info --plain)"
cli_style_hint "Run $command before release" --plain
cli_style_divider "Project setup" --plain

cli_style_command_result success "Build passed" "bun run test:unit" 0 "1.2s" "184 tests" --plain
cli_style_task_summary partial "Adopt cli-style" "Bash wrappers added" "Updated adapter" "Update scripts" --plain
cli_style_confirmation_result confirmed "Publish release" "v0.6.0" "Tag push starts npm publish" --plain
cli_style_next_step_block "Update helpers scripts" "Wrappers are now available" "scripts/setup.sh --check" "" --plain
```

The convenience functions build JSON internally, so callers do not need to escape quotes, backslashes, or paths by hand.

Set `CLI_STYLE_BIN` when `cli-style` is not on `PATH`:

```bash
CLI_STYLE_BIN="/path/to/cli-style" cli_style_status success "Build passed" "" --plain
```

Use `cli_style_render` for literal or prebuilt JSON, especially for aggregate patterns or multi-item pattern fields:

```bash
cli_style_render diagnostic-report --profile diagnostic <<'JSON'
{
  "title": "Release checks",
  "checks": [
    {
      "name": "README",
      "result": "success"
    }
  ]
}
JSON
```

### Python

Add the adapter directory to `PYTHONPATH`, then import the generic `render()` helper:

```bash
export PYTHONPATH="$(cli-style adapter-path python):$PYTHONPATH"
```

```python
from cli_style import render

output = render(
	"status",
	{
		"type": "success",
		"label": "Build passed",
		"detail": "184 tests",
	},
	profile="diagnostic",
)

print(output)
```

Pass `binary=` when `cli-style` is not on `PATH`:

```python
output = render(
	"status",
	{
		"type": "success",
		"label": "Build passed",
	},
	binary="/path/to/cli-style",
	plain=True,
)
```

## Available renderers

Renderer names are stable for `cli-style render`, `cli_style_render`, and Python `render()`. JavaScript uses camel-case function names.

| Renderer        | JavaScript                            | Bash helper                          | Purpose                                                         |
| --------------- | ------------------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| `status`        | `status(resultType, detail, options)` | `cli_style_status type label detail` | Result line with symbol, label, and detail.                     |
| `row`           | `row(label, value, options)`          | `cli_style_row label value [result]` | Aligned label/value row, optionally marked with a result state. |
| `span`          | `span(value, tone, options)`          | `cli_style_span value [tone]`        | Inline colour or weight for a word, command, file, or value.    |
| `hint`          | `hint(message, options)`              | `cli_style_hint message`             | Informational hint line.                                        |
| `divider`       | `divider(options)`                    | `cli_style_divider label`            | Section divider with an optional label.                         |
| `chip`          | `chip(label, tone, options)`          | Use `cli_style_render`               | Compact labelled state.                                         |
| `panel`         | `panel(options)`                      | Use `cli_style_render`               | Framed content block for grouped output.                        |
| `table`         | `table(options)`                      | Use `cli_style_render`               | Tabular records with narrow-width fallback.                     |
| `progress-bar`  | `progressBar(options)`                | Use `cli_style_render`               | Single progress value with numeric text.                        |
| `bar-chart`     | `barChart(options)`                   | Use `cli_style_render`               | Multi-row bar chart.                                            |
| `step`          | `step(label, state, options)`         | Use `cli_style_render`               | One workflow step.                                              |
| `step-progress` | `stepProgress(options)`               | Use `cli_style_render`               | Numbered workflow steps.                                        |
| `empty-state`   | `emptyState(title, detail, options)`  | Use `cli_style_render`               | Empty result message.                                           |
| `error-block`   | `errorBlock(title, lines, options)`   | Use `cli_style_render`               | Structured error block.                                         |

Python uses `render("<renderer>", data, ...)` for every renderer.

## Primitive data shapes

Use these shapes with `cli-style render`, `cli_style_render`, or Python `render()`. JavaScript callers pass the listed function arguments directly.

### `status`

```json
{
	"type": "success",
	"label": "Build passed",
	"detail": "184 tests"
}
```

- `type`: one of the result types listed below
- `label`: optional label override
- `detail`: optional text after the label

### `row`

```json
{
	"label": "Bundle",
	"value": "is 22.3 KB, above the 12.0 KB budget",
	"result": "failed",
	"labelWidth": 8
}
```

- `label`: left-hand label
- `value`: right-hand value
- `result`: optional result type for a symbol and tone
- `labelWidth`: optional minimum label width
- `labelColour`, `valueColour`, `separator`: optional presentation overrides

### `span`

```json
{
	"value": "npm run docs:readme",
	"tone": "info"
}
```

- `value`: inline text to emphasise
- `tone`: optional tone, defaulting to `info`
- `weight`: optional ANSI style, defaulting to `bold`

### `hint`

```json
{
	"message": "Run npm run docs:readme before release"
}
```

Pre-render a `span` when only part of the hint needs emphasis.

### Structured primitives

| Renderer        | Main fields                            |
| --------------- | -------------------------------------- |
| `divider`       | `label`, `dividerWidth`, `character`   |
| `chip`          | `label`, `tone`                        |
| `panel`         | `title`, `lines`, `tone`, `panelWidth` |
| `table`         | `columns`, `rows`, `width`             |
| `progress-bar`  | `value`, `max`, `barWidth`, `tone`     |
| `bar-chart`     | `rows`, `barWidth`                     |
| `step`          | `label`, `state`                       |
| `step-progress` | `steps`, `current`                     |
| `empty-state`   | `title`, `detail`                      |
| `error-block`   | `title`, `lines`                       |

For visual examples, run `cli-style gallery --section primitives`.

## Patterns

Patterns are built-in composite renderers for common report shapes. They use the same lower-level primitives internally, but accept structured objects so callers do not need to assemble panels, statuses, tables, and rows by hand.

| Renderer              | JavaScript                                  | Purpose                               | Main fields                                                                          |
| --------------------- | ------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `diagnostic-report`   | `diagnosticReport(report, options)`         | Aggregate check report.               | `title`, `checks`, `findings`, `skippedChecks`, `nextActions`                        |
| `command-result`      | `commandResult(result, options)`            | Single command outcome with metadata. | `title`, `result`, `summary`, `command`, `exitCode`, `duration`, `details`           |
| `audit-finding`       | `auditFinding(finding, options)`            | Single audit finding.                 | `title`, `result`, `finding`, `location`, `evidence`, `recommendation`, `references` |
| `task-summary`        | `taskSummary(summary, options)`             | Completed and remaining task summary. | `title`, `task`, `result`, `summary`, `completed`, `remaining`                       |
| `agent-transcript`    | `agentTranscript(transcript, options)`      | User, agent, and tool transcript.     | `title`, `entries`                                                                   |
| `confirmation-result` | `confirmationResult(confirmation, options)` | Confirmation outcome with detail.     | `title`, `state`, `action`, `item`, `detail`                                         |
| `next-step-block`     | `nextStepBlock(nextStep, options)`          | Next-step guidance.                   | `title`, `next`, `reason`, `commands`, `alternatives`                                |
| `compact-data-table`  | `compactDataTable(data, options)`           | Titled compact data table.            | `title`, `summary`, `columns`, `rows`                                                |

For visual examples, run `cli-style gallery --section patterns`.

The Bash adapter also exposes scalar convenience wrappers for per-script usage:

| Bash helper                     | Renderer              | Arguments before render flags                                              |
| ------------------------------- | --------------------- | -------------------------------------------------------------------------- |
| `cli_style_command_result`      | `command-result`      | `result`, `summary`, `command`, `exit_code`, `duration`, `detail`          |
| `cli_style_audit_finding`       | `audit-finding`       | `result`, `finding`, `location`, `recommendation`, `evidence`, `reference` |
| `cli_style_task_summary`        | `task-summary`        | `result`, `task`, `summary`, `completed`, `remaining`                      |
| `cli_style_confirmation_result` | `confirmation-result` | `state`, `action`, `item`, `detail`                                        |
| `cli_style_next_step_block`     | `next-step-block`     | `next`, `reason`, `command`, `alternative`                                 |

Pass an empty string for optional positional fields you want to skip. Use `cli_style_render` or `cli_style_render_json` for aggregate reports, tables, transcripts, and multi-item arrays.

### Pattern example

JavaScript:

```js
import { createCliStyle, diagnosticReport } from "@lewishowles/cli-style";

const ui = createCliStyle({
	argv: process.argv.slice(2),
	env: process.env,
	stdout: process.stdout,
});

const output = diagnosticReport(
	{
		title: "Release checks",
		checks: [
			{
				name: "README",
				result: "success",
			},
			{
				detail: "object-BmsQavd_.js over budget",
				name: "Package size",
				result: "failed",
			},
		],
		findings: [
			{
				message: "dist/object-BmsQavd_.js is 22.3 KB, above the 12.0 KB budget",
				result: "failed",
			},
		],
		nextActions: ["Reduce package size, or raise the budget with a release-note-worthy reason."],
	},
	ui.options,
);

ui.print(output);
```

CLI:

```bash
cli-style render diagnostic-report --profile diagnostic <<'JSON'
{
  "title": "Release checks",
  "checks": [
    {
      "name": "README",
      "result": "success"
    },
    {
      "name": "Package size",
      "result": "failed",
      "detail": "object-BmsQavd_.js over budget"
    }
  ],
  "findings": [
    {
      "result": "failed",
      "message": "dist/object-BmsQavd_.js is 22.3 KB, above the 12.0 KB budget"
    }
  ],
  "nextActions": [
    "Reduce package size, or raise the budget with a release-note-worthy reason."
  ]
}
JSON
```

Python:

```python
from cli_style import render

output = render(
	"diagnostic-report",
	{
		"title": "Release checks",
		"checks": [
			{
				"name": "README",
				"result": "success",
			},
			{
				"name": "Package size",
				"result": "failed",
				"detail": "object-BmsQavd_.js over budget",
			},
		],
		"findings": [
			{
				"result": "failed",
				"message": "dist/object-BmsQavd_.js is 22.3 KB, above the 12.0 KB budget",
			},
		],
		"nextActions": [
			"Reduce package size, or raise the budget with a release-note-worthy reason.",
		],
	},
	profile="diagnostic",
)
```

## Reporter

Use a reporter when a JavaScript script needs grouped output built over time.

```js
import { createReporter } from "@lewishowles/cli-style";

const reporter = createReporter({
	colour: false,
});

reporter.divider("Project setup", "Claude + Codex");
reporter.group(
	"Agent scripts",
	[
		{
			label: "project-diagnostics.py",
			result: "unchanged",
		},
		{
			label: "repo-context.py",
			result: "unchanged",
		},
	],
	{
		summary: "2 already linked",
	},
);
reporter.status("success", "Done.");

console.log(reporter.render());
```

Use `reporter.divider()` for major phases. Use `reporter.section()` for a normal `info` status row inside a phase. Panels are for framed content blocks, not headings.

Groups can include verbose detail rows when a caller opts in:

```js
const reporter = createReporter({
	verbose: process.env.AGENTS_VERBOSE === "1",
});
```

## Options and flags

### JavaScript options

Most renderers accept the same output options:

| Option    | Purpose                                                                   |
| --------- | ------------------------------------------------------------------------- |
| `profile` | Output profile: `human`, `agent`, `diagnostic`, `ci`, `plain`, or `json`. |
| `colour`  | Whether ANSI colour should be applied.                                    |
| `unicode` | Whether Unicode symbols should be used.                                   |
| `width`   | Available output width for renderers that adapt layout.                   |

Use `createCliStyle()` to resolve these options from `argv`, `env`, `stdout`, CI, TTY, `NO_COLOR`, and terminal capability.

### CLI and Bash flags

| Flag                         | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `--profile <name>`           | Render with a named profile.           |
| `--plain`                    | Disable colour and Unicode decoration. |
| `--no-colour` / `--no-color` | Disable ANSI colour.                   |
| `--no-unicode`               | Use ASCII symbols.                     |
| `--width <columns>`          | Override detected output width.        |

`cli-style render` rejects `--json`. JSON profile behaviour is for library calls and machine-readable commands.

### Python options

| Argument     | Purpose                                          |
| ------------ | ------------------------------------------------ |
| `profile`    | Render with a named profile.                     |
| `width`      | Override detected output width.                  |
| `plain`      | Disable colour and Unicode decoration.           |
| `no_colour`  | Disable ANSI colour.                             |
| `no_unicode` | Use ASCII symbols.                               |
| `binary`     | Path or command name for the `cli-style` binary. |
| `extra_args` | Extra CLI arguments to pass through.             |

## Profiles

| Profile      | Behaviour                                                                         |
| ------------ | --------------------------------------------------------------------------------- |
| `human`      | Colour and Unicode when supported; compact but visually pleasant.                 |
| `agent`      | Markdown-like, structured, easy to quote or parse.                                |
| `diagnostic` | Optimised for check summaries, findings, skipped checks, and next actions.        |
| `ci`         | Stable, grep-friendly, no decorative panels; colour off unless explicitly forced. |
| `plain`      | No ANSI, no Unicode dependency, simple text layout.                               |
| `json`       | Machine-readable only; library calls return structured data unchanged.            |

## Result types and tones

Result types drive symbols, labels, priority, and semantic colour:

| Result      | Label     | Unicode | ASCII | Tone      |
| ----------- | --------- | ------- | ----- | --------- |
| `success`   | Success   | `✓`     | `OK`  | `success` |
| `info`      | Info      | `→`     | `>`   | `info`    |
| `warning`   | Warning   | `⚠`     | `!`   | `warning` |
| `partial`   | Partial   | `◐`     | `!`   | `warning` |
| `unchanged` | Unchanged | `↪`     | `-`   | `muted`   |
| `skipped`   | Skipped   | `–`     | `-`   | `muted`   |
| `unknown`   | Unknown   | `?`     | `?`   | `muted`   |
| `failed`    | Failed    | `×`     | `x`   | `danger`  |

Tone values used by public APIs include `info`, `success`, `warning`, `danger`, and `muted`.

## Gallery

Use the gallery to review current renderer output:

```bash
cli-style gallery
cli-style gallery no-colour
cli-style gallery --section primitives
cli-style gallery --section patterns
cli-style gallery --fixture audit-finding
cli-style gallery --profile agent
cli-style gallery --width 64
cli-style gallery --variants
```

Use `--interactive` to select a section or fixture with `fzf` when it is installed.
