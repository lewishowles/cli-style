import Foundation
#if canImport(Darwin)
import Darwin
#elseif canImport(Glibc)
import Glibc
#endif

// Error types for cli-style adapter failures.
enum CliStyleError: Error {
	case notFound(String)
	case renderFailed(String)
	case invalidInput(String)
}

// Options for controlling cli-style render behaviour.
struct CliStyleOptions {
	// Binary path or command name.
	var binary: String = "cli-style"

	// Profile name such as human, agent, or json.
	var profile: String? = nil

	// Terminal width in characters.
	var width: Int? = nil

	// Force plain text output.
	var isPlain: Bool = false

	// Disable colour output.
	var isNoColour: Bool = false

	// Disable Unicode symbols.
	var isNoUnicode: Bool = false

	// Additional arguments passed through to the binary.
	var extraArgs: [String] = []
}

// Render caller data through the shared cli-style binary.
enum CliStyle {

	/**
	 Render a dictionary through `cli-style render`.

	 - parameter renderer: Stable renderer name accepted by `cli-style render`.
	 - parameter data: JSON-serialisable renderer input.
	 - parameter options: Render options including binary path and output flags.
	 - returns: Rendered string output from cli-style.
	 - throws: `CliStyleError` if the binary is missing, input is invalid, or rendering fails.
	 */
	static func render(
		_ renderer: String,
		data: [String: Any],
		options: CliStyleOptions = .init()
	) throws -> String {
		if renderer.isEmpty {
			throw CliStyleError.invalidInput("renderer must be a non-empty string")
		}

		let resolvedBinary = try resolveBinary(options.binary)

		let jsonData: Data

		do {
			jsonData = try JSONSerialization.data(withJSONObject: data)
		} catch {
			throw CliStyleError.invalidInput("data is not JSON-serialisable")
		}

		var arguments = ["render", renderer]

		if let profile = options.profile {
			arguments += ["--profile", profile]
		}

		if let width = options.width {
			arguments += ["--width", String(width)]
		}

		if options.isPlain {
			arguments.append("--plain")
		}

		if options.isNoColour {
			arguments.append("--no-colour")
		}

		if options.isNoUnicode {
			arguments.append("--no-unicode")
		}

		arguments += options.extraArgs

		let process = Process()
		process.executableURL = URL(fileURLWithPath: resolvedBinary)
		process.arguments = arguments
		process.environment = resolveProcessEnvironment()

		let stdinPipe = Pipe()
		let stdoutPipe = Pipe()
		let stderrPipe = Pipe()
		process.standardInput = stdinPipe
		process.standardOutput = stdoutPipe
		process.standardError = stderrPipe

		do {
			try process.run()
		} catch {
			throw CliStyleError.renderFailed("failed to launch cli-style: \(error.localizedDescription)")
		}

		stdinPipe.fileHandleForWriting.write(jsonData)
		stdinPipe.fileHandleForWriting.closeFile()

		process.waitUntilExit()

		let stdoutData = stdoutPipe.fileHandleForReading.readDataToEndOfFile()
		let stderrData = stderrPipe.fileHandleForReading.readDataToEndOfFile()

		if process.terminationStatus != 0 {
			let stderrText = String(data: stderrData, encoding: .utf8)?
				.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
			let message = stderrText.isEmpty
				? "cli-style render failed with exit code \(process.terminationStatus)"
				: stderrText

			throw CliStyleError.renderFailed(message)
		}

		let stdoutText = String(data: stdoutData, encoding: .utf8) ?? ""
		return stdoutText.trimmingCharacters(in: .newlines)
	}

	/**
	 * Resolve the child environment for a captured render.
	 */
	private static func resolveProcessEnvironment() -> [String: String] {
		var environment = ProcessInfo.processInfo.environment

		if isatty(STDOUT_FILENO) == 1 &&
			environment["FORCE_COLOR"] == nil &&
			environment["NO_COLOR"] == nil {
			environment["FORCE_COLOR"] = "1"
		}

		return environment
	}

	/**
	 Render a result status line.

	 - parameter type: Result type such as success, failed, warning, or skipped.
	 - parameter label: Status label.
	 - parameter detail: Optional detail text.
	 - parameter options: Render options.
	 - returns: Rendered status line.
	 - throws: `CliStyleError` on failure.
	 */
	static func status(
		type: String,
		label: String = "",
		detail: String = "",
		options: CliStyleOptions = .init()
	) throws -> String {
		try render("status", data: [
			"type": type,
			"label": label,
			"detail": detail,
		], options: options)
	}

