import { createContextEngineWithDrizzle } from "../context-engine.config";

const main = async () => {
  const engine = createContextEngineWithDrizzle();

  const result = await engine.retrieve({
    query: "top developers",
    topK: 5,
    scope: { orgId: "demo-org", projectId: "demo-project" },
    includeDocument: true,
  });

  console.log("Retrieve completed:");
  for (const chunk of result.chunks) {
    console.log(
      `score=${chunk.score.toFixed(4)} doc=${chunk.documentId} idx=${chunk.index} content="${chunk.content.slice(0, 80)}..."`,
    );

    if (chunk.documentContent) {
      console.log(
        `  doc-body (head): "${chunk.documentContent.slice(0, 100)}..."`,
      );
    }
  }
};

main().catch((err) => {
  console.error("Smoke retrieve failed:", err);
  process.exit(1);
});
