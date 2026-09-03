/**
 * Removes the legacy `.next` junction if present.
 * Junctioning `.next` to AppData breaks PostCSS/Turbopack module resolution
 * when the project lives on a different drive than node_modules.
 */
import { existsSync, lstatSync, rmSync } from "node:fs";
import { join } from "node:path";

const linkPath = join(process.cwd(), ".next");

if (existsSync(linkPath) && lstatSync(linkPath).isSymbolicLink()) {
  rmSync(linkPath, { recursive: true, force: true });
  console.log("[qeltrio] Removed .next junction. Using local .next cache.");
}