	/**
	 Render a labelled value row.

	 - parameter label: Row label.
	 - parameter value: Row value.
	 - parameter result: Optional result type for a symbol and tone.
	 - parameter labelWidth: Optional minimum label width.
	 - parameter labelColour: Optional label colour token.
	 - parameter valueColour: Optional value colour token.
	 - parameter separator: Optional text between the label and value.
	 - parameter options: Render options.
	 - returns: Rendered row line.
	 - throws: `CliStyleError` on failure.
	 */
	static func row(
		label: String,
		value: String,
		result: String = "",
		labelWidth: Int? = nil,
		labelColour: String? = nil,
		valueColour: String? = nil,
		separator: String? = nil,
		options: CliStyleOptions = .init()
	) throws -> String {
		var data: [String: Any] = [
			"label": label,
			"value": value,
			"result": result,
		]

		if let labelWidth = labelWidth {
			data["labelWidth"] = labelWidth
		}

		if let labelColour = labelColour {
			data["labelColour"] = labelColour
		}

		if let valueColour = valueColour {
			data["valueColour"] = valueColour
		}

		if let separator = separator {
			data["separator"] = separator
		}

		return try render("row", data: data, options: options)
	}

	/**
	 Render an inline span.

	 - parameter value: Span text.
	 - parameter tone: Optional colour tone, defaulting to info.
	 - parameter weight: Optional ANSI text weight.
	 - parameter options: Render options.
	 - returns: Rendered span string.
	 - throws: `CliStyleError` on failure.
	 */
	static func span(
		value: String,
		tone: String = "info",
		weight: String? = nil,
		options: CliStyleOptions = .init()
	) throws -> String {
		var data: [String: Any] = [
			"value": value,
			"tone": tone,
		]

		if let weight = weight {
			data["weight"] = weight
		}

		return try render("span", data: data, options: options)
	}

	/**
	 Render a divider.

	 - parameter label: Optional divider label.
	 - parameter dividerWidth: Optional divider width.
	 - parameter dividerColour: Optional divider colour token.
	 - parameter labelColour: Optional label colour token.
	 - parameter options: Render options.
	 - returns: Rendered divider line.
	 - throws: `CliStyleError` on failure.
	 */
	static func divider(
		label: String = "",
		dividerWidth: Int? = nil,
		dividerColour: String? = nil,
		labelColour: String? = nil,
		options: CliStyleOptions = .init()
	) throws -> String {
		var data: [String: Any] = [
			"label": label,
		]

		if let dividerWidth = dividerWidth {
			data["dividerWidth"] = dividerWidth
		}

		if let dividerColour = dividerColour {
			data["dividerColour"] = dividerColour
		}

		if let labelColour = labelColour {
			data["labelColour"] = labelColour
		}

		return try render("divider", data: data, options: options)
	}

	/**
	 Render a hint.

	 - parameter message: Hint message.
	 - parameter options: Render options.
	 - returns: Rendered hint line.
	 - throws: `CliStyleError` on failure.
	 */
	static func hint(
		message: String,
		options: CliStyleOptions = .init()
	) throws -> String {
		try render("hint", data: [
			"message": message,
		], options: options)
	}

	/**
	 Render a command result pattern.

	 - parameter result: Result type such as success, failed, warning, or skipped.
	 - parameter summary: Summary line.
	 - parameter command: Optional command text.
	 - parameter exitCode: Optional integer exit code.
	 - parameter duration: Optional duration text.
	 - parameter detail: Optional detail line.
	 - parameter options: Render options.
	 - returns: Rendered command result block.
	 - throws: `CliStyleError` on failure.
	 */
	static func commandResult(
		result: String,
		summary: String,
		command: String = "",
		exitCode: Int? = nil,
		duration: String = "",
		detail: String = "",
		options: CliStyleOptions = .init()
	) throws -> String {
		var data: [String: Any] = [
			"result": result,
			"summary": summary,
			"command": command,
			"duration": duration,
			"details": detail.isEmpty ? [] : [detail],
		]

		// JSONSerialization needs NSNull for explicit null values.
		if let exitCode = exitCode {
			data["exitCode"] = exitCode
		} else {
			data["exitCode"] = NSNull()
		}

		return try render("command-result", data: data, options: options)
	}

