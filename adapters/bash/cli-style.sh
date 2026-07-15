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

# Escape Bash strings for a JSON string array.
#
# @param  {string}  ...
#     String values to encode. Empty values are skipped.
cli_style_json_string_array() {
	local item
	local separator=""

	printf '['

	for item in "$@"; do
		if [[ "$item" != "" ]]; then
			printf '%s' "$separator"
			cli_style_json_string "$item"
			separator=","
		fi
	done

	printf ']'
}

# Render a Bash value as a JSON integer or null.
#
# @param  {string}  value
#     Integer value to encode.
cli_style_json_integer_or_null() {
	local value="${1:-}"

	if [[ "$value" =~ ^-?[0-9]+$ ]]; then
		printf '%s' "$value"
	else
		printf 'null'
	fi
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
# @param  {string}  result
#     Optional result type before render flags.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_row() {
	local label="${1:-}"
	local value="${2:-}"
	local result=""
	local label_width=""
	local label_colour_json="null"
	local value_colour_json="null"
	local separator_json="null"
	local -a render_args=()
	local json

	if (($# >= 3)) && [[ "${3:-}" != --* ]]; then
		result="${3:-}"
		shift 3
	elif (($# >= 2)); then
		shift 2
	else
		set --
	fi

	while (($# > 0)); do
		case "$1" in
			--label-width)
				label_width="${2:-}"
				shift 2
				;;
			--label-width=*)
				label_width="${1#*=}"
				shift
				;;
			--label-colour)
				label_colour_json="$(cli_style_json_string "${2:-}")"
				shift 2
				;;
			--label-colour=*)
				label_colour_json="$(cli_style_json_string "${1#*=}")"
				shift
				;;
			--value-colour)
				value_colour_json="$(cli_style_json_string "${2:-}")"
				shift 2
				;;
			--value-colour=*)
				value_colour_json="$(cli_style_json_string "${1#*=}")"
				shift
				;;
			--separator)
				separator_json="$(cli_style_json_string "${2:-}")"
				shift 2
				;;
			--separator=*)
				separator_json="$(cli_style_json_string "${1#*=}")"
				shift
				;;
			*)
				render_args+=("$1")
				shift
				;;
		esac
	done

	json="{\"label\":$(cli_style_json_string "$label"),\"value\":$(cli_style_json_string "$value"),\"result\":$(cli_style_json_string "$result"),\"labelWidth\":$(cli_style_json_integer_or_null "$label_width"),\"separator\":$separator_json"

	if [[ "$label_colour_json" != "null" ]]; then
		json="${json},\"labelColour\":$label_colour_json"
	fi

	if [[ "$value_colour_json" != "null" ]]; then
		json="${json},\"valueColour\":$value_colour_json"
	fi

	json="${json}}"

	cli_style_render_json row "$json" "${render_args[@]}"
}

