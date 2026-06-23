#!/usr/bin/env bun

import { createCliStyle, renderGallery, renderHelp } from "../src/index.js";

// Command-line arguments passed to the package binary.
const args = process.argv.slice(2);

// First positional command requested by the caller.
const command = args[0];

// Renderer configured from the current terminal.
const ui = createCliStyle({
	argv: args,
	env: process.env,
	stdout: process.stdout,
});

/**
 * Print text with a trailing newline.
 *
 * @param  {string}  value
 *     Text to print.
 * @returns  {void}
 */
function print(value) {
	console.log(value);
}

if (command === undefined || command === "--help" || command === "-h") {
	print(renderHelp());
} else if (command === "gallery") {
	print(renderGallery(ui.options));
} else {
	console.error(`Unknown command: ${command}`);
	console.error("");
	console.error(renderHelp());
	process.exitCode = 1;
}
