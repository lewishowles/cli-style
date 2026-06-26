# Sourceable Bash helpers for rendering through the cli-style binary.

# Return the configured cli-style binary.
#
# @returns  {string}
#     Binary path or command name.
cli_style_binary() {
	printf '%s\n' "${CLI_STYLE_BIN:-cli-style}"
}

# Returns 0 when a binary can be executed.
#
# @param  {string}  binary
#     Binary path or command name.
cli_style_has_binary() {
	local binary="$1"

	if [[ "$binary" == */* ]]; then
		[[ -x "$binary" ]]
		return
	fi

	command -v "$binary" >/dev/null 2>&1
}

# Render stdin JSON through the shared cli-style command.
#
# @param  {string}  renderer
#     Stable renderer name accepted by `cli-style render`.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_render() {
	local renderer="${1:-}"
	local binary

	if [[ "$renderer" == "" ]]; then
		printf 'Missing renderer\n' >&2
		return 2
	fi

	shift
	binary="$(cli_style_binary)"

	if ! cli_style_has_binary "$binary"; then
		printf 'cli-style binary not found: %s\n' "$binary" >&2
		return 127
	fi

	"$binary" render "$renderer" "$@"
}
