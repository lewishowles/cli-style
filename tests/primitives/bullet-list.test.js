import { describe, expect, test } from "bun:test";

import { bulletList, getBulletSymbol } from "../../src/index.js";

describe("bulletList", () => {
	test("Renders flat items with Unicode bullets", () => {
		const output = bulletList(["Install dependencies", "Run the unit tests"], {
			colour: false,
			unicode: true,
		});

		expect(output).toBe("• Install dependencies\n• Run the unit tests");
	});

	test("Wraps item text and aligns continuation lines", () => {
		const output = bulletList(["one two three four"], {
			colour: false,
			unicode: true,
			width: 12,
		});

		expect(output).toBe("• one two\n  three four");
	});

	test("Uses nested symbols and parent gutter indentation", () => {
		const output = bulletList(
			[
				{
					items: [
						{
							items: ["Third level"],
							text: "Second level",
						},
					],
					text: "First level",
				},
			],
			{
				colour: false,
				unicode: true,
			},
		);

		expect(output).toBe("• First level\n  ◦ Second level\n    ◦ Third level");
	});

	test("Uses ASCII and Markdown bullets for constrained profiles", () => {
		expect(getBulletSymbol(0, { profile: "plain", unicode: true })).toBe("*");
		expect(getBulletSymbol(1, { profile: "ci", unicode: true })).toBe("*");
		expect(getBulletSymbol(0, { profile: "agent", unicode: true })).toBe("-");
		expect(getBulletSymbol(1, { profile: "agent", unicode: true })).toBe("-");
		expect(bulletList(["ASCII"], { colour: false, unicode: false })).toBe("* ASCII");

		const output = bulletList(["Top", { items: ["Nested"], text: "Parent" }], {
			colour: false,
			profile: "agent",
			unicode: true,
		});

		expect(output).toBe("- Top\n- Parent\n  - Nested");
	});

	test("Ignores invalid entries and returns an empty string without items", () => {
		expect(bulletList([null, "", " ", "\t", { text: "" }, { text: "\n" }])).toBe("");
		expect(bulletList(["Valid", null, { text: "" }, " ", { text: "\t" }])).toBe("• Valid");
		expect(bulletList(null)).toBe("");
	});
});
