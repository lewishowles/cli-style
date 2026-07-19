import { describe, expect, test } from "bun:test";

import { sparkline, stripAnsi } from "../../src/index.js";

describe("sparkline", () => {
	test("Renders rising, falling, flat, and negative sequences", () => {
		expect(
			sparkline({
				colour: false,
				values: [1, 2, 3, 4],
			}),
		).toBe("▁▃▆█ latest=4 min=1 max=4");
		expect(
			sparkline({
				colour: false,
				values: [4, 3, 2, 1],
			}),
		).toBe("█▆▃▁ latest=1 min=1 max=4");
		expect(
			sparkline({
				colour: false,
				values: [5, 5, 5],
			}),
		).toBe("▄▄▄ latest=5 min=5 max=5");
		expect(
			sparkline({
				colour: false,
				values: [-3, -2, -1],
			}),
		).toBe("▁▅█ latest=-1 min=-3 max=-1");
	});

	test("Renders a labelled mixed sequence", () => {
		const output = sparkline({
			colour: false,
			label: "Latency",
			values: [0, 10, -5, 5],
		});

		expect(output).toBe("Latency: ▃█▁▆ latest=5 min=-5 max=10");
	});

	test("Uses an ASCII ramp when Unicode is disabled", () => {
		const output = sparkline({
			colour: false,
			unicode: false,
			values: [0, 5, 10],
		});

		expect(output).toBe(".=# latest=10 min=0 max=10");
		expect(output).toMatch(/^[\x20-\x7E]*$/);
	});

	test("Returns an empty string for empty or invalid values", () => {
		expect(sparkline()).toBe("");
		expect(sparkline({ values: [] })).toBe("");
		expect(sparkline({ values: [1, Number.NaN, 3] })).toBe("");
		expect(sparkline({ values: "1,2,3" })).toBe("");
	});

	test("Downsamples within width while retaining extrema and latest context", () => {
		const output = sparkline({
			colour: false,
			values: [0, 100, 10, 20, 30, 60, 50, 40],
			width: 4,
		});

		const [plot] = output.split(" latest=");

		expect(plot).toBe("▁█▂▄");
		expect([...plot]).toHaveLength(4);
		expect(output).toContain("latest=40 min=0 max=100");
	});

	test("Colours only the trend when explicitly enabled", () => {
		const output = sparkline({
			colour: true,
			tone: "warning",
			values: [1, 2, 3],
		});

		expect(output).toContain("\u001b[38;5;215m");
		expect(stripAnsi(output)).toBe("▁▅█ latest=3 min=1 max=3");
	});

	test("Uses the default tone when colour is enabled without a tone", () => {
		const output = sparkline({
			colour: true,
			values: [1, 2, 3],
		});

		expect(output).toContain("\u001b[38;5;114m");
		expect(stripAnsi(output)).toBe("▁▅█ latest=3 min=1 max=3");
	});
});
