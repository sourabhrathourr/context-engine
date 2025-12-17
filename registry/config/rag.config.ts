/**
 * Root RAG config (generated).
 *
 * This file is meant to be the single place you tweak:
 * - Embedding provider/model/timeouts
 * - Chunking defaults
 * - Retrieval defaults
 * - How you construct your DB client (Pool/Prisma/etc)
 *
 * The files under your install dir (e.g. `src/lib/rag/**`) are intended to be
 * treated like vendored source code (shadcn-style).
 */

// __CONTEXT_ENGINE_IMPORTS__

export const ragConfig = {
  chunking: {
    chunkSize: 200,
    chunkOverlap: 40,
  },
  retrieval: {
    topK: 8,
  },
  embedding: {
    model: "openai/text-embedding-3-small",
    timeoutMs: 15_000,
  },
} as const;

// __CONTEXT_ENGINE_CREATE_ENGINE__


