import { profiles } from "../profiles/profiles.js";
import { status } from "../primitives/status.js";
import { resultTypes } from "../theme/results.js";
import { formatLabel, isNonEmptyString, isRecord, renderSection, renderTitle } from "./helpers.js";

// Confirmation states map workflow outcomes onto shared result semantics.
const confirmationStates = {
	cancelled: {
		label: "Cancelled",
		result: resultTypes.SKIPPED,
	},
	confirmed: {
		label: "Confirmed",
		result: resultTypes.SUCCESS,
	},
	declined: {
		label: "Declined",
		result: resultTypes.WARNING,
	},
	failed: {
		label: "Failed",
		result: resultTypes.FAILED,
	},
};

// Unsupported confirmation states remain visibly unknown.
const fallbackState = {
	label: "Unknown",
	result: resultTypes.UNKNOWN,
};

// Confirmation results use a stable title when the caller does not provide one.
const defaultTitle = "Confirmation result";

/**
 * Render one confirmation workflow outcome.
 *
 * @param  {object}  confirmation
 *     Structured confirmation result.
 * @param  {string}  confirmation.action
 *     Action requested or completed.
 * @param  {string}  confirmation.detail
 *     Supporting outcome detail.
 * @param  {string}  confirmation.item
 *     Affected item.
 * @param  {string}  confirmation.state
 *     Confirmation state.
 * @param  {string}  confirmation.title
 *     Pattern title.
 * @param  {object}  options
 *     Rendering options.
 * @returns  {object|string}
 *     Structured JSON input or rendered confirmation result.
 */
export function confirmationResult(confirmation, options = {}) {
	if (options.profile === profiles.JSON) {
		return confirmation;
	}

	if (!isRecord(confirmation)) {
		return "";
	}

	const title = isNonEmptyString(confirmation.title) ? confirmation.title : defaultTitle;
	const action = isNonEmptyString(confirmation.action) ? confirmation.action : "";
	const summary = formatLabel(action, confirmation.item, options);
	const state = confirmationStates[confirmation.state] ?? fallbackState;

	const detail = isNonEmptyString(confirmation.detail)
		? renderSection("Detail", [confirmation.detail], options, false)
		: "";

	const sections = [
		status(state.result, summary, {
			...options,
			label: state.label,
		}),
		detail,
	].filter((section) => section !== "");

	return [renderTitle(title, options), ...sections].join("\n\n");
}
