# CLI style

Shared terminal output styles for tools, diagnostics, and package CLIs.

## Requirements

- Bun
- Node.js 20 or newer

## Install

JavaScript projects can install the package directly:

```bash
bun add @lewishowles/cli-style
```

Bash and Python projects still need the package available somewhere, because their adapters call the `cli-style` binary. If the project already has Node or Bun tooling, add it as a dev dependency. Otherwise, link or vendor this package in a stable tools directory and point the adapters at that copy:

```bash
export CLI_STYLE_BIN="/path/to/cli-style/bin/cli-style.js"
export PYTHONPATH="/path/to/cli-style/adapters/python:$PYTHONPATH"
```

## JavaScript

```js
import { createCliStyle, status } from "@lewishowles/cli-style";

const ui = createCliStyle({
	profile: "human",
	width: 80,
});

const output = status("success", "184 tests", {
	...ui.options,
	label: "Build passed",
});

ui.print(output);
```

Renderer methods return strings. `ui.print()`, `ui.write()`, and CLI commands handle stdout and stderr.

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

## Bash

```bash
source /path/to/node_modules/@lewishowles/cli-style/adapters/bash/cli-style.sh

cli_style_render status --profile diagnostic <<'JSON'
{
  "type": "success",
  "label": "Build passed",
  "detail": "184 tests"
}
JSON
```

Set `CLI_STYLE_BIN` when `cli-style` is not on `PATH`:

```bash
CLI_STYLE_BIN="/path/to/cli-style" cli_style_render status --plain <<'JSON'
{
  "type": "success",
  "label": "Build passed"
}
JSON
```

## Python

Add `/path/to/node_modules/@lewishowles/cli-style/adapters/python` to `PYTHONPATH`, then import the helper:

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
