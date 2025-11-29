#!/bin/bash
# Script to check frontend code coverage and fail if below threshold

set -e

THRESHOLD=${1:-90}

echo "Running frontend tests with coverage..."
cd web

# Run vitest with coverage and output JSON for parsing
npx vitest run --coverage --coverage.reporter=text --coverage.reporter=json-summary 2>&1

# Parse the coverage summary JSON
if [ -f coverage/coverage-summary.json ]; then
    # Extract the total lines pct value from the JSON
    # Format: {"total": {"lines":{"total":X,"covered":Y,"skipped":Z,"pct":XX.XX},...
    TOTAL_COVERAGE=$(sed -n 's/.*"total":\s*{"lines":{[^}]*"pct":\([0-9.]*\).*/\1/p' coverage/coverage-summary.json)
    
    # Clean up
    rm -rf coverage
    
    echo "Total line coverage: ${TOTAL_COVERAGE}%"
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
else
    echo "Error: Coverage summary not found"
    exit 1
fi