# Render an inline span from Bash string values.
#
# @param  {string}  value
#     Span text.
# @param  {string}  tone
#     Optional colour tone.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_span() {
	local value="${1:-}"
	local tone="info"
	local weight_json="null"
	local -a render_args=()
	local json

	if (($# >= 2)) && [[ "${2:-}" != --* ]]; then
		tone="${2:-}"
		shift 2
	elif (($# >= 1)); then
		shift
	else
		set --
	fi

	while (($# > 0)); do
		case "$1" in
			--weight)
				weight_json="$(cli_style_json_string "${2:-}")"
				shift 2
				;;
			--weight=*)
				weight_json="$(cli_style_json_string "${1#*=}")"
				shift
				;;
			*)
				render_args+=("$1")
				shift
				;;
		esac
	done

	json="{\"value\":$(cli_style_json_string "$value"),\"tone\":$(cli_style_json_string "$tone"),\"weight\":$weight_json}"

	cli_style_render_json span "$json" "${render_args[@]}"
}

# Render a divider from a Bash string value.
#
# @param  {string}  label
#     Optional divider label.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_divider() {
	local label="${1:-}"
	local divider_width=""
	local divider_colour_json="null"
	local label_colour_json="null"
	local -a render_args=()
	local json

	if (($# >= 1)); then
		shift
	else
		set --
	fi

	while (($# > 0)); do
		case "$1" in
			--divider-width)
				divider_width="${2:-}"
				shift 2
				;;
			--divider-width=*)
				divider_width="${1#*=}"
				shift
				;;
			--divider-colour)
				divider_colour_json="$(cli_style_json_string "${2:-}")"
				shift 2
				;;
			--divider-colour=*)
				divider_colour_json="$(cli_style_json_string "${1#*=}")"
				shift
				;;
			--label-colour)
				label_colour_json="$(cli_style_json_string "${2:-}")"
				shift 2
				;;
			--label-colour=*)
				label_colour_json="$(cli_style_json_string "${1#*=}")"
				shift
				;;
			*)
				render_args+=("$1")
				shift
				;;
		esac
	done

	json="{\"label\":$(cli_style_json_string "$label"),\"dividerWidth\":$(cli_style_json_integer_or_null "$divider_width")"

	if [[ "$divider_colour_json" != "null" ]]; then
		json="${json},\"dividerColour\":$divider_colour_json"
	fi

	if [[ "$label_colour_json" != "null" ]]; then
		json="${json},\"labelColour\":$label_colour_json"
	fi

	json="${json}}"

	cli_style_render_json divider "$json" "${render_args[@]}"
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

# Render a command result pattern from Bash string values.
#
# @param  {string}  result
#     Result type such as success, failed, warning, or skipped.
# @param  {string}  summary
#     Summary line.
# @param  {string}  command
#     Optional command text.
# @param  {string}  exit_code
#     Optional integer exit code.
# @param  {string}  duration
#     Optional duration text.
# @param  {string}  detail
#     Optional detail line.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_command_result() {
	local result="${1:-}"
	local summary="${2:-}"
	local command="${3:-}"
	local exit_code="${4:-}"
	local duration="${5:-}"
	local detail="${6:-}"
	local json

	if (($# >= 6)); then
		shift 6
	else
		set --
	fi

	json="{\"result\":$(cli_style_json_string "$result"),\"summary\":$(cli_style_json_string "$summary"),\"command\":$(cli_style_json_string "$command"),\"exitCode\":$(cli_style_json_integer_or_null "$exit_code"),\"duration\":$(cli_style_json_string "$duration"),\"details\":$(cli_style_json_string_array "$detail")}"

	cli_style_render_json command-result "$json" "$@"
}

# Render an audit finding pattern from Bash string values.
#
# @param  {string}  result
#     Result type such as success, failed, warning, or skipped.
# @param  {string}  finding
#     Finding summary.
# @param  {string}  location
#     Optional source location.
# @param  {string}  recommendation
#     Optional recommendation text.
# @param  {string}  evidence
#     Optional evidence line.
# @param  {string}  reference
#     Optional reference line.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_audit_finding() {
	local result="${1:-}"
	local finding="${2:-}"
	local location="${3:-}"
	local recommendation="${4:-}"
	local evidence="${5:-}"
	local reference="${6:-}"
	local json

	if (($# >= 6)); then
		shift 6
	else
		set --
	fi

	json="{\"result\":$(cli_style_json_string "$result"),\"finding\":$(cli_style_json_string "$finding"),\"location\":$(cli_style_json_string "$location"),\"recommendation\":$(cli_style_json_string "$recommendation"),\"evidence\":$(cli_style_json_string_array "$evidence"),\"references\":$(cli_style_json_string_array "$reference")}"

	cli_style_render_json audit-finding "$json" "$@"
}

# Render a task summary pattern from Bash string values.
#
# @param  {string}  result
#     Result type such as success, failed, warning, or skipped.
# @param  {string}  task
#     Task label.
# @param  {string}  summary
#     Optional summary detail.
# @param  {string}  completed
#     Optional completed item.
# @param  {string}  remaining
#     Optional remaining item.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_task_summary() {
	local result="${1:-}"
	local task="${2:-}"
	local summary="${3:-}"
	local completed="${4:-}"
	local remaining="${5:-}"
	local json

	if (($# >= 5)); then
		shift 5
	else
		set --
	fi

	json="{\"result\":$(cli_style_json_string "$result"),\"task\":$(cli_style_json_string "$task"),\"summary\":$(cli_style_json_string "$summary"),\"completed\":$(cli_style_json_string_array "$completed"),\"remaining\":$(cli_style_json_string_array "$remaining")}"

	cli_style_render_json task-summary "$json" "$@"
}

# Render a confirmation result pattern from Bash string values.
#
# @param  {string}  state
#     Confirmation state such as confirmed, cancelled, or skipped.
# @param  {string}  action
#     Action label.
# @param  {string}  item
#     Optional item label.
# @param  {string}  detail
#     Optional detail text.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_confirmation_result() {
	local state="${1:-}"
	local action="${2:-}"
	local item="${3:-}"
	local detail="${4:-}"
	local json

	if (($# >= 4)); then
		shift 4
	else
		set --
	fi

	json="{\"state\":$(cli_style_json_string "$state"),\"action\":$(cli_style_json_string "$action"),\"item\":$(cli_style_json_string "$item"),\"detail\":$(cli_style_json_string "$detail")}"

	cli_style_render_json confirmation-result "$json" "$@"
}

# Render a next-step block pattern from Bash string values.
#
# @param  {string}  next
#     Next step text.
# @param  {string}  reason
#     Optional reason text.
# @param  {string}  command
#     Optional command line.
# @param  {string}  alternative
#     Optional alternative line.
# @param  {string}  ...
#     Render flags passed through to `cli-style render`.
cli_style_next_step_block() {
	local next="${1:-}"
	local reason="${2:-}"
	local command="${3:-}"
	local alternative="${4:-}"
	local json

	if (($# >= 4)); then
		shift 4
	else
		set --
	fi

	json="{\"next\":$(cli_style_json_string "$next"),\"reason\":$(cli_style_json_string "$reason"),\"commands\":$(cli_style_json_string_array "$command"),\"alternatives\":$(cli_style_json_string_array "$alternative")}"

	cli_style_render_json next-step-block "$json" "$@"
}
