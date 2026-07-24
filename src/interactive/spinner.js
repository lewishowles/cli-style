import { foreground } from "../formatters/ansi.js";
import { profiles } from "../profiles/profiles.js";
import { status } from "../primitives/status.js";
import { resultTypes } from "../theme/results.js";

// Frame glyphs cycled while a spinner is animating.
const unicodeFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const asciiFrames = ["-", "\\", "|", "/"];

// Time between animated frame redraws.
const frameIntervalMs = 80;

// Built from a character code, rather than a string escape, so the control byte stays visible in diffs.
const escapeCharacter = String.fromCharCode(27);

// ANSI cursor and line-clear sequences used only on an interactive TTY.
const hideCursor = `${escapeCharacter}[?25l`;
const showCursor = `${escapeCharacter}[?25h`;
const clearLine = `\r${escapeCharacter}[2K`;

// Profiles that always use the static, non-animated spinner output.
const nonInteractiveProfiles = new Set([
	profiles.AGENT,
	profiles.CI,
	profiles.JSON,
	profiles.PLAIN,
]);

// Spinner currently writing output; only one may be active at a time.
let runningSpinner = null;

// Whether the process-exit cleanup listener has been registered.
let cleanupRegistered = false;

/**
 * Start a spinner and return a manual handle for advanced lifecycle control.
 *
 * @param  {string}  text
 *     Initial spinner text.
 * @param  {object}  options
 *     Rendering and capability options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {boolean}  options.isTty
 *     Whether stdout is an interactive terminal.
 * @param  {string}  options.profile
 *     Resolved output profile.
 * @param  {object}  options.stream
 *     Writable stream the spinner writes to. Defaults to `process.stderr`.
 * @param  {boolean}  options.unicode
 *     Whether Unicode symbols should be used.
 * @returns  {object}
 *     Handle with `update`, `succeed`, `fail`, and `stop` methods.
 */
export function spinner(text, options = {}) {
	if (runningSpinner !== null) {
		throw new Error("A spinner is already active; stop it before starting another.");
	}

	const state = {
		active: true,
		frameIndex: 0,
		interactive: isInteractive(options),
		options,
		stream: options.stream ?? process.stderr,
		text,
		timer: null,
	};

	runningSpinner = state;
	registerCleanup();
	startSpinnerState(state);

	return {
		fail: (finalText) => finishSpinnerState(state, resultTypes.FAILED, finalText),
		stop: () => stopSpinnerState(state),
		succeed: (finalText) => finishSpinnerState(state, resultTypes.SUCCESS, finalText),
		update: (nextText) => updateSpinnerState(state, nextText),
	};
}

/**
 * Run an async task behind a spinner, resolving or rejecting it unchanged.
 *
 * @param  {string}  text
 *     Spinner text shown while the task runs.
 * @param  {Function}  fn
 *     Async task to run.
 * @param  {object}  options
 *     Rendering and capability options, forwarded to `spinner()`.
 * @returns  {Promise<*>}
 *     Resolved value of `fn`, or its rejection rethrown after cleanup.
 */
export async function runSpinner(text, fn, options = {}) {
	const handle = spinner(text, options);

	try {
		const result = await fn();

		handle.succeed();

		return result;
	} catch (error) {
		handle.fail();

		throw error;
	} finally {
		handle.stop();
	}
}

/**
 * Render one animated spinner frame without starting a timer.
 *
 * @param  {string}  text
 *     Spinner text to show alongside the frame glyph.
 * @param  {number}  frameIndex
 *     Frame position to render.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {boolean}  options.unicode
 *     Whether Unicode symbols should be used.
 * @returns  {string}
 *     Rendered frame line.
 */
export function renderSpinnerFrame(text, frameIndex, options = {}) {
	const frames = options.unicode === false ? asciiFrames : unicodeFrames;
	const glyph = frames[frameIndex % frames.length];
	const colouredGlyph = foreground(glyph, "info", options);

	return `${colouredGlyph} ${text}`;
}

/**
 * Determine whether a spinner should animate on the current output target.
 *
 * @param  {object}  options
 *     Rendering and capability options.
 * @returns  {boolean}
 *     Whether the spinner can animate.
 */
function isInteractive(options) {
	return options.isTty === true && !nonInteractiveProfiles.has(options.profile);
}

