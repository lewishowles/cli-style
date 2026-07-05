import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Adapter paths returned for shell and Python wrapper setup.
const adapterPaths = {
	bash: {
		releasePath: "adapters/bash/cli-style.sh",
		sourceUrl: new URL("../../adapters/bash/cli-style.sh", import.meta.url),
	},
	python: {
		releasePath: "adapters/python",
		sourceUrl: new URL("../../adapters/python", import.meta.url),
	},
	swift: {
		releasePath: "adapters/swift/CliStyle.swift",
		sourceUrl: new URL("../../adapters/swift/CliStyle.swift", import.meta.url),
	},
};

// Adapter names accepted by the adapter-path command.
export const adapterNames = Object.keys(adapterPaths);

/**
 * Parse adapter-path command arguments.
 *
 * @param  {string[]}  args
 *     Arguments after the adapter-path command.
 * @returns  {object}
 *     Adapter path request.
 */
export function parseAdapterPathRequest(args = []) {
	const request = {
		adapter: args[0],
	};

	validateRequest(request, args);

	return request;
}

/**
 * Render the filesystem path for an adapter.
 *
 * @param  {object}  request
 *     Parsed adapter path request.
 * @returns  {string}
 *     Adapter file or directory path.
 */
export function renderAdapterPath(request) {
	const adapterPath = adapterPaths[request.adapter];
	const sourcePath = fileURLToPath(adapterPath.sourceUrl);

	if (existsSync(sourcePath)) {
		return sourcePath;
	}

	return join(dirname(process.execPath), "..", adapterPath.releasePath);
}

/**
 * Validate adapter-path request values.
 *
 * @param  {object}  request
 *     Parsed adapter path request.
 * @param  {string[]}  args
 *     Raw command arguments.
 * @returns  {void}
 */
function validateRequest(request, args) {
	if (request.adapter === undefined) {
		throw new Error("Missing adapter");
	}

	if (!Object.hasOwn(adapterPaths, request.adapter)) {
		throw new Error(`Unknown adapter: ${request.adapter}`);
	}

	if (args.length > 1) {
		throw new Error(`Unexpected adapter-path argument: ${args[1]}`);
	}
}
