// Help text for the package binary.
const helpLines = [
	"cli-style",
	"",
	"Usage:",
	"  cli-style --help",
	"  cli-style adapter-path bash|python",
	"  cli-style list [options]",
	"  cli-style describe <renderer> [options]",
	"  cli-style gallery [variant] [options]",
	"  cli-style render <renderer> [options] < input.json",
	"",
	"Commands:",
	"  adapter-path    Print a Bash or Python adapter path.",
	"  gallery    Print the read-only style gallery.",
	"  list       List available primitives and patterns.",
	"  describe   Describe one renderer and its input fields.",
	"  render     Render caller-provided JSON from stdin.",
	"",
	"Gallery variants:",
	"  current, no-colour, no-unicode, plain",
	"",
	"Options:",
	"  --light, --dark     Override automatic terminal-theme detection.",
	"  --section <name>    Show primitives or patterns.",
	"  --fixture <name>    Show one named pattern fixture.",
	"  --profile <name>    Render with a text profile.",
	"  --width <columns>   Render with a fixed terminal width.",
	"  --interactive       Select a section or fixture with fzf when available.",
	"  --variants          Show every capability variant.",
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
