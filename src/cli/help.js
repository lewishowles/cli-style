// Help text for the package binary.
const helpLines = [
	"cli-style",
	"",
	"Usage:",
	"  cli-style --help",
	"  cli-style gallery [variant] [options]",
	"",
	"Commands:",
	"  gallery    Print the read-only style gallery.",
	"",
	"Gallery variants:",
	"  current, no-colour, no-unicode, plain",
	"",
	"Options:",
	"  --section <name>    Show primitives or patterns.",
	"  --fixture <name>    Show one named pattern fixture.",
	"  --profile <name>    Render with a text profile.",
	"  --width <columns>   Render with a fixed terminal width.",
	"  --interactive       Select a section or fixture with fzf when available.",
	"  --matrix            Show every capability variant.",
	"  -h, --help          Show this help.",
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
