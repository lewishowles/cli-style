// Default terminal width when no stream width is available.
const defaultWidth = 80;

/**
 * Resolve terminal output capabilities from injected args, env, and stream data.
 *
 * @param  {object}  options
 *     Terminal capability inputs.
 * @param  {string[]}  options.argv
 *     CLI arguments to inspect.
 * @param  {object}  options.env
 *     Environment values to inspect.
 * @param  {object}  options.stdout
 *     Stream-like object with `isTTY` and `columns`.
 * @returns  {object}
 *     Resolved terminal capabilities.
 */
export function resolveTerminalCapabilities(options = {}) {
	const argv = options.argv ?? [];
	const env = options.env ?? {};
	const stdout = options.stdout ?? {};

	const isTty = stdout.isTTY === true;
	const isCi = env.CI === "true" || env.CI === "1";
	const isDumb = env.TERM === "dumb";
	const width = resolveWidth(stdout.columns);
	const usesPlain = argv.includes("--plain");

	const colour = resolveColour({
		argv,
		env,
		isDumb,
		isTty,
		usesPlain,
	});

	const unicode = resolveUnicode({
		argv,
		isDumb,
		usesPlain,
	});

	return {
		colour,
		isCi,
		isDumb,
		isTty,
		unicode,
		width,
	};
}

/**
 * Resolve colour support from explicit flags and terminal state.
 *
 * @param  {object}  options
 *     Colour resolution inputs.
 * @returns  {boolean}
 *     Whether coloured output should be used.
 */
function resolveColour(options) {
	if (
		options.usesPlain ||
		options.argv.includes("--no-colour") ||
		options.argv.includes("--no-color") ||
		options.env.NO_COLOR !== undefined ||
		options.isDumb
	) {
		return false;
	}

	return options.isTty;
}

/**
 * Resolve Unicode support from explicit flags and terminal state.
 *
 * @param  {object}  options
 *     Unicode resolution inputs.
 * @returns  {boolean}
 *     Whether Unicode symbols should be used.
 */
function resolveUnicode(options) {
	if (options.usesPlain || options.argv.includes("--no-unicode") || options.isDumb) {
		return false;
	}

	return true;
}

/**
 * Resolve terminal width with a stable fallback.
 *
 * @param  {number}  width
 *     Stream-reported column count.
 * @returns  {number}
 *     Usable terminal width.
 */
function resolveWidth(width) {
	if (Number.isInteger(width) && width > 0) {
		return width;
	}

	return defaultWidth;
}
