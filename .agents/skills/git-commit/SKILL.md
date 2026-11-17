---
name: git-commit
description: >-
  Standardized, high-quality Git commit workflow: inspect diffs, verify staging safety,
  detect secrets/sensitive files, group changes into atomic commits, and write Conventional
  Commits (feat, fix, refactor, docs, chore, etc.). Use when the user asks to commit changes,
  make a git commit, write commit messages, stage files, or review changes before committing.
---

# Git Commit Workflow Skill

This skill guides the agent to create clean, atomic, well-documented, and safe git commits following the **Conventional Commits 1.0.0** specification.

---

## Core Principles

1. **Atomic Commits**: Each commit must represent a single logical change. Do not bundle unrelated fixes, features, or formatting into one commit.
2. **Safety First**: NEVER commit sensitive information (passwords, API keys, tokens, `.env` files, private keys) or unwanted build artifacts.
3. **Conventional Commits**: Standardize commit messages with type, scope, and imperative description for automated changelog generation and clear history.
4. **Selective Staging**: Avoid blanket `git add .` or `git add -A` when unrelated or untracked temporary files are present. Stage only the intended files.
5. **No Blind Pushes**: Never run `git push` unless explicitly requested by the user.

---

## Step-by-Step Workflow

```
[1. Status & Diff] -> [2. Secret & Safety Check] -> [3. Group & Stage] -> [4. Format Message] -> [5. Commit & Verify]
```

### Step 1: Status & Diff Inspection

Before staging or committing, inspect the repository state:

```bash
# 1. Check working directory status
git status --short

# 2. Check unstaged diff
git diff

# 3. Check already staged diff (if any)
git diff --cached
```

> [!TIP]
> You can also run the bundled helper script:
> `./.agents/skills/git-commit/scripts/git-diff-summary.sh`
> to get an instant overview of branch, staged/unstaged changes, and safety alerts.

### Step 2: Safety & Secret Verification

Inspect modified and untracked files for potential secrets:

- **Forbidden files**:
  - `.env`, `.env.*`, `*.env` (except `.env.example`)
  - `*.pem`, `*.key`, `id_rsa*`, `*.pfx`, `*.p12`
  - `credentials.json`, `service-account*.json`, `token.json`
  - Local database files: `*.sqlite3`, `*.db`
  - Temporary or build directories: `node_modules/`, `dist/`, `build/`, `__pycache__/`, `.venv/`
- **In-code secrets**:
  - Ensure API keys, bearer tokens, passwords, or connection strings with credentials are not hardcoded in diffs.

> [!CAUTION]
> If a sensitive file is detected, DO NOT stage it! Prompt the user immediately or add the file pattern to `.gitignore`.

Read [references/safety-rules.md](./references/safety-rules.md) for the complete checklist.

### Step 3: Group into Atomic Commits & Stage

Divide changes into logical units. For example:
- `client/`: UI changes separate from backend changes.
- `server/`: API/database migrations separate from frontend fixes.
- `docs/`: README or documentation updates separate from feature logic.
- `refactor`: Structural refactoring separate from new feature additions.

Stage files selectively:
```bash
# Stage specific files for a single atomic commit
git add path/to/file1 path/to/file2

# Verify what was staged
git diff --cached --stat
```

### Step 4: Crafting the Commit Message

Follow the Conventional Commits specification:

```text
<type>(<scope>): <short imperative description>

[optional body explaining motivation and context]

[optional footer(s), e.g., BREAKING CHANGE, issue refs]
```

#### Commit Types

| Type | When to Use | Example |
| :--- | :--- | :--- |
| `feat` | Introduces a new feature or capability | `feat(client): add dark mode toggle button` |
| `fix` | Fixes a bug | `fix(server): handle null pointer in guest session` |
| `refactor` | Code restructuring without behavior or bug changes | `refactor(auth): simplify JWT token verification flow` |
| `style` | Formatting, white-space, semi-colons (no code logic change) | `style(client): apply Tailwind classes to login modal` |
| `docs` | Documentation changes only | `docs: update API endpoints in README` |
| `perf` | Code changes that improve performance | `perf(qdrant): optimize vector search batch retrieval` |
| `test` | Adding or updating unit/integration tests | `test(server): add test cases for chat CRUD endpoints` |
| `build` | Changes to build system or package dependencies | `build(deps): update fastapi and uv lockfile` |
| `ci` | Changes to CI/CD workflows and automation scripts | `ci: fix uv installation step in github actions` |
| `chore` | Maintenance tasks, gitignore, configs | `chore: update .gitignore to exclude test logs` |
| `revert` | Reverting a previous commit | `revert: revert "feat(client): add banner"` |

#### Scopes
- Use lowercase nouns indicating the section of the codebase:
  - Component or module: `client`, `server`, `auth`, `chat`, `rag`, `db`, `api`, `ui`.
  - For monorepos: indicate the affected workspace (e.g., `client`, `server`).
  - Omit scope if change is root-level or repository-wide (e.g. `docs: update README.md`).

#### Subject Line Rules
1. **Imperative, present tense**: Use "add" (not "added" or "adds"), "fix" (not "fixed"), "update" (not "updated").
2. **Lowercase starting character**: e.g., `feat(client): add ...` instead of `feat(client): Add ...`.
3. **No trailing period**: Do not end the subject with `.`.
4. **Length**: Keep under 72 characters (ideally 50-70 characters).

#### Optional Body & Footer
- **Body**: Use when the reason for the change is not obvious from the subject line. Focus on **why** the change was made, not just **what** was changed.
- **Breaking Changes**: Mark with `!` before `:` or add a `BREAKING CHANGE: <description>` footer:
  ```text
  feat(api)!: change user profile response schema

  BREAKING CHANGE: The `name` field has been split into `first_name` and `last_name`.
  ```

Read [references/conventional-commits.md](./references/conventional-commits.md) for more examples.

### Step 5: Execute & Verify

1. Run the commit command:
   ```bash
   git commit -m "<type>(<scope>): <description>"
   ```
   Or for multi-line messages:
   ```bash
   git commit -m "<subject>" -m "<body>"
   ```

2. Verify the commit was recorded cleanly:
   ```bash
   git log -1 --stat
   ```

3. Report the result clearly to the user with the commit hash and message.
