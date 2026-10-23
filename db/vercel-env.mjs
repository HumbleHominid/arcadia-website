// Shared by the db/ scripts: read variables from a Vercel environment.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Pull the environment into a temp file, read the requested keys (undefined if missing),
// and delete the file. Needs the Vercel CLI, logged in and linked to this project.
export function pullVercelEnv(environment, keys) {
  const dir = mkdtempSync(join(tmpdir(), "arcadia-env-"));
  try {
    execFileSync(
      "vercel",
      [
        "env",
        "pull",
        "--yes",
        `--environment=${environment}`,
        join(dir, ".env"),
      ],
      { stdio: "ignore" },
    );
    const text = readFileSync(join(dir, ".env"), "utf8");
    return Object.fromEntries(
      keys.map((k) => [
        k,
        text.match(new RegExp(`^${k}="?([^"\\n]+)"?$`, "m"))?.[1],
      ]),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
