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
    content:
      `Coding tools are fine, useful, and they definitely help you make the design a reality. A lot of the commentary I’ve seen is about making design quality happen through better implementation, which is great but not really about designing.
I tend to think about design as a search, not a production pipeline. You start with a messy problem. Early on, you do not know the answer. This is why I never fully buy the idea that design is about output. I agree that design is useless without shipping, but the process of designing is not.
The design process, and the suffering part of that process, are valuable.
Constraints
Constraints are not the enemy, but they can arrive early. 

Constraints exist in reality: time, budgets, codebases, teams, customers. The mistake is letting those constraints define the space before you have found a direction worth committing to. Then they start shaping your imagination. Early design is about direction. You are trying to find a form that resolves the problem in a way that feels obvious once you see it. That phase benefits from speed, looseness, and tools that let you change your mind without paying a tax for it. Later, constraints become essential. You want reality to push back. You want the medium to answer your questions. That is where prototyping, code, edge cases, performance, and all the sharp corners start improving the work. That is where the craft shows up, and where design-code tools can be useful.
Architecture analog
Architecture is full of constraints, more constraints than software will ever have: materials, gravity, weather, budgets, labor, code, zoning, politics. 
Yet it still often starts with sketches. Not because sketching is pure or nostalgic, but because it is a way to separate form from construction long enough to find something worth constructing. A sketch is not a smaller version of the final building. It is a different mode of thinking. It gives you permission to be wrong in interesting ways, and to paint broad strokes. You don’t design houses by iterating from one corner to a full house piece by piece.`,
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
