import { resolveProfile } from "./capability/resolve-profile.js";
import { resolveTerminalCapabilities } from "./capability/terminal.js";
import { runSpinner, spinner as startSpinner } from "./interactive/spinner.js";
import { profiles } from "./profiles/profiles.js";
import { createReporter } from "./reporters/create-reporter.js";
import { resolveColourValue } from "./theme/colours.js";
import { renderTextRole } from "./theme/roles.js";

// Direct accent colours use the same six-digit hex form as the ANSI formatter.
const hexColourPattern = /^#[\da-f]{6}$/iu;

/**
 * Create a CLI style renderer with stable, testable defaults.
 *
 * @param  {object}  options
 *     Output profile, terminal capability, stream, environment, width, and accent options.
 *     `accent` takes one colour or a `{ light, dark }` pair, as a theme colour name,
 *     an `ansi-256:N` palette index, or a six-digit hex value.
 * @returns  {object}
 *     Renderer helpers and resolved options.
 * @throws  {TypeError}
 *     When `accent` is not a colour or a complete light and dark pair.
 */
export function createCliStyle(options = {}) {
	const capabilities = resolveTerminalCapabilities(options);

	if (options.accent !== undefined && !isValidAccent(options.accent, capabilities)) {
		throw new TypeError("accent must be a colour or a { light, dark } colour pair");
	}

	const resolvedOptions = {
		...capabilities,
		profile: resolveProfile(options),
	};

	applyExplicitOption(resolvedOptions, options, "accent");
	applyExplicitOption(resolvedOptions, options, "colour");
	applyExplicitOption(resolvedOptions, options, "unicode");
	applyExplicitOption(resolvedOptions, options, "width");

	const spinner = (text, spinnerOptions = {}) =>
		startSpinner(text, {
			...resolvedOptions,
			...spinnerOptions,
		});

	spinner.run = (text, fn, spinnerOptions = {}) =>
		runSpinner(text, fn, {
			...resolvedOptions,
			...spinnerOptions,
		});

	return {
		options: resolvedOptions,
		print: (value) => {
			console.log(value);
		},
		reporter: (reporterOptions = {}) =>
			createReporter({
				...resolvedOptions,
				...reporterOptions,
			}),
		spinner,
		text: (role, value) => renderTextRole(role, value, resolvedOptions),
		write: (value) => {
			process.stdout.write(value);
		},
	};
}

/**
 * Check that an accent resolves to a supported colour on each requested theme.
 *
 * @param  {string|object}  accent
 *     A shared colour or a light and dark colour pair.
 * @param  {object}  options
 *     Resolved terminal options for colour tokens.
 * @returns  {boolean}
 *     Whether both themes can render the accent.
 */
function isValidAccent(accent, options) {
	if (typeof accent === "string") {
		return isValidAccentColour(accent, options);
	}

	return (
		accent !== null &&
		typeof accent === "object" &&
		isValidAccentColour(accent.light, options) &&
		isValidAccentColour(accent.dark, options)
	);
}

/**
 * Check a direct hex or ANSI-256 colour, or an existing colour token, before rendering it.
 *
 * @param  {string}  colour
 *     Accent colour to check.
 * @param  {object}  options
 *     Resolved terminal options for colour tokens.
 * @returns  {boolean}
 *     Whether the formatter can render the colour.
 */
function isValidAccentColour(colour, options) {
	if (typeof colour !== "string") {
		return false;
	}

	return colour.startsWith("#")
		? hexColourPattern.test(colour)
		: resolveColourValue(colour, options) !== null;
}

/**
 * Apply an explicit option override when provided.
 *
 * @param  {object}  target
 *     Resolved options to update.
 * @param  {object}  source
 *     Caller-provided options.
 * @param  {string}  key
 *     Option key to copy.
 * @returns  {void}
 */
function applyExplicitOption(target, source, key) {
	if (Object.hasOwn(source, key)) {
		target[key] = source[key];
	}
}

export { profiles };
