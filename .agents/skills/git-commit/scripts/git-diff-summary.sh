#!/usr/bin/env bash
# git-diff-summary.sh - Quick pre-commit status & security audit script

set -euo pipefail

# Ensure inside a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: Not inside a git repository."
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "none")

echo "=================================================="
echo " 🔍 Git Status & Pre-Commit Summary"
echo "=================================================="
echo "Branch   : $BRANCH"
echo "Upstream : $UPSTREAM"
echo "--------------------------------------------------"

# Check Staged files
STAGED_FILES=$(git diff --name-only --cached)
STAGED_COUNT=$(echo "$STAGED_FILES" | sed '/^\s*$/d' | wc -l)

echo "📦 Staged Changes ($STAGED_COUNT files):"
if [ "$STAGED_COUNT" -gt 0 ]; then
  git diff --cached --stat
else
  echo "  (No files currently staged)"
fi
echo "--------------------------------------------------"

# Check Unstaged files
UNSTAGED_FILES=$(git diff --name-only)
UNSTAGED_COUNT=$(echo "$UNSTAGED_FILES" | sed '/^\s*$/d' | wc -l)

echo "📝 Unstaged Modified Files ($UNSTAGED_COUNT files):"
if [ "$UNSTAGED_COUNT" -gt 0 ]; then
  git diff --stat
else
  echo "  (No unstaged modifications)"
fi
echo "--------------------------------------------------"

# Check Untracked files
UNTRACKED_FILES=$(git ls-files --others --exclude-standard)
UNTRACKED_COUNT=$(echo "$UNTRACKED_FILES" | sed '/^\s*$/d' | wc -l)

echo "❓ Untracked Files ($UNTRACKED_COUNT files):"
if [ "$UNTRACKED_COUNT" -gt 0 ]; then
  echo "$UNTRACKED_FILES" | sed 's/^/  - /'
else
  echo "  (No untracked files)"
fi
echo "--------------------------------------------------"

# Security & Secret Audit
echo "🛡️  Security & Sensitive File Check:"
SUSPICIOUS_PATTERNS="(\.env|\.pem$|\.key$|id_rsa|credentials\.json|token\.json|service[-_]account)"
ALL_CHANGED="$STAGED_FILES"$'\n'"$UNSTAGED_FILES"$'\n'"$UNTRACKED_FILES"
SUSPICIOUS_MATCHES=$(echo "$ALL_CHANGED" | grep -Ei "$SUSPICIOUS_PATTERNS" || true)

if [ -n "$SUSPICIOUS_MATCHES" ]; then
  echo "  ⚠️  WARNING: Potential sensitive files detected:"
  echo "$SUSPICIOUS_MATCHES" | sed 's/^/    ! /'
  echo "  Please verify these files before staging or committing!"
else
  echo "  ✅ No obvious sensitive files detected in status."
fi
echo "=================================================="
