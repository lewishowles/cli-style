import Foundation
#if canImport(Darwin)
import Darwin
#elseif canImport(Glibc)
import Glibc
#endif

/**
 * Errors raised while the cli-style adapter resolves or runs the renderer.
 */
public enum CliStyleError: Error {
	case notFound(String)
	case renderFailed(String)
	case invalidInput(String)
}

/**
 * Options for controlling cli-style render behaviour.
 */
public struct CliStyleOptions {
	// Binary path or command name.
	public var binary: String = "cli-style"

	// Profile name such as human, agent, or json.
	public var profile: String? = nil

	// Terminal width in characters.
	public var width: Int? = nil

	// Force plain text output.
	public var isPlain: Bool = false

	// Disable colour output.
	public var isNoColour: Bool = false

	// Disable Unicode symbols.
	public var isNoUnicode: Bool = false

	// Additional arguments passed through to the binary.
	public var extraArgs: [String] = []

	// Throw when the cli-style binary cannot be found, instead of returning a plain-text rendering of the data.
	public var throwsWhenMissing: Bool = false

	/**
	 * Create render options. Every argument has a default, so callers only pass what they change.
	 */
	public init(
		binary: String = "cli-style",
		profile: String? = nil,
		width: Int? = nil,
		isPlain: Bool = false,
		isNoColour: Bool = false,
		isNoUnicode: Bool = false,
		extraArgs: [String] = [],
		throwsWhenMissing: Bool = false
	) {
		self.binary = binary
		self.profile = profile
		self.width = width
		self.isPlain = isPlain
		self.isNoColour = isNoColour
		self.isNoUnicode = isNoUnicode
		self.extraArgs = extraArgs
		self.throwsWhenMissing = throwsWhenMissing
	}
}

/**
 * Render caller data through the shared cli-style binary.
 */
public enum CliStyle {

	/**
	 Render a dictionary through `cli-style render`.

	 When the binary cannot be found, return a plain-text rendering of the data instead, unless `options.throwsWhenMissing` is set.

	 - parameter renderer: Stable renderer name accepted by `cli-style render`.
	 - parameter data: JSON-serialisable renderer input.
	 - parameter options: Render options including binary path and output flags.
	 - returns: Rendered string output from cli-style.
	 - throws: `CliStyleError` if the binary is missing and `options.throwsWhenMissing` is set, input is invalid, or rendering fails.
	 */
	public static func render(
		_ renderer: String,
		data: [String: Any],
		options: CliStyleOptions = .init()
	) throws -> String {
		if renderer.isEmpty {
			throw CliStyleError.invalidInput("renderer must be a non-empty string")
		}

		let resolvedBinary: String

		do {
			resolvedBinary = try resolveBinary(options.binary)
		} catch CliStyleError.notFound(let message) {
			if options.throwsWhenMissing {
				throw CliStyleError.notFound(message)
			}

			// Swift dictionaries have no order, so sort the keys to keep the output the same between runs.
			return data
				.sorted { $0.key < $1.key }
				.map { "\($0.key): \(String(describing: $0.value))" }
				.joined(separator: "\n")
		}

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
	 Resolve a command name or executable path for subprocess use.

	 - parameter binary: Binary path or command name.
	 - returns: Resolved executable path.
	 - throws: `CliStyleError.notFound` if the binary cannot be found.
	 */
	public static func resolveBinary(_ binary: String) throws -> String {
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
