"""Run the shared cli-style binary from Python."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any, Sequence


class CliStyleError(RuntimeError):
	"""Base error for cli-style adapter failures."""


class CliStyleNotFoundError(CliStyleError):
	"""Raised when the cli-style binary cannot be found."""


class CliStyleRenderError(CliStyleError):
	"""Raised when cli-style rejects a render request."""


def resolve_subprocess_environment() -> dict[str, str]:
	"""Resolve the child environment while preserving caller controls."""
	environment = os.environ.copy()

	if (
		sys.stdout.isatty()
		and "FORCE_COLOR" not in environment
		and "NO_COLOR" not in environment
	):
		environment["FORCE_COLOR"] = "1"

	return environment


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
	raise_on_missing: bool = False,
) -> str:
	"""Render JSON-serialisable data through ``cli-style render``.

	When the binary cannot be found, return a plain-text rendering of the data
	instead, unless ``raise_on_missing`` is set.

	:param renderer: Stable renderer name accepted by the cli-style binary.
	:param data: JSON-serialisable renderer input.
	:param binary: Binary path or command name.
	:param profile: Optional output profile.
	:param width: Optional terminal width.
	:param plain: Disable terminal colour and Unicode output.
	:param no_colour: Disable terminal colour output.
	:param no_unicode: Disable Unicode output.
	:param extra_args: Additional flags passed to the binary.
	:param raise_on_missing: Raise ``CliStyleNotFoundError`` when the binary
		cannot be found, instead of returning plain text.
	"""
	if not isinstance(renderer, str) or renderer == "":
		raise ValueError("renderer must be a non-empty string")

	if not isinstance(data, dict):
		raise TypeError("data must be a dict")

	try:
		resolved_binary = resolve_binary(binary)
	except CliStyleNotFoundError:
		if raise_on_missing:
			raise

		# Sort the keys so the lines match the Swift adapter, which has no key order to keep.
		return "\n".join(f"{key}: {value}" for key, value in sorted(data.items(), key=lambda item: str(item[0])))

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
		env=resolve_subprocess_environment(),
		input=json.dumps(data),
		text=True,
	)

	if result.returncode != 0:
		message = result.stderr.strip() or f"cli-style render failed with exit code {result.returncode}"
		raise CliStyleRenderError(message)

	return result.stdout.rstrip("\n")


def resolve_binary(binary: str) -> str:
	"""Resolve a cli-style command name or executable path."""
	if "/" in binary:
		path = Path(binary)

		if path.is_file() and os.access(path, os.X_OK):
			return str(path)

		raise CliStyleNotFoundError(f"cli-style binary not found: {binary}")

	resolved = shutil.which(binary)

	if resolved is None:
		raise CliStyleNotFoundError(f"cli-style binary not found: {binary}")

	return resolved
