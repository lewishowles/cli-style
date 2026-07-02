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

# Escape a Bash string for JSON string values.
#
# @param  {string}  value
#     String value to encode.
cli_style_json_string() {
	local value="${1:-}"

	value="${value//\\/\\\\}"
	value="${value//\"/\\\"}"
	value="${value//$'\b'/\\b}"
	value="${value//$'\f'/\\f}"
	value="${value//$'\n'/\\n}"
	value="${value//$'\r'/\\r}"
	value="${value//$'\t'/\\t}"

	printf '"%s"' "$value"
}

# Render a JSON object through the shared cli-style command.
#
# @param  {string}  renderer
#     Stable renderer name accepted by `cli-style render`.
# @param  {string}  json
#     Prebuilt JSON object.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_render_json() {
	local renderer="${1:-}"
	local json="${2:-}"

	shift 2
	printf '%s\n' "$json" | cli_style_render "$renderer" "$@"
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

# Render a result status line from Bash string values.
#
# @param  {string}  type
#     Result type such as success, failed, warning, or skipped.
# @param  {string}  label
#     Status label.
# @param  {string}  detail
#     Optional detail text.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_status() {
	local type="${1:-}"
	local label="${2:-}"
	local detail="${3:-}"
	local json

	if (($# >= 3)); then
		shift 3
	else
		set --
	fi

	json="{\"type\":$(cli_style_json_string "$type"),\"label\":$(cli_style_json_string "$label"),\"detail\":$(cli_style_json_string "$detail")}"

	cli_style_render_json status "$json" "$@"
}

# Render a labelled value row from Bash string values.
#
# @param  {string}  label
#     Row label.
# @param  {string}  value
#     Row value.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_row() {
	local label="${1:-}"
	local value="${2:-}"
	local json

	if (($# >= 2)); then
		shift 2
	else
		set --
	fi

	json="{\"label\":$(cli_style_json_string "$label"),\"value\":$(cli_style_json_string "$value")}"

	cli_style_render_json row "$json" "$@"
}

# Render a divider from a Bash string value.
#
# @param  {string}  label
#     Optional divider label.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_divider() {
	local label="${1:-}"
	local json

	if (($# >= 1)); then
		shift
	else
		set --
	fi

	json="{\"label\":$(cli_style_json_string "$label")}"

	cli_style_render_json divider "$json" "$@"
}

# Render a hint from a Bash string value.
#
# @param  {string}  message
#     Hint message.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_hint() {
	local message="${1:-}"
	local json

	if (($# >= 1)); then
		shift
	else
		set --
	fi

	json="{\"message\":$(cli_style_json_string "$message")}"

	cli_style_render_json hint "$json" "$@"
}
