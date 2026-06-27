#!/usr/bin/env bash
# Packages the standalone binary layout into a platform tarball.
#
# Archive layout:
#   bin/cli-style
#   adapters/bash/cli-style.sh
#   adapters/python/cli_style.py

set -euo pipefail

platform="${CLI_STYLE_PLATFORM:-$(uname -s | tr '[:upper:]' '[:lower:]')}"
architecture="${CLI_STYLE_ARCH:-$(uname -m)}"

case "$platform" in
	darwin) platform="darwin" ;;
	linux) platform="linux" ;;
	*) printf 'Unsupported platform: %s\n' "$platform" >&2; exit 1 ;;
esac

case "$architecture" in
	arm64|aarch64) architecture="arm64" ;;
	x64|x86_64|amd64) architecture="x64" ;;
	*) printf 'Unsupported architecture: %s\n' "$architecture" >&2; exit 1 ;;
esac

case "$platform-$architecture" in
	darwin-arm64) compile_target="bun-darwin-arm64" ;;
	darwin-x64)   compile_target="bun-darwin-x64" ;;
	linux-arm64)  compile_target="bun-linux-arm64" ;;
	linux-x64)    compile_target="bun-linux-x64" ;;
	*) printf 'Unsupported binary target: %s-%s\n' "$platform" "$architecture" >&2; exit 1 ;;
esac

BUN_COMPILE_TARGET="$compile_target" scripts/build-binary.sh

mkdir -p dist/release

archive="dist/release/cli-style-${platform}-${architecture}.tar.gz"

tar -C dist -czf "$archive" bin adapters

printf '%s\n' "$archive"
