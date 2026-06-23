import { resolveProfile } from "./capability/resolve-profile.js";
import { resolveTerminalCapabilities } from "./capability/terminal.js";
import { profiles } from "./profiles/profiles.js";

/**
 * Create a CLI style renderer with stable, testable defaults.
 *
 * @param  {object}  options
 *     Output profile, terminal capability, stream, environment, and width options.
 * @returns  {object}
 *     Renderer helpers and resolved options.
 */
export function createCliStyle(options = {}) {
	const capabilities = resolveTerminalCapabilities(options);

	const resolvedOptions = {
		...capabilities,
		profile: resolveProfile(options),
	};

	applyExplicitOption(resolvedOptions, options, "colour");
	applyExplicitOption(resolvedOptions, options, "unicode");
	applyExplicitOption(resolvedOptions, options, "width");

	return {
		options: resolvedOptions,
		print: (value) => {
			console.log(value);
		},
		write: (value) => {
			process.stdout.write(value);
		},
	};
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
