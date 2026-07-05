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
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_row "Bundle" "over budget" failed --plain',
					'command="$(CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_span "npm run docs:readme" info --plain)"',
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_hint "Run $command before release" --plain',
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
		expect(lines[2]).toBe("x Bundle  over budget");
		expect(lines[3]).toBe("i Hint: Run npm run docs:readme before release");
		expect(lines[4]).toBe('i Hint: Run "dry-run" before C:\\repo\\setup.json');
		expect(lines[5].startsWith('Saved "config" ')).toBe(true);
		expect(result.stderr).toBe("");
	});

	test("Bash adapter pattern convenience functions escape dynamic strings", () => {
		const result = spawnSync(
			"bash",
			[
				"-c",
				[
					"source adapters/bash/cli-style.sh",
					"command='bun run \"test:unit\"'",
					"detail='See C:\\repo\\logs\\unit.txt'",
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_command_result success "Unit tests passed" "$command" 0 "1.2s" "$detail" --plain',
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_audit_finding warning "Button label is vague" "src/App.vue:42" "Use a specific action label" "Found \\"Continue\\"" "WCAG 2.4.6" --plain',
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_task_summary partial "Adopt cli-style" "Bash wrappers added" "Updated adapter" "Update downstream scripts" --plain',
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_confirmation_result confirmed "Publish release" "v0.6.0" "Tag push starts npm publish" --plain',
					'CLI_STYLE_BIN="$PWD/bin/cli-style.js" cli_style_next_step_block "Update helpers scripts" "Wrappers are now available" "scripts/setup.sh --check" "Keep literal JSON for aggregate reports" --plain',
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		const output = result.stdout;

		expect(result.status).toBe(0);
		expect(output).toContain("Command result");
		expect(output).toContain('Command    bun run "test:unit"');
		expect(output).toContain("See C:\\repo\\logs\\unit.txt");
		expect(output).toContain("Audit finding");
		expect(output).toContain('Found "Continue"');
		expect(output).toContain("Task summary");
		expect(output).toContain("- Updated adapter");
		expect(output).toContain("Confirmation result");
		expect(output).toContain("Tag push starts npm publish");
		expect(output).toContain("Next step");
		expect(output).toContain("$ scripts/setup.sh --check");
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

	test("Python adapter convenience functions handle dynamic strings", () => {
		const result = spawnSync(
			"python3",
			[
				"-c",
				[
					"from adapters.python.cli_style import status, row, span, hint, divider",
					"kwargs = {'binary': './bin/cli-style.js', 'plain': True}",
					"print(status('success', 'Saved \"config\"', 'C:\\\\repo\\\\setup.json', **kwargs))",
					"print(row('Config', 'C:\\\\repo\\\\setup.json', **kwargs))",
					"print(row('Bundle', 'over budget', 'failed', **kwargs))",
					"command = span('npm run docs:readme', 'info', **kwargs)",
					"print(hint('Run ' + command + ' before release', **kwargs))",
					"print(divider('Saved \"config\"', **kwargs))",
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
		expect(lines[2]).toBe("x Bundle  over budget");
		expect(lines[3]).toBe("i Hint: Run npm run docs:readme before release");
		expect(lines[4].startsWith('Saved "config" ')).toBe(true);
		expect(result.stderr).toBe("");
	});

	test("Python adapter pattern convenience functions handle dynamic strings", () => {
		const result = spawnSync(
			"python3",
			[
				"-c",
				[
					"from adapters.python.cli_style import command_result, audit_finding, task_summary, confirmation_result, next_step_block",
					"kwargs = {'binary': './bin/cli-style.js', 'plain': True}",
					"print(command_result('success', 'Unit tests passed', 'bun run \"test:unit\"', 0, '1.2s', 'See C:\\\\repo\\\\logs\\\\unit.txt', **kwargs))",
					"print(audit_finding('warning', 'Button label is vague', 'src/App.vue:42', 'Use a specific action label', 'Found \"Continue\"', 'WCAG 2.4.6', **kwargs))",
					"print(task_summary('partial', 'Adopt cli-style', 'Bash wrappers added', 'Updated adapter', 'Update downstream scripts', **kwargs))",
					"print(confirmation_result('confirmed', 'Publish release', 'v0.6.0', 'Tag push starts npm publish', **kwargs))",
					"print(next_step_block('Update helpers scripts', 'Wrappers are now available', 'scripts/setup.sh --check', 'Keep literal JSON for aggregate reports', **kwargs))",
				].join("\n"),
			],
			{
				encoding: "utf8",
			},
		);

		const output = result.stdout;

		expect(result.status).toBe(0);
		expect(output).toContain("Command result");
		expect(output).toContain('Command    bun run "test:unit"');
		expect(output).toContain("See C:\\repo\\logs\\unit.txt");
		expect(output).toContain("Audit finding");
		expect(output).toContain('Found "Continue"');
		expect(output).toContain("Task summary");
		expect(output).toContain("- Updated adapter");
		expect(output).toContain("Confirmation result");
		expect(output).toContain("Tag push starts npm publish");
		expect(output).toContain("Next step");
		expect(output).toContain("$ scripts/setup.sh --check");
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
