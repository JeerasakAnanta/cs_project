# Conventional Commits Reference Guide

This reference details the Conventional Commits 1.0.0 specification and real-world examples tailored for modern software projects.

---

## Anatomy of a Commit Message

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Full Multi-Line Example

```text
feat(server): support streaming response for chat completions

Introduce SSE (Server-Sent Events) endpoint in /chat/stream to allow
real-time token streaming from LangChain to the client. This reduces
time-to-first-token perception for end users.

Closes #42
Refs #18
```

---

## Detailed Type Reference

| Type | Intent | Real-world Example |
| :--- | :--- | :--- |
| `feat` | New feature for end users or consumers | `feat(client): implement PDF file drag-and-drop upload` |
| `fix` | Bug fix in code | `fix(server): catch Qdrant connection timeout gracefully` |
| `refactor` | Code restructuring without altering external behavior | `refactor(chat): extract prompt templates to dedicated module` |
| `perf` | Performance improvement | `perf(db): add composite index on (user_id, created_at)` |
| `style` | Formatting, whitespace, semicolon changes | `style(client): format tailwind utility classes with prettier` |
| `docs` | Documentation-only changes | `docs: document local Docker setup in README` |
| `test` | Adding or correcting test cases | `test(api): add unit tests for anonymous session creation` |
| `build` | Changes to build systems, tooling, or package dependencies | `build(deps): upgrade fastapi from 0.111.0 to 0.115.0` |
| `ci` | Changes to CI/CD workflows and deployment scripts | `ci: add uv cache step to GitHub Actions workflow` |
| `chore` | Routine tasks, configuration, or non-production maintenance | `chore: add .idea and .vscode to .gitignore` |
| `revert` | Reverting a previous commit | `revert: revert "feat(client): add banner"` |

---

## Scoping Conventions

Use scopes to indicate the affected module, layer, or subsystem:

### In Monorepos / Multi-Component Repos
- `feat(client): ...`
- `fix(server): ...`
- `chore(docker): ...`
- `build(deps): ...`

### In Modular Applications
- `feat(auth): ...`
- `fix(rag): ...`
- `refactor(db): ...`
- `style(ui): ...`
- `docs(api): ...`

---

## Breaking Changes

To communicate breaking changes to consumers:

### Option A: Using `!` in the header
```text
feat(api)!: remove deprecated v1 user endpoint
```

### Option B: Using the `BREAKING CHANGE:` footer
```text
refactor(auth): rename token parameter in headers

BREAKING CHANGE: Authorization header format now requires `Bearer <token>` instead of `Token <token>`.
```

---

## Git Trailers & References

Trailers provide machine-readable metadata in the commit footer:

- **Issue Closing**:
  - `Closes #123`
  - `Fixes #456`
- **Issue References**:
  - `Refs #789`
- **Co-authors**:
  - `Co-authored-by: Name <name@example.com>`

---

## Good vs. Bad Commit Examples

| Bad ❌ | Good ✅ | Reason |
| :--- | :--- | :--- |
| `fixed stuff` | `fix(server): resolve race condition in guest session token` | Specifies type, scope, and clear issue resolved |
| `FEAT: ADDED LOGIN BUTTON.` | `feat(client): add login button with loading state` | Lowercase imperative, no trailing period |
| `update files` | `docs: update setup instructions in README` | Specific intent and type |
| `WIP` | `feat(rag): draft document chunking pipeline` | Professional, meaningful context |
| `refactor and added new feature and fixed bug` | Split into 3 atomic commits: `refactor(...)`, `fix(...)`, `feat(...)` | Maintains atomic commit history |