	/**
	 Render an audit finding pattern.

	 - parameter result: Result type such as success, failed, warning, or skipped.
	 - parameter finding: Finding summary.
	 - parameter location: Optional source location.
	 - parameter recommendation: Optional recommendation text.
	 - parameter evidence: Optional evidence line.
	 - parameter reference: Optional reference line.
	 - parameter options: Render options.
	 - returns: Rendered audit finding block.
	 - throws: `CliStyleError` on failure.
	 */
	static func auditFinding(
		result: String,
		finding: String,
		location: String = "",
		recommendation: String = "",
		evidence: String = "",
		reference: String = "",
		options: CliStyleOptions = .init()
	) throws -> String {
		try render("audit-finding", data: [
			"result": result,
			"finding": finding,
			"location": location,
			"recommendation": recommendation,
			"evidence": evidence.isEmpty ? [] : [evidence],
			"references": reference.isEmpty ? [] : [reference],
		], options: options)
	}

	/**
	 Render a task summary pattern.

	 - parameter result: Result type such as success, failed, warning, or skipped.
	 - parameter task: Task label.
	 - parameter summary: Optional summary detail.
	 - parameter completed: Optional completed item.
	 - parameter remaining: Optional remaining item.
	 - parameter options: Render options.
	 - returns: Rendered task summary block.
	 - throws: `CliStyleError` on failure.
	 */
	static func taskSummary(
		result: String,
		task: String,
		summary: String = "",
		completed: String = "",
		remaining: String = "",
		options: CliStyleOptions = .init()
	) throws -> String {
		try render("task-summary", data: [
			"result": result,
			"task": task,
			"summary": summary,
			"completed": completed.isEmpty ? [] : [completed],
			"remaining": remaining.isEmpty ? [] : [remaining],
		], options: options)
	}

	/**
	 Render a confirmation result pattern.

	 - parameter state: Confirmation state such as confirmed, cancelled, or skipped.
	 - parameter action: Action label.
	 - parameter item: Optional item label.
	 - parameter detail: Optional detail text.
	 - parameter options: Render options.
	 - returns: Rendered confirmation result block.
	 - throws: `CliStyleError` on failure.
	 */
	static func confirmationResult(
		state: String,
		action: String,
		item: String = "",
		detail: String = "",
		options: CliStyleOptions = .init()
	) throws -> String {
		try render("confirmation-result", data: [
			"state": state,
			"action": action,
			"item": item,
			"detail": detail,
		], options: options)
	}

	/**
	 Render a next-step block pattern.

	 - parameter nextStep: Next step text.
	 - parameter reason: Optional reason text.
	 - parameter command: Optional command line.
	 - parameter alternative: Optional alternative line.
	 - parameter options: Render options.
	 - returns: Rendered next-step block.
	 - throws: `CliStyleError` on failure.
	 */
	static func nextStepBlock(
		nextStep: String,
		reason: String = "",
		command: String = "",
		alternative: String = "",
		options: CliStyleOptions = .init()
	) throws -> String {
		try render("next-step-block", data: [
			"next": nextStep,
			"reason": reason,
			"commands": command.isEmpty ? [] : [command],
			"alternatives": alternative.isEmpty ? [] : [alternative],
		], options: options)
	}

	/**
	 Resolve a command name or executable path for subprocess use.

	 - parameter binary: Binary path or command name.
	 - returns: Resolved executable path.
	 - throws: `CliStyleError.notFound` if the binary cannot be found.
	 */
	static func resolveBinary(_ binary: String) throws -> String {
		if binary.contains("/") {
			if FileManager.default.isExecutableFile(atPath: binary) {
				return binary
			}
			throw CliStyleError.notFound("cli-style binary not found: \(binary)")
		}

		let path = ProcessInfo.processInfo.environment["PATH"] ?? ""

		for directory in path.split(separator: ":") {
			let candidate = "\(directory)/\(binary)"
			if FileManager.default.isExecutableFile(atPath: candidate) {
				return candidate
			}
		}

		throw CliStyleError.notFound("cli-style binary not found: \(binary)")
	}
}
