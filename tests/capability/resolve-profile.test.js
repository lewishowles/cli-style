import {
	describe,
	expect,
	test,
} from "bun:test";

import {
	profiles,
	resolveProfile,
} from "../../src/index.js";

describe("Profile resolution", () => {
	test("Uses explicit profile when supported", () => {
		const profile = resolveProfile({
			profile: profiles.AGENT,
		});

		expect(profile).toBe(profiles.AGENT);
	});

	test("Falls back to human for unsupported explicit profile", () => {
		const profile = resolveProfile({
			profile: "missing",
		});

		expect(profile).toBe(profiles.HUMAN);
	});

	test("Uses CI profile when CI environment is true", () => {
		const profile = resolveProfile({
			env: {
				CI: "true",
			},
		});

		expect(profile).toBe(profiles.CI);
	});

	test("CLI json flag takes precedence over explicit profile", () => {
		const profile = resolveProfile({
			argv: ["--json"],
			profile: profiles.HUMAN,
		});

		expect(profile).toBe(profiles.JSON);
	});

	test("CLI plain flag takes precedence over explicit profile", () => {
		const profile = resolveProfile({
			argv: ["--plain"],
			profile: profiles.HUMAN,
		});

		expect(profile).toBe(profiles.PLAIN);
	});

	test("Reads profile from equals-style CLI flag", () => {
		const profile = resolveProfile({
			argv: ["--profile=diagnostic"],
		});

		expect(profile).toBe(profiles.DIAGNOSTIC);
	});

	test("Reads profile from separated CLI flag", () => {
		const profile = resolveProfile({
			argv: ["--profile", "agent"],
		});

		expect(profile).toBe(profiles.AGENT);
	});
});
