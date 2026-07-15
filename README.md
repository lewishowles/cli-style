# CLI style

Shared terminal output styles for local tools, diagnostics, agent-facing reports, and package CLIs.

Use it directly from JavaScript, or call the same renderers from Bash, Python, and Swift through the `cli-style` binary.

## Requirements

- Bun and Node.js 20 or newer for JavaScript projects and local binary builds
- The standalone `cli-style` binary for Bash, Python, or Swift projects that should not install Bun

## Install

JavaScript projects can install the package directly:

```bash
bun add @lewishowles/cli-style
```

Bash, Python, and Swift projects call the `cli-style` binary through thin adapters. If the project already has Node or Bun tooling, add this package as a dev dependency and use the package binary. Otherwise, install or vendor the standalone binary and put it on `PATH`:

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

All renderers return text. JavaScript imports functions directly. CLI, Bash, Python, and Swift integrations pass JSON-compatible data to a named renderer.

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

Direct Bash calls use `cli-style`'s native stdout detection. When a helper's output is captured, the adapter cannot know where the captured text will be written, so set `FORCE_COLOR=1` explicitly when the destination is an interactive terminal:

```bash
command="$(FORCE_COLOR=1 cli_style_span "npm run docs:readme" info)"
```

Python and Swift automatically set `FORCE_COLOR=1` for the child render process when their caller's stdout is an interactive terminal. An existing `FORCE_COLOR` or `NO_COLOR` value is preserved. `FORCE_COLOR=0` does not enable colour, while `NO_COLOR`, `TERM=dumb`, and explicit no-colour flags remain authoritative.

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

Add the adapter directory to `PYTHONPATH`, then import the generic `render()` helper or convenience functions:

```bash
export PYTHONPATH="$(cli-style adapter-path python):$PYTHONPATH"
```

```python
from cli_style import status, row, span, hint, divider

kwargs = {"binary": "./bin/cli-style.js", "plain": True}

print(status("success", "Build passed", "184 tests", **kwargs))
print(row("Workspace", "/path/to/project", **kwargs))
print(row("Bundle", "over budget", "failed", **kwargs))
command = span("npm run docs:readme", "info", **kwargs)
print(hint(f"Run {command} before release", **kwargs))
print(divider("Project setup", **kwargs))
```

Convenience functions build the renderer payload internally, so callers pass plain Python strings without hand-building JSON.

Pass `binary=` when `cli-style` is not on `PATH`. The generic `render()` helper remains for aggregate patterns or multi-item fields:

```python
from cli_style import render

output = render(
	"diagnostic-report",
	{
		"title": "Release checks",
		"checks": [{"name": "README", "result": "success"}],
	},
	profile="diagnostic",
)

print(output)
```

### Swift

Add the adapter file to your Swift project, then use the `CliStyle` enum for convenience functions or the generic `render` method:

```bash
cli-style adapter-path swift
# Returns the path to CliStyle.swift for inclusion in your project
```

```swift
let options = CliStyleOptions(binary: "./bin/cli-style.js", isPlain: true)

print(try CliStyle.status(type: "success", label: "Build passed", detail: "184 tests", options: options))
print(try CliStyle.row(label: "Workspace", value: "/path/to/project", options: options))
print(try CliStyle.row(label: "Bundle", value: "over budget", result: "failed", options: options))
let command = try CliStyle.span(value: "npm run docs:readme", tone: "info", options: options)
print(try CliStyle.hint(message: "Run " + command + " before release", options: options))
print(try CliStyle.divider(label: "Project setup", options: options))

print(try CliStyle.commandResult(result: "success", summary: "Build passed", command: "bun run test:unit", exitCode: 0, duration: "1.2s", detail: "184 tests", options: options))
print(try CliStyle.taskSummary(result: "partial", task: "Adopt cli-style", summary: "Wrappers added", completed: "Updated adapter", remaining: "Update scripts", options: options))
print(try CliStyle.confirmationResult(state: "confirmed", action: "Publish release", item: "v0.6.0", detail: "Tag push starts npm publish", options: options))
print(try CliStyle.nextStepBlock(nextStep: "Update helpers scripts", reason: "Wrappers are now available", command: "scripts/setup.sh --check", alternative: "", options: options))
```

Convenience functions build the renderer payload internally, so callers pass plain Swift strings without hand-building JSON.

Pass `binary:` in `CliStyleOptions` when `cli-style` is not on `PATH`. The generic `CliStyle.render(_:data:options:)` method remains for aggregate patterns or multi-item fields:

```swift
let output = try CliStyle.render(
    "diagnostic-report",
    data: [
        "title": "Release checks",
        "checks": [["name": "README", "result": "success"]],
    ],
    options: CliStyleOptions(profile: "diagnostic")
)

print(output)
```

## Available renderers

Renderer names are stable for `cli-style render`, `cli_style_render`, and Python `render()`. JavaScript uses camel-case function names.

