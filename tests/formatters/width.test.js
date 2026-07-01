import { describe, expect, test } from "bun:test";

import { defaultWidth, minimumWidth, normaliseWidth } from "../../src/index.js";

describe("Width normalisation", () => {
	test("Falls back when width is unusable", () => {
		expect(normaliseWidth(undefined)).toBe(defaultWidth);
		expect(normaliseWidth("wide")).toBe(defaultWidth);
	});

	test("Floors numeric width values", () => {
		expect(normaliseWidth(72.8)).toBe(72);
		expect(normaliseWidth("64")).toBe(64);
	});

	test("Clamps to minimum and maximum bounds", () => {
		expect(normaliseWidth(8)).toBe(minimumWidth);
		expect(
			normaliseWidth(120, {
				maxWidth: 90,
			}),
		).toBe(90);
	});

	test("Supports custom fallback and minimum width", () => {
		expect(
			normaliseWidth(null, {
				defaultWidth: 48,
				minWidth: 32,
			}),
		).toBe(48);
		expect(
			normaliseWidth(24, {
				minWidth: 32,
			}),
		).toBe(32);
	});
});
