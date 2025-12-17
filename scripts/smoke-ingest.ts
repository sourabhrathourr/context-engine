import { drizzle } from "drizzle-orm/bun-sql";
import { sql } from "drizzle-orm";
import { createContextEngine, defineConfig } from "../src/context-engine";
import { createAIEmbeddingProvider } from "../src/embedding";
import { createDrizzleVectorStore, drizzleSchema } from "../src/store/drizzle";

const db = drizzle({
  client: Bun.sql,
  schema: drizzleSchema,
});

const run = async () => {
  const embedding = createAIEmbeddingProvider({
    model: "openai/text-embedding-3-small",
    timeoutMs: 15_000,
  });

  const contextEngine = createContextEngine(
    defineConfig({
      embedding,
      store: createDrizzleVectorStore(db),
      defaults: {
        chunkSize: 64,
        chunkOverlap: 16,
      },
    }),
  );

  const result = await contextEngine.ingest({
    sourceId: "smoke-test",
    content: `To be in the top 5% as a developer especially in distributed systems - you don’t win by moving fast. You win by building depth where others skip.

    Here’s what that actually looks like, in practical terms:

    1. Start with fundamentals, not tools
    Learn why systems fail before learning how to deploy them. Study networking (TCP, congestion, timeouts), storage (logs, indexes, compaction), and concurrency (threads, async, locks). Tools change. Physics doesn’t.

    2. Build systems that can break
    Don’t just read about consensus or queues - implement a toy Kafka, a basic Raft, a rate limiter, a WAL-backed store. The pain of debugging teaches you more than a thousand blog posts.

    3. Develop latency intuition
    Know the difference between nanoseconds, milliseconds, and seconds in your bones. Learn where time is spent: syscalls, serialization, cache misses, network hops. Top engineers think in budgets, not abstractions.

    4. Learn failure modes early
    Network partitions, partial writes, duplicate messages, clock skew - these aren’t edge cases, they’re the default. Design assuming things will fail and ask “what happens next?” every time.

    5. Write boring, correct code
    Fancy abstractions are cheap. Predictable behavior under load is rare. Prefer clarity over cleverness, invariants over hacks, and simplicity over “smart” shortcuts.

    6. Practice reasoning under pressure
    Distributed systems are about trade-offs: consistency vs availability, throughput vs latency, simplicity vs flexibility. Practice explaining why you chose something, not just what you chose.

    7. Use AI as an assistant, not a crutch
    Let AI help you explore ideas or reduce boilerplate but always understand the output. If you can’t explain it line by line, you didn’t learn it.

    8. Play the long game
    Muscle memory, intuition, and first-principles thinking take years. There is no speedrun. The people who “win early” by shortcuts often stall out later.

    The top 5% aren’t faster typers or better prompt engineers.
    They’re the ones who stayed with the hard problems long enough to truly understand them.`,
    metadata: { orgId: "demo-org", projectId: "demo-project" },
  });

  console.log("Ingest completed:", result);
};

run()
  .then(() => {
    console.log("Smoke ingest succeeded.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Smoke ingest failed:", err);
    process.exit(1);
  });
