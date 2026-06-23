import { foreground } from "../formatters/ansi.js";
import { getResultSymbol, getResultToken, resultTypes } from "../theme/results.js";

// Step states describe position in an ordered flow.
export const stepStates = {
	COMPLETE: "complete",
	CURRENT: "current",
	PENDING: "pending",
};

// Current steps use the running symbol defined by the package contract.
const currentToken = {
	symbols: {
		ascii: "...",
		unicode: "…",
	},
	tone: "info",
};

/**
 * Render one labelled step state.
 *
 * @param  {string}  label
 *     Step label.
 * @param  {string}  state
 *     Step state or result type.
 * @param  {object}  options
 *     Rendering options.
 * @param  {boolean}  options.colour
 *     Whether ANSI colour should be applied.
 * @param  {boolean}  options.unicode
 *     Whether Unicode symbols should be used.
 * @returns  {string}
 *     Rendered step.
 */
export function step(label = "", state = stepStates.PENDING, options = {}) {
	const token = stepToken(state);
	const symbol = stepSymbol(state, token, options);

	if (options.colour !== true) {
		return `${symbol} ${label}`;
	}

	const renderedSymbol = foreground(symbol, token.tone, options);

	return `${renderedSymbol} ${label}`;
}

/**
 * Render an ordered sequence with inferred states and explicit counts.
 *
 * @param  {object}  options
 *     Rendering options.
 * @param  {number}  options.current
 *     Zero-based current step index.
 * @param  {string[]}  options.steps
 *     Ordered step labels.
 * @returns  {string}
 *     Rendered step progress.
 */
export function stepProgress(options = {}) {
	const steps = normaliseSteps(options.steps);

	if (steps.length === 0) {
		return "";
	}

	const current = normaliseCurrent(options.current, steps.length);

	return steps.map((label, index) => {
		const state = stateForIndex(index, current);
		const count = `${index + 1}/${steps.length}`;

		return `${count} ${step(label, state, options)}`;
	}).join("\n");
}

/**
 * Return valid step labels.
 *
 * @param  {string[]}  steps
 *     Requested step labels.
 * @returns  {string[]}
 *     Non-empty labels.
 */
function normaliseSteps(steps) {
	if (!Array.isArray(steps)) {
		return [];
	}

	return steps.filter((label) => typeof label === "string" && label !== "");
}

/**
 * Return a current index within the step range.
 *
 * @param  {number}  current
 *     Requested current index.
 * @param  {number}  stepCount
 *     Number of available steps.
 * @returns  {number}
 *     Clamped current index.
 */
function normaliseCurrent(current, stepCount) {
	if (!Number.isFinite(current)) {
		return 0;
	}

	return Math.min(Math.max(Math.floor(current), 0), stepCount - 1);
}

/**
 * Infer a positional state for a step index.
 *
 * @param  {number}  index
 *     Step index.
 * @param  {number}  current
 *     Current step index.
 * @returns  {string}
 *     Positional step state.
 */
function stateForIndex(index, current) {
	if (index < current) {
		return stepStates.COMPLETE;
	}

	if (index === current) {
		return stepStates.CURRENT;
	}

	return stepStates.PENDING;
}

/**
 * Return the display token for a step state.
 *
 * @param  {string}  state
 *     Step state or result type.
 * @returns  {object}
 *     Symbol and tone token.
 */
function stepToken(state) {
	if (state === stepStates.COMPLETE) {
		return getResultToken(resultTypes.SUCCESS);
	}

	if (state === stepStates.CURRENT) {
		return currentToken;
	}

	if (state === stepStates.PENDING) {
		return getResultToken(resultTypes.SKIPPED);
	}

	return getResultToken(state);
}

/**
 * Return the display symbol for a step state.
 *
 * @param  {string}  state
 *     Step state or result type.
 * @param  {object}  token
 *     Resolved step token.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {string}
 *     Step symbol.
 */
function stepSymbol(state, token, options) {
	if (state === stepStates.CURRENT) {
		return options.unicode === false ? token.symbols.ascii : token.symbols.unicode;
	}

	if (state === stepStates.COMPLETE) {
		return getResultSymbol(resultTypes.SUCCESS, options);
	}

	if (state === stepStates.PENDING) {
		return getResultSymbol(resultTypes.SKIPPED, options);
	}

	return getResultSymbol(state, options);
}
