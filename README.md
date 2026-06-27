# CLI style

Shared terminal output styles for tools, diagnostics, and package CLIs.

This package is ready for first internal adoption. Start with low-risk, noisy command output before replacing user-facing package CLIs.

## Requirements

- Bun
- Node.js 20 or newer

## Getting started

```bash
bun install
bun test
bun run cli-style:gallery
```

## Usage

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

Renderer methods should return strings. `ui.print()`, `ui.write()`, and CLI commands handle stdout and stderr.

## Custom rendering

Use `cli-style render <renderer>` when shell, Python, or other non-JavaScript callers need the shared renderer implementation. The command reads one JSON object from stdin and writes rendered text to stdout.

```bash
bun ./bin/cli-style.js render status --profile diagnostic <<'JSON'
{
  "type": "success",
  "label": "Build passed",
  "detail": "184 tests"
}
JSON
```

```bash
bun ./bin/cli-style.js render task-summary --plain <<'JSON'
{
  "title": "Task summary",
  "completed": ["Added render command"],
  "remaining": ["Add adapters"]
}
JSON
```

`render` supports the same text output flags as the gallery, including `--profile`, `--plain`, `--no-colour`, `--no-color`, `--no-unicode`, and `--width`. It rejects `--json` because this command is for text rendering from caller-provided JSON.

## Adapters

Bash callers can source the adapter and pass JSON through stdin:

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

Python callers can import the adapter and pass a dictionary:

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

Set `CLI_STYLE_BIN` in Bash or pass `binary=` in Python when `cli-style` is not on `PATH`. The adapters call `cli-style render`; they do not duplicate renderer logic.

## Profiles

| Profile      | Behaviour                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------ |
| `human`      | Colour and Unicode when supported; compact but visually pleasant.                          |
| `agent`      | Markdown-like, structured, easy to quote or parse.                                         |
| `diagnostic` | Optimised for check summaries, findings, skipped checks, and next actions.                 |
| `ci`         | Stable, grep-friendly, no decorative panels; colour off unless explicitly forced.          |
| `plain`      | No ANSI, no Unicode dependency, simple text layout.                                        |
| `json`       | Machine-readable only; library calls return structured data and CLI commands serialise it. |

## Gallery

```bash
bun run cli-style:gallery
bun ./bin/cli-style.js gallery no-colour
bun ./bin/cli-style.js gallery --section patterns
bun ./bin/cli-style.js gallery --fixture audit-finding
bun ./bin/cli-style.js gallery --profile agent
bun ./bin/cli-style.js gallery --width 64
bun ./bin/cli-style.js gallery --variants
bun examples/gallery.mjs
bun examples/diagnostic.mjs
bash examples/diagnostic.sh
python3 examples/diagnostic.py
```

The gallery is read-only and shows the current terminal variant by default. Use `--profile` and `--width` for deterministic focused review. Use `--interactive` to select a section or fixture with `fzf` when it is installed; otherwise the current-terminal gallery is shown.

`examples/gallery.mjs` renders fixed-width, no-colour, no-Unicode variants for repeatable manual review.

## Release

The initial release version is `0.1.0`. Publish to GitHub Packages manually after CI passes:

```bash
bun install --frozen-lockfile
.agent/scripts/project-diagnostics.py --check test:unit
bun publish
```

Do not publish styled JSON-only machine output. First adoption target is `Configuration/Agents`, where setup and diagnostics commands print useful but non-critical output.
