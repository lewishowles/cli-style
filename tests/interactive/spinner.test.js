import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { renderSpinnerFrame, runSpinner, spinner } from "../../src/index.js";

/**
 * Create a stream stand-in that records every write call.
 *
 * @returns  {object}
 *     Fake stream with a `calls` array and a `write` method.
 */
function createFakeStream() {
	return {
		calls: [],
		write(value) {
			this.calls.push(value);
		},
	};
}

const baseOptions = {
	colour: false,
	profile: "human",
	unicode: true,
};

// Built from a character code, rather than a string escape, so the control byte stays visible in diffs.
const escapeCharacter = String.fromCharCode(27);

// Guard against a leaked active spinner from a failed assertion carrying into the next test.
afterEach(() => {
	try {
		spinner("cleanup", { ...baseOptions, isTty: false }).stop();
	} catch {
		// A previous test's spinner is still active; nothing further to clean up here.
	}
});

describe("spinner", () => {
	test("Writes a static start line and result line when non-interactive", () => {
		const stream = createFakeStream();
		const handle = spinner("Building", { ...baseOptions, isTty: false, stream });

		handle.succeed();

		expect(stream.calls).toEqual(["→ Building\n", "✓ Building\n"]);
	});

	test("Uses the fail symbol and an overridden label", () => {
		const stream = createFakeStream();
		const handle = spinner("Building", { ...baseOptions, isTty: false, stream });

		handle.fail("Build failed");

		expect(stream.calls).toEqual(["→ Building\n", "× Build failed\n"]);
	});

	test("Never starts a timer when non-interactive", () => {
		const intervalSpy = spyOn(globalThis, "setInterval");
		const stream = createFakeStream();
		const handle = spinner("Building", { ...baseOptions, isTty: false, stream });

		handle.stop();

		expect(intervalSpy).not.toHaveBeenCalled();

		intervalSpy.mockRestore();
	});

	test("Ignores calls to succeed, fail, or stop once already finished", () => {
		const stream = createFakeStream();
		const handle = spinner("Building", { ...baseOptions, isTty: false, stream });

		handle.succeed();
		const callCountAfterSucceed = stream.calls.length;

		handle.succeed();
		handle.fail();
		handle.stop();

		expect(stream.calls.length).toBe(callCountAfterSucceed);
	});

	test("Hides and restores the cursor around a manual stop on an interactive TTY", () => {
		const stream = createFakeStream();
		const handle = spinner("Building", { ...baseOptions, isTty: true, stream });

		handle.stop();

		expect(stream.calls[0]).toBe(`${escapeCharacter}[?25l`);
		expect(stream.calls.at(-1)).toBe(`\r${escapeCharacter}[2K${escapeCharacter}[?25h`);
	});

	test("Restores the cursor for a still-active spinner when the process exit event fires", () => {
		const stream = createFakeStream();

		spinner("Building", { ...baseOptions, isTty: true, stream });
		process.emit("exit");

		expect(stream.calls.at(-1)).toBe(`\r${escapeCharacter}[2K${escapeCharacter}[?25h`);

		expect(() =>
			spinner("Deploying", { ...baseOptions, isTty: false, stream }).stop(),
		).not.toThrow();
	});

	test("Throws when a second spinner starts while one is active", () => {
		const stream = createFakeStream();
		const handle = spinner("Building", { ...baseOptions, isTty: false, stream });

		expect(() => spinner("Deploying", { ...baseOptions, isTty: false, stream })).toThrow(
			"A spinner is already active; stop it before starting another.",
		);

		handle.stop();
	});

	test("Allows a new spinner once the previous one has finished", () => {
		const stream = createFakeStream();

		spinner("Building", { ...baseOptions, isTty: false, stream }).succeed();

		expect(() =>
			spinner("Deploying", { ...baseOptions, isTty: false, stream }).stop(),
		).not.toThrow();
	});
});

describe("runSpinner", () => {
	test("Resolves the task result and writes a success line", async () => {
		const stream = createFakeStream();

		const result = await runSpinner("Building", async () => "done", {
			...baseOptions,
			isTty: false,
			stream,
		});

		expect(result).toBe("done");
		expect(stream.calls).toEqual(["→ Building\n", "✓ Building\n"]);
	});

	test("Rethrows a task rejection after writing a fail line", async () => {
		const stream = createFakeStream();
		const failure = new Error("Build broke");

		await expect(
			runSpinner(
				"Building",
				async () => {
					throw failure;
				},
				{ ...baseOptions, isTty: false, stream },
			),
		).rejects.toThrow(failure);

		expect(stream.calls).toEqual(["→ Building\n", "× Building\n"]);
	});
});

describe("renderSpinnerFrame", () => {
	test("Renders the Unicode frame glyph for a given frame index", () => {
		expect(renderSpinnerFrame("Building", 0, { colour: false, unicode: true })).toBe("⠋ Building");
		expect(renderSpinnerFrame("Building", 1, { colour: false, unicode: true })).toBe("⠙ Building");
	});

	test("Renders the ASCII frame glyph when Unicode is disabled", () => {
		expect(renderSpinnerFrame("Building", 0, { colour: false, unicode: false })).toBe("- Building");
	});

	test("Wraps frames back to the first glyph", () => {
		expect(renderSpinnerFrame("Building", 10, { colour: false, unicode: true })).toBe("⠋ Building");
	});
});
