#!/usr/bin/env python3
# Render a diagnostic report through the Python adapter.

from pathlib import Path
import sys

SCRIPT_DIR = Path(__file__).resolve().parent

sys.path.insert(0, str(SCRIPT_DIR.parent / "adapters" / "python"))

from cli_style import render  # noqa: E402


report = {
	"title": "Diagnostics",
	"checks": [
		{
			"result": "success",
			"name": "Unit tests",
			"detail": "30 tests",
		},
	],
	"findings": [],
	"skippedChecks": [
		{
			"name": "Full suite",
			"reason": "Not needed for adapter smoke test",
		},
	],
	"nextActions": ["Build Bash and Python adapters"],
}

print(render(
	"diagnostic-report",
	report,
	binary=str(SCRIPT_DIR.parent / "bin" / "cli-style.js"),
	profile="diagnostic",
))
