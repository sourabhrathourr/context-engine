# RAG setup (Context Engine)

This project uses a simple RAG “context engine” with:
- chunk → embed → store on ingest
- embed → vector similarity search on retrieve

## Environment variables

Add these to your environment:
- `DATABASE_URL` (Postgres connection string)
- `AI_GATEWAY_API_KEY` (required by the `ai` SDK when using Vercel AI Gateway)
- Optional: `AI_GATEWAY_MODEL` (defaults to `openai/text-embedding-3-small`)

## Database requirements

Enable pgvector:

```sql
create extension if not exists vector;
```

## Schema (Postgres)

You are responsible for migrations. Create these tables:

```sql
create table documents (
  id uuid primary key,
  source_id text not null,
  metadata jsonb,
  created_at timestamp default now()
);

create table chunks (
  id uuid primary key,
  document_id uuid not null references documents(id) on delete cascade,
  source_id text not null,
  idx integer not null,
  content text not null,
  token_count integer not null,
  metadata jsonb,
  created_at timestamp default now()
);

create table embeddings (
  chunk_id uuid primary key references chunks(id) on delete cascade,
  embedding vector,
  embedding_dimension integer,
  created_at timestamp default now()
);
```

Recommended indexes:

```sql
create index if not exists chunks_source_id_idx on chunks(source_id);
create index if not exists documents_source_id_idx on documents(source_id);
```

Vector index (optional, recommended later):
- Add an IVFFLAT or HNSW index based on your pgvector version and needs.

<!-- __CONTEXT_ENGINE_ADAPTER_NOTES__ -->

## Usage (Next.js)

- Use the engine only on the server (Route Handlers / Server Actions).
- Prefer a singleton DB client/pool pattern to avoid hot-reload connection storms.
- If `context-engine` detected Next.js, it added:
  - `@rag/*` path alias to your installed module directory
  - `@rag/config` path alias to `./rag.config.ts`

Example route handler:

```ts
import { createRagEngine } from "@rag/config";

export async function GET() {
  const engine = createRagEngine();
  const result = await engine.retrieve({ query: "hello", topK: 5 });
  return Response.json(result);
}
```


