# GitHub Workflows

This directory contains GitHub Actions workflows for the LannaFinChat project.

## Workflows Overview

### 1. `build.yml` - Main CI/CD Pipeline
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Jobs**:
  - **Frontend**: Build, lint, and test React/TypeScript frontend
  - **Backend**: Build, lint, type-check, and test FastAPI backend
  - **Docker**: Build and push Docker images to GitHub Container Registry
  - **Integration**: Run integration tests with PostgreSQL
  - **Security**: Run Trivy vulnerability scanner
  - **Deploy**: Deploy to staging (develop) and production (main)

### 2. `release.yml` - Release Management
- **Triggers**: Git tags (v*)
- **Jobs**:
  - Build and push Docker images with version tags
  - Generate release notes from git commits
  - Create GitHub releases

### 3. `code-quality.yml` - Code Quality Checks
- **Triggers**: Pull Requests, Push to main/develop
- **Jobs**:
  - Frontend: ESLint, TypeScript checks, Prettier formatting
  - Backend: Ruff linting, MyPy type checking, Safety security scan
  - Code coverage reporting
  - Upload coverage reports as artifacts

### 4. `dependency-updates.yml` - Dependency Management
- **Triggers**: Weekly schedule (Mondays), Manual dispatch
- **Jobs**:
  - Update npm dependencies (frontend)
  - Update Python dependencies via uv (backend)
  - Create pull request with updates

### 5. `pr-management.yml` - PR and Issue Management
- **Triggers**: Issues opened/labeled, PRs opened/updated
- **Jobs**:
  - Auto-label issues and PRs based on content
  - Validate PR descriptions and target branches
  - Add size labels to PRs

## Environment Variables

The following secrets need to be configured in your GitHub repository:

- `OPENAI_API_KEY`: OpenAI API key for testing
- `GITHUB_TOKEN`: Automatically provided by GitHub

## Docker Images

The workflows build and push the following Docker images to GitHub Container Registry:

- `ghcr.io/{owner}/{repo}-frontend`: React frontend application
- `ghcr.io/{owner}/{repo}-backend`: FastAPI backend application

## Branch Strategy

- **`main`**: Production branch - triggers full CI/CD pipeline including deployment
- **`develop`**: Development branch - triggers CI/CD pipeline with staging deployment
- **Feature branches**: Trigger CI pipeline for validation

## Testing Strategy

- **Unit Tests**: Fast, isolated tests for individual components
- **Integration Tests**: Tests that verify component interactions
- **Security Tests**: Vulnerability scanning with Trivy
- **Code Quality**: Linting, formatting, and type checking

## Deployment

- **Staging**: Automatic deployment on push to `develop`
- **Production**: Automatic deployment on push to `main`
- **Manual**: Can be triggered via GitHub Actions UI

## Monitoring

- Code coverage reports are uploaded to Codecov
- Security scan results are uploaded to GitHub Security tab
- Build artifacts are stored for 7 days