| Renderer              | JavaScript                            | Bash helper                          | Python helper                      | Swift helper                           | Purpose                                                         |
| --------------------- | ------------------------------------- | ------------------------------------ | ---------------------------------- | -------------------------------------- | --------------------------------------------------------------- |
| `status`              | `status(resultType, detail, options)` | `cli_style_status type label detail` | `status(type, label, detail)`      | `CliStyle.status(type, label, detail)` | Result line with symbol, label, and detail.                     |
| `row`                 | `row(label, value, options)`          | `cli_style_row label value [result]` | `row(label, value, result)`        | `CliStyle.row(label, value, result)`   | Aligned label/value row, optionally marked with a result state. |
| `row-group`           | `rowGroup(options)`                   | Use `cli_style_render`               | Use `render("row-group", ...)`     | Use `CliStyle.render`                  | Auto-aligned group of labelled value rows.                      |
| `span`                | `span(value, tone, options)`          | `cli_style_span value [tone]`        | `span(value, tone)`                | `CliStyle.span(value, tone)`           | Inline colour or weight for a word, command, file, or value.    |
| `hint`                | `hint(message, options)`              | `cli_style_hint message`             | `hint(message)`                    | `CliStyle.hint(message)`               | Informational hint line.                                        |
| `divider`             | `divider(options)`                    | `cli_style_divider label`            | `divider(label)`                   | `CliStyle.divider(label)`              | Section divider with an optional label.                         |
| `command-result`      | `commandResult(options)`              | `cli_style_command_result ...`       | `command_result(...)`              | `CliStyle.commandResult(...)`          | Command execution outcome with exit code and duration.          |
| `audit-finding`       | `auditFinding(options)`               | `cli_style_audit_finding ...`        | `audit_finding(...)`               | `CliStyle.auditFinding(...)`           | Structured audit finding with evidence and recommendation.      |
| `task-summary`        | `taskSummary(options)`                | `cli_style_task_summary ...`         | `task_summary(...)`                | `CliStyle.taskSummary(...)`            | Task progress with completed and remaining items.               |
| `confirmation-result` | `confirmationResult(options)`         | `cli_style_confirmation_result ...`  | `confirmation_result(...)`         | `CliStyle.confirmationResult(...)`     | Confirmation outcome with action and item.                      |
| `next-step-block`     | `nextStepBlock(options)`              | `cli_style_next_step_block ...`      | `next_step_block(...)`             | `CliStyle.nextStepBlock(...)`          | Next-step guidance with command and alternative.                |
| `chip`                | `chip(label, tone, options)`          | Use `cli_style_render`               | Use `render("chip", ...)`          | Use `CliStyle.render`                  | Compact labelled state.                                         |
| `panel`               | `panel(options)`                      | Use `cli_style_render`               | Use `render("panel", ...)`         | Use `CliStyle.render`                  | Framed content block for grouped output.                        |
| `table`               | `table(options)`                      | Use `cli_style_render`               | Use `render("table", ...)`         | Use `CliStyle.render`                  | Tabular records with narrow-width fallback.                     |
| `progress-bar`        | `progressBar(options)`                | Use `cli_style_render`               | Use `render("progress-bar", ...)`  | Use `CliStyle.render`                  | Single progress value with numeric text.                        |
| `bar-chart`           | `barChart(options)`                   | Use `cli_style_render`               | Use `render("bar-chart", ...)`     | Use `CliStyle.render`                  | Multi-row bar chart.                                            |
| `step`                | `step(label, state, options)`         | Use `cli_style_render`               | Use `render("step", ...)`          | Use `CliStyle.render`                  | One workflow step.                                              |
| `step-progress`       | `stepProgress(options)`               | Use `cli_style_render`               | Use `render("step-progress", ...)` | Use `CliStyle.render`                  | Numbered workflow steps.                                        |
| `empty-state`         | `emptyState(title, detail, options)`  | Use `cli_style_render`               | Use `render("empty-state", ...)`   | Use `CliStyle.render`                  | Empty result message.                                           |
| `error-block`         | `errorBlock(title, lines, options)`   | Use `cli_style_render`               | Use `render("error-block", ...)`   | Use `CliStyle.render`                  | Structured error block.                                         |

Use `render("<renderer>", data, ...)` (Python) or `CliStyle.render(_:data:options:)` (Swift) for aggregate patterns (`diagnostic-report`, `agent-transcript`, `compact-data-table`) or any renderer with multi-item fields.

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

### `row-group`

```json
{
	"rows": [
		{
			"label": "Package",
			"value": "@lewishowles/components"
		},
		{
			"label": "Version",
			"value": "minor: 2.7.4 -> 2.8.0"
		}
	]
}
```

- `rows`: labelled values to align and render
- `labelWidth`: optional minimum width for every label
- Per-row fields match `row`, including `label`, `value`, `result`, `labelColour`, `valueColour`, and `separator`

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

Swift equivalents are available as `CliStyle.commandResult(...)`, `CliStyle.auditFinding(...)`, `CliStyle.taskSummary(...)`, `CliStyle.confirmationResult(...)`, and `CliStyle.nextStepBlock(...)`. Use `CliStyle.render` for aggregate reports, tables, transcripts, and multi-item arrays.

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

Use `createCliStyle()` to resolve these options from `argv`, `env`, `stdout`, CI, TTY, `NO_COLOR`, `FORCE_COLOR`, and terminal capability.

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

### Swift options

Swift options are passed via the `CliStyleOptions` struct:

| Property      | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `binary`      | Path or command name for the `cli-style` binary. |
| `profile`     | Render with a named profile.                     |
| `width`       | Override detected output width.                  |
| `isPlain`     | Disable colour and Unicode decoration.           |
| `isNoColour`  | Disable ANSI colour.                             |
| `isNoUnicode` | Use ASCII symbols.                               |
| `extraArgs`   | Extra CLI arguments to pass through.             |

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
