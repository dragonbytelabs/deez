#!/bin/bash
# Script to check Go code coverage and fail if below threshold

set -e

THRESHOLD=${1:-90}

echo "Running Go tests with coverage..."
go test -coverprofile=coverage.out ./...

# Calculate total coverage
TOTAL_COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | sed 's/%//')

# Clean up
rm -f coverage.out

echo "Total coverage: ${TOTAL_COVERAGE}%"
echo "Required threshold: ${THRESHOLD}%"

# Compare using awk for floating point comparison (more portable than bc)
PASS=$(awk "BEGIN{print(${TOTAL_COVERAGE} >= ${THRESHOLD})}")

if [ "$PASS" -eq 1 ]; then
    echo "✓ Coverage check passed!"
    exit 0
else
    echo "✗ Coverage check failed! Coverage ${TOTAL_COVERAGE}% is below the required ${THRESHOLD}%"
    exit 1
fi
