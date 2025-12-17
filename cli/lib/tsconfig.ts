import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { exists } from "./fs";

type TsConfig = Record<string, unknown> & {
  compilerOptions?: Record<string, unknown> & {
    baseUrl?: string;
    paths?: Record<string, string[]>;
  };
};

const stripJsonComments = (input: string) => {
  // Remove /* */ block comments
  const withoutBlocks = input.replace(/\/\*[\s\S]*?\*\//g, "");
  // Remove // line comments (naive but works for typical tsconfig)
  return withoutBlocks.replace(/^\s*\/\/.*$/gm, "");
};

const stripTrailingCommas = (input: string) => {
  // Remove trailing commas in objects/arrays: { "a": 1, } or [1,2,]
  return input.replace(/,\s*([}\]])/g, "$1");
};

const parseJsoncLoose = (raw: string) => {
  const noComments = stripJsonComments(raw);
  const noTrailingCommas = stripTrailingCommas(noComments);
  return JSON.parse(noTrailingCommas) as TsConfig;
};

export async function patchTsconfigPaths(params: {
  projectRoot: string;
  installDir: string; // posix project-relative
}): Promise<{ changed: boolean; file?: string }> {
  const candidates = ["tsconfig.json", "jsconfig.json"];
  const configFile =
    (await exists(path.join(params.projectRoot, "tsconfig.json")))
      ? "tsconfig.json"
      : (await exists(path.join(params.projectRoot, "jsconfig.json")))
        ? "jsconfig.json"
        : null;

  if (!configFile) return { changed: false };

  const abs = path.join(params.projectRoot, configFile);
  const raw = await readFile(abs, "utf8");
  let parsed: TsConfig;
  try {
    parsed = parseJsoncLoose(raw);
  } catch {
    // Fail-soft: don't block installation if the user's tsconfig is non-standard.
    return { changed: false, file: configFile };
  }

  const next: TsConfig = { ...parsed };
  next.compilerOptions = { ...(parsed.compilerOptions ?? {}) };
  next.compilerOptions.baseUrl = next.compilerOptions.baseUrl ?? ".";
  next.compilerOptions.paths = { ...(next.compilerOptions.paths ?? {}) };

  const aliasKey = "@rag/*";
  const target = [`./${params.installDir.replace(/\\/g, "/")}/*`];
  const configAliasKey = "@rag/config";
  const configTarget = ["./rag.config.ts"];

  const existing = next.compilerOptions.paths[aliasKey];
  if (existing && JSON.stringify(existing) === JSON.stringify(target)) {
    // still might need to add @rag/config
  }

  if (!existing) {
    next.compilerOptions.paths[aliasKey] = target;
  }

  if (!next.compilerOptions.paths[configAliasKey]) {
    next.compilerOptions.paths[configAliasKey] = configTarget;
  }

  // Only write if something actually changed
  const changed = JSON.stringify(next) !== JSON.stringify(parsed);
  if (!changed) return { changed: false, file: configFile };

  await writeFile(abs, JSON.stringify(next, null, 2) + "\n", "utf8");
  return { changed: true, file: configFile };
}


