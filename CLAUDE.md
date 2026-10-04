# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

LannaFinChat: a Thai-language RAG chatbot that answers questions from PDF documents (RMUTL graduation project). Monorepo with two independent apps:

- `server/` — FastAPI + SQLAlchemy (PostgreSQL) + LangChain/LangGraph + Qdrant + OpenAI. Python >=3.13, managed with `uv`.
- `client/` — React 18 + TypeScript + Vite + Tailwind/MUI. Managed with npm.

The root `README.md` is partly stale (it still references `frontend/`, `chat_api/`, `pdf_management_api/`, `requirements.txt`). Trust the directory layout and the justfiles instead.

## Commands

Each app has a `justfile`; run recipes from inside its directory.

Server (`cd server`):
- `just deps` — `uv sync`
- `just dev` — `uv run uvicorn app.main:app --port 8001 --reload`
- `just migrate` / `just new-migration "message"` — Alembic upgrade / autogenerate
- `just index-docs` — runs `scripts/indexing_docs.py` to embed PDFs from `server/pdfs/` into Qdrant

Client (`cd client`):
- `npm run dev` (Vite), `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm run format` (prettier)
- `just check` — format + lint + build

There is no test suite in either app, so there is no single-test command.

Env: copy `.env.example` to `.env` in `server/` and `client/`. The server needs Postgres (`DB_*`), `OPENAI_API_KEY`/`OPENAI_MODEL`/`EMBEDDINGS_MODEL`, Qdrant (`QDRANT_VECTERDB_HOST`, `COLLECTION_NAME`; note the `VECTERDB` spelling), and JWT secrets. The client reads `VITE_API_BASE_URL` (defaults to `http://localhost:8001`).

## Architecture

### Server (`server/app`)

`main.py` wires everything: it calls `Base.metadata.create_all` at startup (in addition to Alembic migrations), installs a slowapi `Limiter` keyed by IP, sets CORS (an explicit localhost list when `DEBUG`, otherwise only the production domains), and mounts the routers. Rate limiting is applied per endpoint with `@limiter.limit`.

Three chat modes, each with its own router and CRUD, all sharing the same RAG backend:
- Authenticated chat: `chat/router.py`, with `chat/crud.py` and JWT auth from `login_system/` and `routers/router_login.py`.
- Anonymous chat: `chat/anonymous_router.py`.
- Guest chat: `chat/guest_router.py` and `guest_crud.py`. Guest conversations are persisted to PostgreSQL and tagged with a `machine_id` (see the `alembic/versions` migration and `docs/GUEST_MODE_*.md`).

RAG: `rag_system/rag_system.py` exposes `chatbot`, which the routers import. `langgraph_rag_system.py` and `new_rag.py` are alternative implementations (the LangGraph one uses a `retrieve` tool against Qdrant with Thai-specific query variants). Check which one is imported before editing.

PDF ingestion: `routers/router_pdfs_enhanced.py` handles upload and delete, and `docs_process/process_pdf.py` (docling) plus `scripts/indexing_docs.py` build the Qdrant collection.

Admin: `routers/router_admin.py` and `router_admin_conversations.py` provide statistics, conversation management and export. `chat/feedback_*` stores user feedback and satisfaction ratings. Several files under `routers/` (`router_chat_enhanced.py`, `router_machine.py`, ...) and `app/api`, `app/router` are not mounted in `main.py`; check there before assuming an endpoint is live.

Timezone and logging go through `utils/timezone.py` and `utils/logging_config.py` (log file `server/log/app.log`).

### Client (`client/src`)

- `services/` — axios wrappers around the API (`conversationService`, `adminStatisticsService`, `Guest*`/`Anonymous*` chat services). Errors are caught as `AxiosError<{detail?: string}>` and rethrown as Thai-language `Error` messages, so keep that pattern.
- `contexts/` — `AuthContext` (JWT via `jwt-decode`), `ThemeContext`, `OfflineContext`.
- `components/{admin,auth,chat,common,pages,pdf,survey}` and `App.tsx` for routing.
- `config.ts` — API base URLs.

## Deployment

`.github/workflows/build.yaml` runs on self-hosted runners for pushes and PRs to `main`. It builds the `server/` and `client/` Docker images and pushes them to `ghcr.io/jeerasakananta/cs_project-{backend,frontend}`, then redeploys the containers. The client image serves the Vite build through nginx (`client/nginx.conf`), published on port 8002.

## Conventions

- Commits follow Conventional Commits, in English (`feat:`, `fix:`, `refactor(client):`, `build(server):`, ...). The working branch is `development`; PRs target `main`.
- User-facing strings and many code comments are in Thai.
