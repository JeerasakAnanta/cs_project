#!/usr/bin/env bash
# git-tag-summary.sh - Quick pre-tag inspection: existing tags, HEAD info, changelog candidates

set -euo pipefail

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Error: Not inside a git repository."
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
HEAD_SHA=$(git rev-parse --short HEAD)
HEAD_MSG=$(git log -1 --pretty=format:"%s")

echo "=================================================="
echo " 🏷️  Git Tag Summary & Pre-Tag Inspection"
echo "=================================================="
echo "Branch   : $BRANCH"
echo "HEAD     : $HEAD_SHA  $HEAD_MSG"
echo "--------------------------------------------------"

# --- Existing Tags ---
echo "📌 Existing Tags (newest first, top 10):"
TAGS=$(git tag --sort=-version:refname 2>/dev/null | head -10)
if [ -n "$TAGS" ]; then
  echo "$TAGS" | sed 's/^/  - /'
else
  echo "  (No tags found — this will be the first release)"
fi
echo "--------------------------------------------------"

# --- Distance from last tag ---
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
  DISTANCE=$(git rev-list "${LAST_TAG}..HEAD" --count 2>/dev/null || echo "?")
  echo "📏 Commits since last tag ($LAST_TAG): $DISTANCE"
else
  TOTAL=$(git rev-list HEAD --count 2>/dev/null || echo "?")
  echo "📏 No previous tag. Total commits on branch: $TOTAL"
fi
echo "--------------------------------------------------"

# --- Changelog candidates ---
echo "📝 Commits since last tag (changelog candidates):"
if [ -n "$LAST_TAG" ]; then
  CHANGELOG=$(git log "${LAST_TAG}..HEAD" --oneline --no-merges 2>/dev/null)
else
  CHANGELOG=$(git log HEAD --oneline --no-merges 2>/dev/null | head -20)
fi

if [ -n "$CHANGELOG" ]; then
  echo "$CHANGELOG" | sed 's/^/  /'
  echo ""
  # Detect bump level
  HAS_BREAKING=$(echo "$CHANGELOG" | grep -Ei "(BREAKING CHANGE|feat!:|fix!:)" || true)
  HAS_FEAT=$(echo "$CHANGELOG" | grep -Ei "^[a-f0-9]+ feat(\(.+\))?:" || true)
  if [ -n "$HAS_BREAKING" ]; then
    echo "  ⚠️  BREAKING CHANGE detected → suggested bump: MAJOR"
  elif [ -n "$HAS_FEAT" ]; then
    echo "  ✨ New feature detected → suggested bump: MINOR"
  else
    echo "  🔧 Fixes/chores only → suggested bump: PATCH"
  fi
else
  echo "  (No commits since last tag — nothing to tag)"
fi
echo "--------------------------------------------------"

# --- Duplicate tag guard ---
echo "🛡️  Duplicate Tag Guard:"
if [ -n "$LAST_TAG" ]; then
  LAST_TAG_SHA=$(git rev-list -n 1 "$LAST_TAG" 2>/dev/null || echo "")
  HEAD_FULL=$(git rev-parse HEAD)
  if [ "$LAST_TAG_SHA" = "$HEAD_FULL" ]; then
    echo "  ⚠️  WARNING: HEAD ($HEAD_SHA) is already tagged as $LAST_TAG"
    echo "  Creating another tag at the same commit is unusual. Confirm with user."
  else
    echo "  ✅ HEAD has not been tagged yet. Safe to tag."
  fi
else
  echo "  ✅ No existing tags. Safe to create first tag."
fi
echo "=================================================="
