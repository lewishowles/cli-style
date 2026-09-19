#!/usr/bin/env bash
# Builds the standalone cli-style binary and copies wrapper adapters beside it.
#
# Release layout:
#   dist/bin/cli-style
#   dist/adapters/bash/cli-style.sh
#   dist/adapters/python/cli_style/
#   dist/adapters/python/pyproject.toml
#   dist/adapters/swift/Package.swift
#   dist/adapters/swift/Sources/

set -euo pipefail

# Start from an empty adapters folder so files removed from adapters/ do not
# linger in the release from an earlier build.
rm -rf "dist/adapters"
mkdir -p "dist/bin" "dist/adapters/bash" "dist/adapters/python" "dist/adapters/swift"

build_args=(--compile ./bin/cli-style.js --outfile ./dist/bin/cli-style)

if [ "${BUN_COMPILE_TARGET:-}" != "" ]; then
	build_args+=(--target "$BUN_COMPILE_TARGET")
fi

bun build "${build_args[@]}"

cp adapters/bash/cli-style.sh dist/adapters/bash/cli-style.sh

# Copy the Python package without the __pycache__ folders Python leaves behind.
tar -C "adapters/python" \
	--exclude="__pycache__" \
	-cf - cli_style pyproject.toml | tar -C "dist/adapters/python" -xf -

cp -R adapters/swift/Package.swift adapters/swift/Sources dist/adapters/swift/
