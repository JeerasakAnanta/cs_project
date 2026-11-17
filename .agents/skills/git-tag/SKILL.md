---
name: git-tag
description: >-
  Standardized Git tagging workflow: inspect current tags, determine the next
  semantic version (SemVer), generate an annotated tag with a Conventional
  Commits–style message, optionally push tags to remote. Use when the user asks
  to tag a release, bump a version, create a git tag, or publish a new version.
---

# Git Tag Workflow Skill

This skill guides the agent to create clean, well-named, and well-documented **annotated Git tags** following **Semantic Versioning (SemVer 2.0.0)** and the **Conventional Commits** naming convention.

---

## Core Principles

1. **Annotated Tags Only**: Always use `git tag -a` with a message. Lightweight tags carry no metadata and are unsuitable for releases.
2. **SemVer Strictly**: Tag names must follow `vMAJOR.MINOR.PATCH` (e.g., `v1.4.2`). Pre-release suffixes are allowed: `v2.0.0-rc.1`, `v2.0.0-beta.3`.
3. **No Blind Pushes**: Never run `git push --tags` or `git push origin <tag>` unless explicitly requested by the user.
4. **Tag the Right Commit**: Always confirm the HEAD commit is the intended target before tagging. If the user needs to tag a past commit, use `git tag -a <tag> <sha>`.
5. **Never Re-tag**: Do not overwrite an existing tag. If the same version exists, stop and ask the user.

---

## Step-by-Step Workflow

```
[1. Inspect Tags & Log] -> [2. Determine Next Version] -> [3. Compose Tag Message] -> [4. Create Tag] -> [5. Verify & (optionally) Push]
```

### Step 1: Inspect Existing Tags & Recent Log

```bash
# List all tags sorted by version (newest first)
git tag --sort=-version:refname | head -20

# Show the most recent tag and distance from HEAD
git describe --tags --long 2>/dev/null || echo "No tags yet"

# Show commits since the last tag (changelog candidates)
git log $(git describe --tags --abbrev=0 2>/dev/null)..HEAD --oneline 2>/dev/null \
  || git log --oneline -20
```

> [!TIP]
> Run the helper script for a one-shot overview:
> `./.agents/skills/git-tag/scripts/git-tag-summary.sh`

### Step 2: Determine the Next Version

Use the **Conventional Commits** in the log since the last tag to determine the bump:

| Commit Type Found | SemVer Bump | Example: `v1.4.2` → |
| :--- | :--- | :--- |
| Any `BREAKING CHANGE` or `feat!:` / `fix!:` | **MAJOR** | `v2.0.0` |
| Any `feat:` (without breaking) | **MINOR** | `v1.5.0` |
| `fix:`, `perf:`, `refactor:`, `build:`, `ci:`, `chore:`, `docs:` | **PATCH** | `v1.4.3` |

> [!IMPORTANT]
> If no previous tag exists, ask the user whether to start at `v0.1.0` or `v1.0.0`.
> Default suggestion: `v0.1.0` for pre-release projects, `v1.0.0` for production-ready releases.

Confirm the proposed version with the user before creating the tag.

### Step 3: Compose the Tag Message

Use this structure for the annotated tag message:

```text
Release <version>

<one-line summary of what this release contains>

Changes since <previous_tag>:
- <commit summary 1>
- <commit summary 2>
- ...

[optional: BREAKING CHANGE notes]
[optional: migration instructions]
```

**Example:**
```text
Release v1.5.0

Add RAG response adapter and upgrade LangChain ecosystem

Changes since v1.4.2:
- feat(rag): extract response adapter and switch to langgraph chatbot
- build(deps): remove python-jose dependency in favour of pyjwt
- fix(deps): patch critical and moderate security vulnerabilities
- chore(client): ignore tsconfig.app.tsbuildinfo build cache
```

Read [references/semver.md](./references/semver.md) for version bump decision trees.

### Step 4: Create the Annotated Tag

```bash
# Single-line message
git tag -a v1.5.0 -m "Release v1.5.0: add RAG response adapter and security patches"

# Multi-line message (preferred for releases)
git tag -a v1.5.0 -m "Release v1.5.0

Add RAG response adapter and upgrade LangChain ecosystem

Changes since v1.4.2:
- feat(rag): extract response adapter and switch to langgraph chatbot
- build(deps): remove python-jose in favour of pyjwt
- fix(deps): patch 20 CVEs across server and client deps"
```

> [!CAUTION]
> If the tag already exists, do NOT overwrite with `git tag -f`. Stop and confirm with the user whether to delete the old tag first or choose a different version.

### Step 5: Verify & (Optionally) Push

```bash
# Verify tag was created correctly
git show <tag> --stat

# Show tag in log
git log --oneline -5

# Push tag to remote ONLY if explicitly requested
git push origin <tag>
# or push all new tags
git push --tags
```

> [!NOTE]
> GitHub automatically creates a **Release draft** when a tag is pushed. Mention this to the user so they can fill in release notes on GitHub if needed.

---

## Pre-release Tags

For release candidates, betas, or alphas, append the pre-release identifier:

| Stage | Format | Example |
| :--- | :--- | :--- |
| Alpha | `vX.Y.Z-alpha.N` | `v2.0.0-alpha.1` |
| Beta | `vX.Y.Z-beta.N` | `v2.0.0-beta.3` |
| Release Candidate | `vX.Y.Z-rc.N` | `v2.0.0-rc.1` |

---

## Quick Reference

```bash
# List tags (newest first)
git tag --sort=-version:refname

# Create annotated tag at HEAD
git tag -a v1.2.3 -m "Release v1.2.3: <summary>"

# Create annotated tag at a specific commit
git tag -a v1.2.3 <commit-sha> -m "Release v1.2.3: <summary>"

# Show tag details
git show v1.2.3

# Delete a local tag (if wrong)
git tag -d v1.2.3

# Delete a remote tag (if already pushed)
git push origin --delete v1.2.3

# Push a single tag to remote
git push origin v1.2.3

# Push all local tags to remote
git push --tags
```
