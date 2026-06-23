// Supported output profiles for terminal rendering.
export const profiles = {
	AGENT: "agent",
	CI: "ci",
	DIAGNOSTIC: "diagnostic",
	HUMAN: "human",
	JSON: "json",
	PLAIN: "plain",
};

// Profile names accepted by public APIs and CLI flags.
const profileValues = new Set(Object.values(profiles));

/**
 * Check whether a profile name is supported.
 *
 * @param  {string}  profile
 *     Profile name to check.
 * @returns  {boolean}
 *     Whether the profile is supported.
 */
export function isProfile(profile) {
	return profileValues.has(profile);
}
