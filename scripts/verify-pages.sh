#!/bin/bash
# verify-pages.sh — Check all 104+ static pages return HTTP 200
# Usage: ./scripts/verify-pages.sh [base_url]
# Default: https://thedrip.to

BASE_URL="${1:-https://thedrip.to}"
SITEMAP_URL="${BASE_URL}/sitemap.xml"
PASS=0
FAIL=0
ERRORS=()

echo "=== The Drip — Page Verification ==="
echo "Base URL: ${BASE_URL}"
echo "Sitemap:  ${SITEMAP_URL}"
echo ""

# Check sitemap exists
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SITEMAP_URL}")
if [ "$HTTP_CODE" = "200" ]; then
  echo "[PASS] sitemap.xml → ${HTTP_CODE}"
  ((PASS++))
else
  echo "[FAIL] sitemap.xml → ${HTTP_CODE}"
  ((FAIL++))
  ERRORS+=("sitemap.xml → ${HTTP_CODE}")
fi

# Check robots.txt
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/robots.txt")
if [ "$HTTP_CODE" = "200" ]; then
  echo "[PASS] robots.txt → ${HTTP_CODE}"
  ((PASS++))
else
  echo "[FAIL] robots.txt → ${HTTP_CODE}"
  ((FAIL++))
  ERRORS+=("robots.txt → ${HTTP_CODE}")
fi

# Extract URLs from sitemap and check each
echo ""
echo "--- Checking all sitemap URLs ---"
URLS=$(curl -s "${SITEMAP_URL}" | grep -oP '(?<=<loc>)[^<]+')

for URL in $URLS; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "${URL}")
  PATH_PART="${URL#${BASE_URL}}"
  if [ "$HTTP_CODE" = "200" ]; then
    echo "[PASS] ${PATH_PART} → ${HTTP_CODE}"
    ((PASS++))
  else
    echo "[FAIL] ${PATH_PART} → ${HTTP_CODE}"
    ((FAIL++))
    ERRORS+=("${PATH_PART} → ${HTTP_CODE}")
  fi
done

# Summary
echo ""
echo "=== Summary ==="
echo "Passed: ${PASS}"
echo "Failed: ${FAIL}"
echo "Total:  $((PASS + FAIL))"

if [ ${FAIL} -gt 0 ]; then
  echo ""
  echo "=== Failed URLs ==="
  for ERR in "${ERRORS[@]}"; do
    echo "  ${ERR}"
  done
  exit 1
fi

echo ""
echo "All pages return 200. Ready for sitemap submission."
exit 0
