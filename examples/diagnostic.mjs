#!/usr/bin/env bun

import { diagnosticReport } from "../src/index.js";

// Example data shaped like a local diagnostic command summary.
const report = {
	checks: [
		{
			detail: "30 tests",
			name: "Unit tests",
			result: "success",
		},
	],
	findings: [],
	nextActions: ["Build Bash and Python adapters"],
	skippedChecks: [
		{
			name: "Full suite",
			reason: "Not needed for adapter smoke test",
		},
	],
	title: "Diagnostics",
};

console.log(diagnosticReport(report, {
	colour: false,
	profile: "diagnostic",
	unicode: true,
	width: 80,
}));
