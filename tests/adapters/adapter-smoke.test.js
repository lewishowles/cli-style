import { spawnSync } from "node:child_process";

import { describe, expect, test } from "bun:test";

describe("Adapter smoke tests", () => {
	test("Bash adapter renders through cli-style render", () => {
		const result = spawnSync(
			"bash",
			[
				"-c",
				[
					"source adapters/bash/cli-style.sh",
					"CLI_STYLE_BIN=\"$PWD/bin/cli-style.js\" cli_style_render status --plain <<'JSON'",
					'{"type":"success","label":"Build passed","detail":"184 tests"}',
					"JSON",
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		expect(result.status).toBe(0);
		expect(result.stdout.trim()).toBe("OK Build passed 184 tests");
		expect(result.stderr).toBe("");
	});

	test("Bash adapter can be sourced from cli-style adapter-path", () => {
		const result = spawnSync(
			"bash",
			[
				"-c",
				[
					'source "$(bin/cli-style.js adapter-path bash)"',
					"CLI_STYLE_BIN=\"$PWD/bin/cli-style.js\" cli_style_render status --plain <<'JSON'",
					'{"type":"success","label":"Build passed","detail":"184 tests"}',
					"JSON",
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		expect(result.status).toBe(0);
		expect(result.stdout.trim()).toBe("OK Build passed 184 tests");
		expect(result.stderr).toBe("");
	});

	test("Bash adapter convenience functions escape dynamic strings", () => {
		const result = spawnSync(
			"bash",
			[
				"-c",
				[
					"source adapters/bash/cli-style.sh",
					"label='Saved \"config\"'",
					"value='C:\\repo\\setup.json'",
					"message='Run \"dry-run\" before C:\\repo\\setup.json'",
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_status success "$label" "$value" --plain',
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_row "Config" "$value" --plain',
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_hint "$message" --plain',
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_divider "$label" --plain',
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		const lines = result.stdout.trim().split("\n");

		expect(result.status).toBe(0);
		expect(lines[0]).toBe('OK Saved "config" C:\\repo\\setup.json');
		expect(lines[1]).toBe("Config  C:\\repo\\setup.json");
		expect(lines[2]).toBe('i Hint: Run "dry-run" before C:\\repo\\setup.json');
		expect(lines[3].startsWith('Saved "config" ')).toBe(true);
		expect(result.stderr).toBe("");
	});

	test("Bash adapter fails clearly when cli-style is unavailable", () => {
		const result = spawnSync(
			"bash",
			[
				"-c",
				[
					"source adapters/bash/cli-style.sh",
					"CLI_STYLE_BIN=\"/missing/cli-style\" cli_style_render status <<'JSON'",
					"{}",
					"JSON",
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		expect(result.status).toBe(127);
		expect(result.stderr).toContain("cli-style binary not found: /missing/cli-style");
	});

	test("Python adapter renders through cli-style render", () => {
		const result = spawnSync(
			"python3",
			[
				"-c",
				[
					"from adapters.python.cli_style import render",
					"output = render('status', {'type': 'success', 'label': 'Build passed', 'detail': '184 tests'}, binary='./bin/cli-style.js', plain=True)",
					"print(output)",
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		expect(result.status).toBe(0);
		expect(result.stdout.trim()).toBe("OK Build passed 184 tests");
		expect(result.stderr).toBe("");
	});

	test("Python adapter can be imported from cli-style adapter-path", () => {
		const result = spawnSync(
			"bash",
			[
				"-c",
				[
					"PYTHONPATH=\"$(bin/cli-style.js adapter-path python)\" python3 - <<'PY'",
					"from cli_style import render",
					"output = render('status', {'type': 'success', 'label': 'Build passed', 'detail': '184 tests'}, binary='./bin/cli-style.js', plain=True)",
					"print(output)",
					"PY",
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		expect(result.status).toBe(0);
		expect(result.stdout.trim()).toBe("OK Build passed 184 tests");
		expect(result.stderr).toBe("");
	});

	test("Python adapter fails clearly when cli-style is unavailable", () => {
		const result = spawnSync(
			"python3",
			[
				"-c",
				[
					"from adapters.python.cli_style import CliStyleNotFoundError, render",
					"try:",
					"\trender('status', {}, binary='/missing/cli-style')",
					"except CliStyleNotFoundError as error:",
					"\tprint(error)",
					"\traise SystemExit(0)",
					"raise SystemExit(1)",
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		expect(result.status).toBe(0);
		expect(result.stdout.trim()).toBe("cli-style binary not found: /missing/cli-style");
		expect(result.stderr).toBe("");
	});
});
