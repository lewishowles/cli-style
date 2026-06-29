import { describe, expect, test } from "bun:test";

import { getResultSymbol, getResultToken, resultTokens, resultTypes } from "../../src/index.js";

describe("Result tokens", () => {
	test("Defines each shared result state", () => {
		expect(Object.keys(resultTokens).sort()).toEqual(
			[
				resultTypes.FAILED,
				resultTypes.INFO,
				resultTypes.PARTIAL,
				resultTypes.SKIPPED,
				resultTypes.SUCCESS,
				resultTypes.UNCHANGED,
				resultTypes.UNKNOWN,
				resultTypes.WARNING,
			].sort(),
		);
	});

	test("Falls back to unknown token for unsupported result types", () => {
		const token = getResultToken("missing");

		expect(token).toBe(resultTokens[resultTypes.UNKNOWN]);
	});
});

describe("Symbol fallback", () => {
	test("Uses Unicode symbols by default", () => {
		expect(getResultSymbol(resultTypes.SUCCESS)).toBe("✓");
		expect(getResultSymbol(resultTypes.INFO)).toBe("→");
		expect(getResultSymbol(resultTypes.WARNING)).toBe("⚠");
		expect(getResultSymbol(resultTypes.FAILED)).toBe("×");
		expect(getResultSymbol(resultTypes.UNCHANGED)).toBe("↪");
		expect(getResultSymbol(resultTypes.SKIPPED)).toBe("–");
	});

	test("Uses ASCII symbols when Unicode is disabled", () => {
		const options = {
			unicode: false,
		};

		expect(getResultSymbol(resultTypes.SUCCESS, options)).toBe("OK");
		expect(getResultSymbol(resultTypes.INFO, options)).toBe(">");
		expect(getResultSymbol(resultTypes.WARNING, options)).toBe("!");
		expect(getResultSymbol(resultTypes.FAILED, options)).toBe("x");
		expect(getResultSymbol(resultTypes.UNCHANGED, options)).toBe("-");
		expect(getResultSymbol(resultTypes.SKIPPED, options)).toBe("-");
	});
});
