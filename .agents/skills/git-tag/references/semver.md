# Semantic Versioning (SemVer 2.0.0) Reference

This reference covers SemVer rules and version bump decision trees tailored for Conventional Commits–driven projects.

---

## Version Format

```
vMAJOR.MINOR.PATCH[-PRE_RELEASE][+BUILD_METADATA]
```

| Segment | Meaning |
| :--- | :--- |
| `MAJOR` | Incompatible API / breaking change |
| `MINOR` | New backward-compatible feature |
| `PATCH` | Backward-compatible bug fix or small improvement |
| `PRE_RELEASE` | Optional: `alpha.1`, `beta.2`, `rc.1` |
| `BUILD_METADATA` | Optional: `+20261117`, ignored in precedence |

---

## Bump Decision Tree

```
Since the last tag, does the log contain...

  BREAKING CHANGE footer  OR  feat!:  OR  fix!:
  └─▶ MAJOR bump  (vX.0.0, reset MINOR and PATCH to 0)

  feat: (without breaking)
  └─▶ MINOR bump  (vX.Y.0, reset PATCH to 0)

  fix: / perf: / refactor: / build: / ci: / chore: / docs: / style: / test:
  └─▶ PATCH bump  (vX.Y.Z+1)

  No commits since last tag
  └─▶ Ask the user; do not create a duplicate tag.
```

---

## Real-world Examples

| Scenario | Last Tag | Next Tag |
| :--- | :--- | :--- |
| Security patch + dep updates | `v1.4.2` | `v1.4.3` |
| New chat streaming endpoint | `v1.4.3` | `v1.5.0` |
| Auth API schema redesign (breaking) | `v1.5.0` | `v2.0.0` |
| First public release candidate | — | `v1.0.0-rc.1` |
| Promote RC to stable | `v1.0.0-rc.1` | `v1.0.0` |

---

## Rules

1. **Never decrement** a version number.
2. **Reset lower segments** on a bump: MAJOR bump → MINOR=0, PATCH=0.
3. **Pre-release precedence**: `v1.0.0-alpha.1 < v1.0.0-beta.1 < v1.0.0-rc.1 < v1.0.0`
4. **Build metadata** (after `+`) does **not** affect precedence.
5. **Initial development**: While `MAJOR == 0`, anything may change at any time. `v0.Y.Z` is not considered stable.

---

## Changelog Extraction Command

To extract conventional commit messages since the last tag for the release body:

```bash
# Commits since last tag, one per line
git log $(git describe --tags --abbrev=0)..HEAD \
  --pretty=format:"- %s (%h)" \
  --no-merges

# Group by type (feat/fix/chore etc.) — pipe through grep
git log $(git describe --tags --abbrev=0)..HEAD \
  --pretty=format:"%s" --no-merges \
  | grep "^feat"   # or fix, chore, build, etc.
```
