#!/bin/bash
# Inject version info from git and build

VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME=$(date -u '+%Y-%m-%d_%H:%M:%S')

export NEXT_PUBLIC_VERSION="$VERSION"
export NEXT_PUBLIC_COMMIT="$COMMIT"
export NEXT_PUBLIC_BUILD_TIME="$BUILD_TIME"

echo "Building with version: $VERSION (commit: $COMMIT, time: $BUILD_TIME)"

npm run build
