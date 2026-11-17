# Git Commit Safety & Security Rules

This document outlines mandatory safety guidelines to prevent credential leaks, broken repositories, and accidental data exposure during git operations.

---

## 1. Secrets & Sensitive Files Checklist

**NEVER stage or commit any of the following:**

### Environment & Credential Files
- `.env`, `.env.*` (e.g., `.env.local`, `.env.production`)
- `*.pem`, `*.key`, `*.pkcs12`, `*.p12`, `*.crt`
- SSH keys: `id_rsa`, `id_ed25519`, `id_ecdsa` (and corresponding `.pub` unless intended)
- Cloud credentials: `service-account*.json`, `credentials.json`, `client_secret*.json`
- AWS credentials: `credentials`, `config`
- Kubernetes configs: `kubeconfig`, `*.kubeconfig`

### In-Code Secrets
- API keys (OpenAI, Stripe, Google, AWS, GitHub tokens)
- Database connection strings containing passwords (e.g., `postgresql://user:secret@host/db`)
- JWT private secrets or signing keys
- Plaintext passwords or auth tokens

### Temporary & Build Artifacts
- Dependencies: `node_modules/`, `.venv/`, `venv/`, `vendor/`
- Build outputs: `dist/`, `build/`, `out/`, `*.egg-info/`, `target/`
- Bytecode / Caches: `__pycache__/`, `*.pyc`, `.pytest_cache/`, `.turbo/`
- OS artifacts: `.DS_Store`, `Thumbs.db`, `desktop.ini`
- Local databases: `*.sqlite`, `*.sqlite3`, `*.db`, Qdrant local storage dumps

---

## 2. Safe Staging Practices

1. **Selective Staging**:
   - Prefer staging explicit paths: `git add src/app.ts docs/readme.md`
   - Avoid blanket `git add .` or `git add -A` unless you have verified every file in `git status --short`.
2. **Review Before Commit**:
   - Always check `git diff --cached --stat` to verify file names.
   - Run `git diff --cached` to review exact line changes before finalizing.
3. **Pre-commit Hooks**:
   - Do NOT pass `--no-verify` to bypass pre-commit hooks unless explicitly instructed by the user.

---

## 3. Remote Operations Guardrails

- **Never Force Push**: Never run `git push --force` or `git push -f` on shared or main branches (`main`, `master`, `development`).
- **Push on Request Only**: Only run `git push` when the user has explicitly requested to push changes to the remote.

---

## 4. Emergency: What to do if a secret was committed locally

If a secret was committed locally and **NOT YET PUSHED**:

```bash
# 1. Soft reset the last commit to preserve changes in working directory
git reset HEAD~1

# 2. Add the sensitive file to .gitignore
echo ".env" >> .gitignore

# 3. Remove the sensitive file from git tracking
git rm --cached path/to/secret-file

# 4. Verify status and commit safely
git status
```

> [!WARNING]
> If a secret was already pushed to a remote repository, consider the secret compromised immediately!
> Rotate/revoke the credential at the provider side first, then clean the git history.
