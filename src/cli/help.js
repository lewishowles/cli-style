// Help text for the package binary.
const helpLines = [
	"cli-style",
	"",
	"Usage:",
	"  cli-style --help",
	"  cli-style gallery",
	"",
	"Commands:",
	"  gallery    Print the read-only style gallery placeholder.",
	"",
	"Options:",
	"  -h, --help    Show this help.",
];

/**
 * Render command help text.
 *
 * @returns  {string}
 *     CLI help output.
 */
export function renderHelp() {
	return helpLines.join("\n");
}
