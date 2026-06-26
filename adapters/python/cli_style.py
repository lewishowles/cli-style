#!/usr/bin/env python3
# Render caller data through the shared cli-style binary.

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any, Sequence


class CliStyleError(RuntimeError):
	"""Base error for cli-style adapter failures."""


class CliStyleNotFoundError(CliStyleError):
	"""Raised when the cli-style binary cannot be found."""


class CliStyleRenderError(CliStyleError):
	"""Raised when cli-style rejects a render request."""


# Render caller data through `cli-style render`.
#
# @param  {str}  renderer
#     Stable renderer name accepted by `cli-style render`.
# @param  {dict}  data
#     JSON-serialisable renderer input.
def render(
	renderer: str,
	data: dict[str, Any],
	*,
	binary: str = "cli-style",
	profile: str | None = None,
	width: int | None = None,
	plain: bool = False,
	no_colour: bool = False,
	no_unicode: bool = False,
	extra_args: Sequence[str] | None = None,
) -> str:
	if not isinstance(renderer, str) or renderer == "":
		raise ValueError("renderer must be a non-empty string")

	if not isinstance(data, dict):
		raise TypeError("data must be a dict")

	resolved_binary = resolve_binary(binary)
	command = [resolved_binary, "render", renderer]

	if profile is not None:
		command.extend(["--profile", profile])

	if width is not None:
		command.extend(["--width", str(width)])

	if plain:
		command.append("--plain")

	if no_colour:
		command.append("--no-colour")

	if no_unicode:
		command.append("--no-unicode")

	if extra_args is not None:
		command.extend(extra_args)

	result = subprocess.run(
		command,
		capture_output=True,
		check=False,
		input=json.dumps(data),
		text=True,
	)

	if result.returncode != 0:
		message = result.stderr.strip() or f"cli-style render failed with exit code {result.returncode}"
		raise CliStyleRenderError(message)

	return result.stdout.rstrip("\n")


# Resolve a command name or executable path for subprocess use.
#
# @param  {str}  binary
#     Binary path or command name.
def resolve_binary(binary: str) -> str:
	if "/" in binary:
		path = Path(binary)

		if path.is_file() and os.access(path, os.X_OK):
			return str(path)

		raise CliStyleNotFoundError(f"cli-style binary not found: {binary}")

	resolved = shutil.which(binary)

	if resolved is None:
		raise CliStyleNotFoundError(f"cli-style binary not found: {binary}")

	return resolved
