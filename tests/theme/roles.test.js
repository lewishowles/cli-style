import { describe, expect, test } from "bun:test";

import { createCliStyle, renderGallery, stripAnsi } from "../../src/index.js";
import { textRoles } from "../../src/theme/roles.js";

// The public role names must all have a rendering choice.
const expectedRoles = [
	"annotation",
	"command",
	"heading",
	"hint",
	"placeholder",
	"prompt",
	"secondary",
	"text",
	"title",
];

describe("Text roles", () => {
	test("Renders every role and keeps the text visible", () => {
		const ui = createCliStyle({ colour: true, theme: "dark" });

		expect(Object.values(textRoles).sort()).toEqual(expectedRoles);

		for (const role of expectedRoles) {
			expect(stripAnsi(ui.text(role, "Example"))).toBe("Example");
		}
	});

	test("Uses the accent for headings and bold accent for titles", () => {
		const ui = createCliStyle({ accent: "#123456", colour: true });

		expect(ui.text("heading", "Heading")).toBe("\u001b[38;2;18;52;86mHeading\u001b[0m");
		expect(ui.text("title", "Title")).toBe("\u001b[1m\u001b[38;2;18;52;86mTitle\u001b[0m\u001b[0m");
	});

	test("Chooses a paired accent from the resolved theme", () => {
		const accent = { dark: "#123456", light: "#abcdef" };
		const light = createCliStyle({ accent, colour: true, theme: "light" });
		const dark = createCliStyle({ accent, colour: true, theme: "dark" });
		const automatic = createCliStyle({ accent, colour: true, theme: "auto" });

		expect(light.text("heading", "H")).toContain("\u001b[38;2;171;205;239m");
		expect(dark.text("heading", "H")).toContain("\u001b[38;2;18;52;86m");
		expect(automatic.text("heading", "H")).toContain("\u001b[38;2;18;52;86m");
	});

	test("Uses terminal attributes for emphasis without fixed grey", () => {
		const ui = createCliStyle({ colour: true });

		expect(ui.text("command", "Run")).toBe("\u001b[1mRun\u001b[0m");
		expect(ui.text("secondary", "Later")).toBe("\u001b[2mLater\u001b[0m");
		expect(ui.text("hint", "Tip")).toBe("\u001b[2m\u001b[3mTip\u001b[0m\u001b[0m");
		expect(ui.text("text", "Body")).toBe("Body");
	});

	test("Restores the hint attributes after nested text resets them", () => {
		const ui = createCliStyle({ colour: true });

		expect(ui.text("hint", "A\u001b[0mB")).toBe(
			"\u001b[2m\u001b[3mA\u001b[0m\u001b[2m\u001b[3mB\u001b[0m\u001b[0m",
		);
	});

	test("Keeps every role unchanged in plain and no-colour output", () => {
		const plain = createCliStyle({ colour: true, profile: "plain" });
		const noColour = createCliStyle({ colour: false });

		for (const role of expectedRoles) {
			expect(plain.text(role, "Example")).toBe("Example");
			expect(noColour.text(role, "Example")).toBe("Example");
		}
	});

	test("Rejects unknown roles even when colour is disabled", () => {
		const ui = createCliStyle({ colour: false });

		expect(() => ui.text("missing", "Example")).toThrow("Unknown text role: missing");
		expect(() => ui.text("toString", "Example")).toThrow("Unknown text role: toString");
	});

	test("Rejects a malformed accent or an incomplete light and dark pair", () => {
		expect(() => createCliStyle({ accent: { dark: "#123456" } })).toThrow(
			"accent must be a colour or a { light, dark } colour pair",
		);
		expect(() => createCliStyle({ accent: "#123" })).toThrow(
			"accent must be a colour or a { light, dark } colour pair",
		);
	});

	test("Accepts an existing colour token as the accent", () => {
		const ui = createCliStyle({ accent: "danger", colour: true, theme: "dark" });

		expect(ui.text("heading", "Warning")).toBe("\u001b[38;5;210mWarning\u001b[0m");
	});

	test("Renders the README ANSI-256 accent examples", () => {
		const shared = createCliStyle({ accent: "ansi-256:25", colour: true });

		const light = createCliStyle({
			accent: { light: "ansi-256:30", dark: "ansi-256:116" },
			colour: true,
			theme: "light",
		});

		const dark = createCliStyle({
			accent: { light: "ansi-256:30", dark: "ansi-256:116" },
			colour: true,
			theme: "dark",
		});

		expect(shared.text("heading", "Heading")).toBe("\u001b[38;5;25mHeading\u001b[0m");
		expect(light.text("heading", "Heading")).toBe("\u001b[38;5;30mHeading\u001b[0m");
		expect(dark.text("heading", "Heading")).toBe("\u001b[38;5;116mHeading\u001b[0m");
	});

	test("Rejects malformed and out-of-range ANSI-256 accents", () => {
		expect(() => createCliStyle({ accent: "ansi-256:x" })).toThrow(TypeError);
		expect(() => createCliStyle({ accent: "ansi-256:256" })).toThrow(TypeError);
	});

	test("Rejects a null accent", () => {
		expect(() => createCliStyle({ accent: null })).toThrow(TypeError);
	});

	test("Shows all roles and a custom accent in the gallery", () => {
		const output = renderGallery({ colour: true, theme: "light" }, { section: "primitives" });

		for (const role of expectedRoles) {
			expect(output).toContain(`${role}: `);
		}

		expect(output).toContain("Custom accent: \u001b[38;2;102;51;153m");
	});
});
