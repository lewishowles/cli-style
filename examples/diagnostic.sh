#!/usr/bin/env bash
# Render a diagnostic report through the Bash adapter.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/../adapters/bash/cli-style.sh"

CLI_STYLE_BIN="${CLI_STYLE_BIN:-"$SCRIPT_DIR/../bin/cli-style.js"}" cli_style_render diagnostic-report --profile diagnostic <<'JSON'
{
	"title": "Diagnostics",
	"checks": [
		{
			"result": "success",
			"name": "Unit tests",
			"detail": "30 tests"
		}
	],
	"findings": [],
	"skippedChecks": [
		{
			"name": "Full suite",
			"reason": "Not needed for adapter smoke test"
		}
	],
	"nextActions": ["Build Bash and Python adapters"]
}
JSON
