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

# Compare using bc for floating point comparison
PASS=$(echo "${TOTAL_COVERAGE} >= ${THRESHOLD}" | bc -l)

if [ "$PASS" -eq 1 ]; then
    echo "✓ Coverage check passed!"
    exit 0
else
    echo "✗ Coverage check failed! Coverage ${TOTAL_COVERAGE}% is below the required ${THRESHOLD}%"
    exit 1
fi
