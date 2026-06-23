import {
	isProfile,
	profiles,
} from "../profiles/profiles.js";

/**
 * Resolve the active output profile from explicit options, flags, and environment.
 *
 * @param  {object}  options
 *     Profile resolution inputs.
 * @param  {string}  options.profile
 *     Explicit profile name.
 * @param  {string[]}  options.argv
 *     CLI arguments to inspect.
 * @param  {object}  options.env
 *     Environment values to inspect.
 * @returns  {string}
 *     Resolved profile name.
 */
export function resolveProfile(options = {}) {
	const argv = options.argv ?? [];
	const env = options.env ?? {};

	if (argv.includes("--json")) {
		return profiles.JSON;
	}

	if (argv.includes("--plain")) {
		return profiles.PLAIN;
	}

	const flagProfile = readProfileFlag(argv);

	if (flagProfile !== null) {
		return isProfile(flagProfile) ? flagProfile : profiles.HUMAN;
	}

	if (isProfile(options.profile)) {
		return options.profile;
	}

	if (env.CI === "true" || env.CI === "1") {
		return profiles.CI;
	}

	return profiles.HUMAN;
}

/**
 * Read `--profile value` or `--profile=value` from CLI args.
 *
 * @param  {string[]}  argv
 *     CLI arguments to inspect.
 * @returns  {string|null}
 *     Profile flag value when present.
 */
function readProfileFlag(argv) {
	const profilePrefix = "--profile=";
	const inlineProfile = argv.find((arg) => arg.startsWith(profilePrefix));

	if (inlineProfile !== undefined) {
		return inlineProfile.slice(profilePrefix.length);
	}

	const profileFlagIndex = argv.indexOf("--profile");

	if (profileFlagIndex === -1) {
		return null;
	}

	return argv[profileFlagIndex + 1] ?? "";
}
