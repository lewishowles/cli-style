// Supported output profiles for terminal rendering.
export const profiles = {
	AGENT: "agent",
	CI: "ci",
	DIAGNOSTIC: "diagnostic",
	HUMAN: "human",
	JSON: "json",
	PLAIN: "plain",
};

// Default style options used when callers do not provide explicit output constraints.
const defaultOptions = {
	colour: "auto",
	profile: profiles.HUMAN,
	unicode: "auto",
	width: 80,
};

/**
 * Create a CLI style renderer with stable, testable defaults.
 *
 * @param  {object}  options
 *     Output profile, terminal capability, and width options.
 * @returns  {object}
 *     Renderer helpers and resolved options.
 */
export function createCliStyle(options = {}) {
	const resolvedOptions = {
		...defaultOptions,
		...options,
	};

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
