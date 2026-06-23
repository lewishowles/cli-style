import { describe, expect, test } from "bun:test";

import {
	auditFinding,
	profiles,
	resultTypes,
} from "../../src/index.js";

describe("auditFinding", () => {
	test("Renders severity, location, evidence, recommendation, and references", () => {
		const output = auditFinding({
			evidence: [
				"Text contrast measures 3.2:1",
				"Body text requires at least 4.5:1",
			],
			finding: "Muted text has insufficient contrast",
			location: "src/components/StatusCard.vue:42",
			recommendation: "Use the standard foreground token.",
			references: [
				"WCAG 2.2 SC 1.4.3",
			],
			result: resultTypes.FAILED,
		}, {
			colour: false,
		});

		expect(output).toBe([
			"Audit finding",
			"",
			"× Failed Muted text has insufficient contrast",
			"",
			"Location  src/components/StatusCard.vue:42",
			"",
			"Evidence",
			"- Text contrast measures 3.2:1",
			"- Body text requires at least 4.5:1",
			"",
			"Recommendation",
			"Use the standard foreground token.",
			"",
			"References",
			"- WCAG 2.2 SC 1.4.3",
		].join("\n"));
	});

	test("Keeps warning output stable in CI and ASCII modes", () => {
		const output = auditFinding({
			finding: "Focus order needs review",
			location: "src/App.vue",
			recommendation: "Verify keyboard order.",
			result: resultTypes.WARNING,
		}, {
			colour: false,
			profile: profiles.CI,
			unicode: false,
		});

		expect(output).toBe([
			"Audit finding",
			"",
			"! Warning Focus order needs review",
			"",
			"Location  src/App.vue",
			"",
			"Recommendation",
			"Verify keyboard order.",
		].join("\n"));
	});

	test("Uses Markdown structure for the agent profile", () => {
		const output = auditFinding({
			evidence: ["Button has no accessible name"],
			finding: "Icon button is unnamed",
			location: "src/components/MenuButton.vue:18",
			recommendation: "Add a visible label or accessible name.",
			result: resultTypes.FAILED,
		}, {
			colour: false,
			profile: profiles.AGENT,
		});

		expect(output).toBe([
			"# Audit finding",
			"",
			"× Failed Icon button is unnamed",
			"",
			"## Location",
			"src/components/MenuButton.vue:18",
			"",
			"## Evidence",
			"- Button has no accessible name",
			"",
			"## Recommendation",
			"Add a visible label or accessible name.",
		].join("\n"));
	});

	test("Returns structured input unchanged for the JSON profile", () => {
		const finding = {
			finding: "Icon button is unnamed",
			result: resultTypes.FAILED,
		};

		expect(auditFinding(finding, {
			profile: profiles.JSON,
		})).toBe(finding);
	});

	test("Returns an empty string for invalid text input", () => {
		expect(auditFinding(null)).toBe("");
		expect(auditFinding([])).toBe("");
	});
});
