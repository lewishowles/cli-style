# CLI style

Shared terminal output styles for tools, diagnostics, and package CLIs.

The package is internal-first while the API and gallery settle. Do not adopt it in other repositories until the gallery has been reviewed.

## Requirements

- Bun
- Node.js 20 or newer

## Getting started

```bash
bun test
bun run cli-style:gallery
```

## Usage

```js
import { createCliStyle, renderGallery } from "@lewishowles/cli-style";

const ui = createCliStyle({
	profile: "human",
	width: 80,
});

const output = renderGallery();
ui.print(output);
```

Renderer methods should return strings. `ui.print()`, `ui.write()`, and CLI commands handle stdout and stderr.

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
bun ./bin/cli-style.js gallery --matrix
```

The gallery is read-only and shows the current terminal variant by default. Use `--profile` and `--width` for deterministic focused review. Use `--interactive` to select a section or fixture with `fzf` when it is installed; otherwise the current-terminal gallery is shown.
