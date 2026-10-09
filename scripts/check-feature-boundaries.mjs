#!/usr/bin/env node
// Enforces the folder rules in DECISIONS.md (2026-10-08, "Frontend organized by feature"):
//   1. features never import routes (`@/app/...`)
//   2. `shared/` imports no feature
//   3. features may import each other, but never in a cycle (of any length)
//
// ESLint's import/no-cycle works file by file, so it misses a cycle that runs
// through different files of two features. This checks the feature-level graph.
//
// Run: npm run lint:features

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = new URL("../src/", import.meta.url).pathname;
const IMPORT = /(?:from|import)\s*\(?\s*["']@\/(features\/([a-z0-9-]+)|app\/)/g;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name)) yield path;
  }
}

const problems = [];
const graph = new Map(); // feature -> Map(importedFeature -> first file that does it)

for (const feature of readdirSync(join(SRC, "features"))) {
  graph.set(feature, new Map());
  for (const file of files(join(SRC, "features", feature))) {
    for (const [, target, imported] of readFileSync(file, "utf8").matchAll(IMPORT)) {
      if (target === "app/") problems.push(`${relative(SRC, file)} imports a route`);
      else if (imported !== feature && !graph.get(feature).has(imported)) {
        graph.get(feature).set(imported, relative(SRC, file));
      }
    }
  }
}

for (const file of files(join(SRC, "shared"))) {
  for (const [, target] of readFileSync(file, "utf8").matchAll(IMPORT)) {
    problems.push(`${relative(SRC, file)} (shared) imports @/${target}`);
  }
}

// Report each cycle once, starting from its alphabetically first feature.
const seen = new Set();
function walk(start, node, path) {
  for (const [next] of graph.get(node) ?? []) {
    if (next === start) {
      const key = path.join(">");
      if (seen.has(key)) continue;
      seen.add(key);
      const steps = path.map((f, i) => {
        const to = path[i + 1] ?? start;
        return `  ${f} -> ${to}  (${graph.get(f).get(to)})`;
      });
      problems.push(`cycle: ${[...path, start].join(" -> ")}\n${steps.join("\n")}`);
    } else if (next > start && !path.includes(next)) {
      walk(start, next, [...path, next]);
    }
  }
}
for (const feature of graph.keys()) walk(feature, feature, [feature]);

if (problems.length) {
  console.error(`Feature boundary violations:\n\n${problems.join("\n\n")}`);
  process.exit(1);
}
console.log(`Feature boundaries OK (${graph.size} features, no cycles).`);
