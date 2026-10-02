# lewishowles-cli-style

`lewishowles-cli-style` is a Python adapter for the shared `cli-style` command-line renderer. It lets Python programs use the same terminal output styles as the JavaScript package.

## Install

```sh
python -m pip install lewishowles-cli-style
```

The package supports Python 3.9 and later. The installed distribution is named `lewishowles-cli-style`, and you import it as `cli_style`.

Rendering happens in the separate `cli-style` binary, so that needs to be on your `PATH`. The [main readme](https://github.com/lewishowles/cli-style#install) covers the ways to install it.

## Usage

```python
from cli_style import render

print(render("status", {"type": "success", "label": "Build passed"}))
```

If the `cli-style` binary is not available, `render()` returns sorted plain `key: value` text by default. Pass `raise_on_missing=True` to raise `CliStyleNotFoundError` instead.

Use `row()` for one labelled value or `row_group()` to align several values. Both accept `wrap=False` to keep values on one line and `wrap_width` to set the width used when wrapping. `row_group()` also accepts `label_colour`, `value_colour`, and `separator` as defaults for its rows:

```python
from cli_style import row_group

print(row_group(
    [{"label": "Command", "value": "python -m pip install lewishowles-cli-style"}],
    wrap=False,
    label_colour="muted",
))
```

Each row has `label`, `value`, and an optional `result`. It can override the group defaults with `label_colour`, `value_colour`, `separator`, `wrap`, or `wrap_width`. The JavaScript spellings, such as `labelColour` and `wrapWidth`, also work in row dictionaries. Callers add any blank lines around rendered blocks. Python `render()` removes trailing newlines from rendered strings.

## More information

- [Repository](https://github.com/lewishowles/cli-style)
- [Issue tracker](https://github.com/lewishowles/cli-style/issues)
- [MIT licence](https://github.com/lewishowles/cli-style/blob/main/LICENSE)
