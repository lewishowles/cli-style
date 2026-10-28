import { describe, expect, test } from "bun:test";

import { createCliStyle } from "../../src/create-cli-style.js";
import { stripAnsi, visibleWidth } from "../../src/formatters/ansi.js";
import { help } from "../../src/patterns/help.js";

// A short section with terms of different visible widths and an annotation.
const data = {
	title: "project-tool",
	tagline: "Inspect project files.",
	usage: "project-tool check <path> [options]",
	sections: [
		{
			heading: "commands",
			rows: [
				{ term: "check <path>", description: "Inspect a project path.", annotation: "read-only" },
				{ term: "list", description: "List available checks." },
			],
		},
	],
	examples: ["project-tool check src/"],
	hint: "Run project-tool --help for more commands.",
};

describe("Help", () => {
	test("Renders a plain command guide with aligned descriptions", () => {
		const output = help(data, { colour: false, width: 80 });
		const lines = output.split("\n");
		const checkLine = lines.find((line) => line.includes("Inspect a project path."));
		const listLine = lines.find((line) => line.includes("List available checks."));

		expect(output.startsWith("\nproject-tool\n")).toBe(true);
		expect(output.endsWith("\n")).toBe(true);
		expect(output).toContain("\nCommands\n");
		expect(output).toContain("  % project-tool check <path> [options]");
		expect(output).toContain("  % project-tool check src/");
		expect(checkLine.indexOf("Inspect")).toBe(listLine.indexOf("List"));
		expect(output).toContain("Inspect a project path. read-only");
	});

	test("Aligns terms by visible width when they contain wide characters", () => {
		const output = help(
			{
				sections: [
					{
						heading: "commands",
						rows: [
							{ term: "部署", description: "Deploy" },
							{ term: "list", description: "List" },
						],
					},
				],
			},
			{ colour: false, width: 60 },
		);

		const lines = output.split("\n");
		const deploy = lines.find((line) => line.endsWith("Deploy"));
		const list = lines.find((line) => line.endsWith("List"));

		expect(visibleWidth(deploy.slice(0, deploy.indexOf("Deploy")))).toBe(
			visibleWidth(list.slice(0, list.indexOf("List"))),
		);
	});

	test("Wraps descriptions within their column", () => {
		const output = help(
			{
				sections: [
					{
						heading: "options",
						rows: [{ term: "--mode", description: "Choose one of the available rendering modes." }],
					},
				],
			},
			{ colour: false, width: 32 },
		);

		const lines = output.split("\n").filter(Boolean);

		expect(lines).toContain("  --mode  Choose one of the");
		expect(lines).toContain("          available rendering");
		expect(lines.every((line) => visibleWidth(line) <= 32)).toBe(true);
	});

	test("Places descriptions below terms when the description column is too narrow", () => {
		const output = help({ sections: data.sections }, { colour: false, width: 25 });
		const lines = output.split("\n");

		expect(lines).toContain("  check <path>");
		expect(lines.some((line) => line.startsWith("    Inspect a project"))).toBe(true);
		expect(lines.every((line) => visibleWidth(line) <= 25)).toBe(true);
	});

	test("Renders a term with no description", () => {
		const output = help(
			{ sections: [{ heading: "options", rows: [{ term: "--quiet" }] }] },
			{ colour: false, width: 80 },
		);

		expect(output).toContain("--quiet");
		expect(output).not.toContain("undefined");
	});

	test("Styles the title, prompt, placeholders, annotation, and hint in colour", () => {
		const output = help(data, { colour: true, profile: "human", width: 80 });
		const dim = "\u001b[2m";

		expect(output).toContain("\u001b[");
		expect(stripAnsi(output)).toBe(help(data, { colour: false, width: 80 }));
		expect(output).toContain(`${dim}%`);
		expect(output).toContain(`${dim}<path>`);
		expect(output).toContain(`${dim}read-only`);
		expect(output).toContain("\u001b[3mRun project-tool --help for more commands.");
		expect(output).toContain("\u001b[38;5;116mproject-tool");
		expect(output).not.toContain("\u001b[1m\u001b[0m");

		const plain = createCliStyle({ colour: false, width: 80 }).help(data);

		expect(plain).toBe(help(data, { colour: false, width: 80 }));
	});

	test("Keeps usage and examples copyable at narrow widths", () => {
		const output = help(
			{
				usage: "project-tool render <renderer> [options] < input.json",
				examples: ["project-tool render status --plain < input.json"],
			},
			{ colour: false, width: 25 },
		);

		expect(output).toContain("  % project-tool render <renderer> [options] < input.json\n");
		expect(output).toContain("  % project-tool render status --plain < input.json\n");
	});

	test("Returns the original data in the JSON profile", () => {
		expect(help(data, { profile: "json" })).toBe(data);
		expect(createCliStyle({ profile: "json" }).help(data)).toBe(data);
	});
});
