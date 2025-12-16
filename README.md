# context-engine

A Bun-first, bring-your-own-db RAG core with ingest and retrieve primitives. It uses:
- Bun + Drizzle ORM with Postgres + pgvector
- Vercel AI Gateway via `ai` SDK for embeddings (`openai/text-embedding-3-small`)
- Simple chunking + scope filters (org/project/source)

## Features
- **Ingest**: chunk text, embed with AI Gateway, persist documents/chunks/embeddings via Drizzle + pgvector.
-,**Retrieve**: embed queries and run pgvector similarity with optional scope filters.
- **Configurable**: defaults live in `context-engine.config.ts`; swap chunking options, timeouts, and DB.
- **Scripts**: smoke ingest/retrieve, pgvector enable, Drizzle generate/push.

## Setup
1) Install deps:
```bash
bun install
```
2) Env (e.g. `.env`):
```
DATABASE_URL=postgres://...
AI_GATEWAY_API_KEY=your-key
# optional overrides:
# AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1
# AI_GATEWAY_MODEL=openai/text-embedding-3-small
```
3) Enable pgvector and apply schema:
```bash
bun run db:enable-vector   # needs extension privileges
bun run db:generate
bun run db:push
```

## Usage
Create an engine:
```ts
import { createContextEngineWithDrizzle } from "./context-engine.config";
const engine = createContextEngineWithDrizzle();
```

Ingest:
```ts
await engine.ingest({
  sourceId: "doc-1",
  content: "Your text to chunk and embed...",
  metadata: { orgId: "org-1", projectId: "proj-1" },
});
```

Retrieve:
```ts
const { chunks } = await engine.retrieve({
  query: "search text",
  topK: 5,
  scope: { orgId: "org-1", projectId: "proj-1" },
});
```

## Scripts
- `bun run smoke:ingest` — chunk/embed/store a sample doc.
- `bun run smoke:retrieve` — run a sample retrieval.
- `bun run db:enable-vector` — create pgvector extension.
- `bun run db:generate` / `bun run db:push` — Drizzle migration lifecycle.

## Notes
- Embedding model fixed to `openai/text-embedding-3-small`.
- Retrieval uses pgvector `<=>` (lower is closer). Scope filters can narrow by org/project/source.
- Ensure network/DB access for migrations and smoke scripts.
