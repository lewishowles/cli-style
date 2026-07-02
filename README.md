# CLI style

Shared terminal output styles for tools, diagnostics, and package CLIs.

## Requirements

- Bun and Node.js 20 or newer for JavaScript projects and local binary builds
- The standalone binary for Bash or Python projects that should not install Bun

## Install

JavaScript projects can install the package directly:

```bash
bun add @lewishowles/cli-style
```

Bash and Python projects call the `cli-style` binary through thin adapters. If the project already has Node or Bun tooling, add this package as a dev dependency and use the package binary. Otherwise, install or vendor the standalone binary and put it on `PATH`:

```bash
export PATH="/path/to/cli-style/bin:$PATH"
```

## JavaScript

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

Create the `ui` instance at the CLI entrypoint, then pass it to command handlers. That keeps flag, environment, stream, colour, Unicode, and width detection in one place.

## Reporter

Use a reporter when a script needs grouped output rather than one row per file.

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

Use `reporter.divider()` for major phases. Use `reporter.section()` when you want a normal `info` status row inside a phase. Panels are for framed content blocks, not headings.

Groups can include verbose detail rows when a caller opts in:

```js
const reporter = createReporter({
	verbose: process.env.AGENTS_VERBOSE === "1",
});
```

## CLI

Use `cli-style render <renderer>` when a script needs rendered text from JSON input.

```bash
cli-style render status --profile diagnostic <<'JSON'
{
  "type": "success",
  "label": "Build passed",
  "detail": "184 tests"
}
JSON
```

```bash
cli-style render task-summary --plain <<'JSON'
{
  "title": "Task summary",
  "completed": ["Added render command"],
  "remaining": ["Add adapters"]
}
JSON
```

`render` supports `--profile`, `--plain`, `--no-colour`, `--no-color`, `--no-unicode`, and `--width`. It rejects `--json`; JSON profile behaviour is for library calls and machine-readable commands.

Build a local standalone binary when a repo should not need Bun at runtime:

```bash
bun run build:binary
bun run smoke:binary
```

Create a binary install tarball:

```bash
bun run package:binary
tar -tzf dist/release/cli-style-*.tar.gz
```

The package contains `bin/cli-style` and `adapters/`. Install it into a repo-local tools directory, then call that repo-local `bin/cli-style` from scripts.

## Bash

```bash
source "$(cli-style adapter-path bash)"

label='Build "passed"'
detail="/path/to/project"

cli_style_status success "$label" "$detail" --profile diagnostic
cli_style_row "Workspace" "$detail" --plain
cli_style_row "Bundle" "is 22.3 KB, above the 12.0 KB budget" failed --plain
cli_style_hint "Run \"check\" before release" --plain
cli_style_divider "Project setup" --plain
```

Use the convenience functions for dynamic Bash values. They build JSON internally, so callers do not need to escape quotes, backslashes, or paths by hand.

`cli_style_status` accepts `type`, `label`, `detail`, then render flags. Pass an empty detail when you only need a label:

```bash
cli_style_status success "Done" "" --plain
```

`cli_style_row` accepts `label`, `value`, an optional result type, then render flags. Use the result when a row should keep its label/value alignment but render as a status:

```bash
cli_style_row "dist/object-BmsQavd_.js" "is 22.3 KB, above the 12.0 KB budget" failed --plain
```

Set `CLI_STYLE_BIN` when `cli-style` is not on `PATH`:

```bash
CLI_STYLE_BIN="/path/to/cli-style" cli_style_status success "Build passed" "" --plain
```

Keep `cli_style_render` for literal or prebuilt JSON:

```bash
cli_style_render status --plain <<'JSON'
{
  "type": "success",
  "label": "Build passed"
}
JSON
```

## Python

Add the adapter directory to `PYTHONPATH`, then import the helper:

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

## Profiles

| Profile      | Behaviour                                                                         |
| ------------ | --------------------------------------------------------------------------------- |
| `human`      | Colour and Unicode when supported; compact but visually pleasant.                 |
| `agent`      | Markdown-like, structured, easy to quote or parse.                                |
| `diagnostic` | Optimised for check summaries, findings, skipped checks, and next actions.        |
| `ci`         | Stable, grep-friendly, no decorative panels; colour off unless explicitly forced. |
| `plain`      | No ANSI, no Unicode dependency, simple text layout.                               |
| `json`       | Machine-readable only; library calls return structured data unchanged.            |

## Gallery

```bash
cli-style gallery
cli-style gallery no-colour
cli-style gallery --section patterns
cli-style gallery --fixture audit-finding
cli-style gallery --profile agent
cli-style gallery --width 64
cli-style gallery --variants
```

Use the gallery to review current renderer output. Use `--interactive` to select a section or fixture with `fzf` when it is installed.