/**
 * Write the initial spinner output for a state, starting the frame timer when interactive.
 *
 * @param  {object}  state
 *     Spinner state to start.
 * @returns  {void}
 */
function startSpinnerState(state) {
	if (!state.interactive) {
		state.stream.write(
			`${status(resultTypes.INFO, "", { ...state.options, label: state.text })}\n`,
		);

		return;
	}

	state.stream.write(hideCursor);
	renderFrame(state);

	state.timer = setInterval(() => tickSpinnerState(state), frameIntervalMs);
	state.timer.unref?.();
}

/**
 * Advance and redraw the animated frame for a state.
 *
 * @param  {object}  state
 *     Spinner state to advance.
 * @returns  {void}
 */
function tickSpinnerState(state) {
	state.frameIndex += 1;

	renderFrame(state);
}

/**
 * Redraw the current animated frame in place.
 *
 * @param  {object}  state
 *     Spinner state to render.
 * @returns  {void}
 */
function renderFrame(state) {
	state.stream.write(
		`${clearLine}${renderSpinnerFrame(state.text, state.frameIndex, state.options)}`,
	);
}

/**
 * Update the text shown by an active spinner.
 *
 * @param  {object}  state
 *     Spinner state to update.
 * @param  {string}  nextText
 *     Replacement spinner text.
 * @returns  {void}
 */
function updateSpinnerState(state, nextText) {
	if (!state.active) {
		return;
	}

	state.text = nextText;

	if (state.interactive) {
		renderFrame(state);
	}
}

/**
 * Stop a spinner without printing a result line.
 *
 * @param  {object}  state
 *     Spinner state to stop.
 * @returns  {void}
 */
function stopSpinnerState(state) {
	if (!state.active) {
		return;
	}

	state.active = false;
	clearSpinnerTimer(state);

	if (state.interactive) {
		state.stream.write(`${clearLine}${showCursor}`);
	}

	if (runningSpinner === state) {
		runningSpinner = null;
	}
}

/**
 * Stop a spinner and print a success or fail result line.
 *
 * @param  {object}  state
 *     Spinner state to finish.
 * @param  {string}  resultType
 *     Result type to display, from `resultTypes`.
 * @param  {string}  finalText
 *     Optional replacement text for the result line.
 * @returns  {void}
 */
function finishSpinnerState(state, resultType, finalText) {
	if (!state.active) {
		return;
	}

	state.active = false;
	clearSpinnerTimer(state);

	const label = finalText ?? state.text;
	const line = status(resultType, "", { ...state.options, label });

	if (state.interactive) {
		state.stream.write(`${clearLine}${showCursor}${line}\n`);
	} else {
		state.stream.write(`${line}\n`);
	}

	if (runningSpinner === state) {
		runningSpinner = null;
	}
}

/**
 * Clear an active state's frame timer, when one exists.
 *
 * @param  {object}  state
 *     Spinner state to clear.
 * @returns  {void}
 */
function clearSpinnerTimer(state) {
	if (state.timer !== null) {
		clearInterval(state.timer);
		state.timer = null;
	}
}

/**
 * Restore the cursor for an active, interactive spinner, stop its frame timer, and clear the
 * running reference.
 *
 * @returns  {void}
 */
function restoreRunningSpinner() {
	if (runningSpinner !== null) {
		clearSpinnerTimer(runningSpinner);

		if (runningSpinner.interactive) {
			runningSpinner.stream.write(`${clearLine}${showCursor}`);
		}
	}

	runningSpinner = null;
}

/**
 * Restore the cursor on SIGINT, then re-raise the signal so the process still terminates with
 * Node's default SIGINT exit code. A listener that did not re-raise would silently replace that
 * default termination, leaving the process running whenever other work still holds the event loop
 * open.
 *
 * @returns  {void}
 */
function handleSpinnerSigint() {
	restoreRunningSpinner();
	process.removeListener("SIGINT", handleSpinnerSigint);
	process.kill(process.pid, "SIGINT");
}

/**
 * Register process-exit and SIGINT listeners, once, that restore the cursor for an interrupted spinner.
 *
 * @returns  {void}
 */
function registerCleanup() {
	if (cleanupRegistered) {
		return;
	}

	cleanupRegistered = true;

	process.on("exit", restoreRunningSpinner);
	process.on("SIGINT", handleSpinnerSigint);
}
