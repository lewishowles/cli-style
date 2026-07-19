import { isTheme, themes } from "../theme/colours.js";

// Default terminal width when no stream width is available.
const defaultWidth = 80;

// Known terminal signals support a conservative dark palette when no theme is explicit.
const terminalThemeSignals = ["COLORTERM", "TERM_PROGRAM"];

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
	const forceColour = env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== "0";
	const width = resolveWidth(stdout.columns);
	const usesPlain = argv.includes("--plain");

	const colour = resolveColour({
		argv,
		env,
		forceColour,
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
		theme: resolveTheme({
			argv,
			env,
			theme: options.theme,
		}),
		unicode,
		width,
	};
}

/**
 * Resolve a terminal theme from explicit overrides and terminal signals.
 *
 * @param  {object}  options
 *     Theme resolution inputs.
 * @returns  {string}
 *     Resolved light or dark theme.
 */
export function resolveTheme(options = {}) {
	const flagTheme = readThemeFlag(options.argv ?? []);

	if (flagTheme !== undefined) {
		return flagTheme;
	}

	if (isTheme(options.theme) && options.theme !== themes.AUTO) {
		return options.theme;
	}

	const colourFgBgTheme = resolveColourFgBgTheme(options.env?.COLORFGBG);

	if (colourFgBgTheme !== themes.AUTO) {
		return colourFgBgTheme;
	}

	return resolveTerminalSignalTheme(options.env) ?? themes.DARK;
}

/**
 * Resolve a conservative theme from best-effort terminal signals.
 *
 * @param  {object}  env
 *     Environment values to inspect.
 * @returns  {string|undefined}
 *     Dark theme when a known terminal signal is present.
 */
function resolveTerminalSignalTheme(env = {}) {
	if (terminalThemeSignals.some((signal) => env[signal])) {
		return themes.DARK;
	}

	return undefined;
}

/**
 * Resolve known COLORFGBG background slots without guessing custom palettes.
 *
 * @param  {string}  colourFgBg
 *     Terminal foreground and background capability string.
 * @returns  {string}
 *     Resolved light, dark, or automatic theme.
 */
function resolveColourFgBgTheme(colourFgBg) {
	const background = colourFgBg?.split(";").at(-1);

	if (background === "0" || background === "8") {
		return themes.DARK;
	}

	if (background === "7" || background === "15") {
		return themes.LIGHT;
	}

	return themes.AUTO;
}

/**
 * Read the final explicit theme flag so later command arguments can override earlier ones.
 *
 * @param  {string[]}  argv
 *     CLI arguments to inspect.
 * @returns  {string|undefined}
 *     Explicit theme when present.
 */
function readThemeFlag(argv) {
	let theme;

	for (const argument of argv) {
		if (argument === "--dark") {
			theme = themes.DARK;
		} else if (argument === "--light") {
			theme = themes.LIGHT;
		}
	}

	return theme;
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

	return options.forceColour || options.isTty;
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
