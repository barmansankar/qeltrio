/**
 * One-time setup: configure Cloudflare R2 bucket CORS for browser uploads.
 *
 * Usage:
 *   npm run configure:r2-cors
 *   npm run configure:r2-cors -- https://your-domain.com
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filename: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), filename), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env files.
  }
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const extraOrigin = process.argv[2];
  if (extraOrigin) {
    process.env.APP_URL = extraOrigin;
  }

  const { isR2Configured } = await import("../lib/r2/config");
  if (!isR2Configured()) {
    console.error("R2 is not configured. Set R2_* environment variables first.");
    process.exit(1);
  }

  const { ensureR2UploadCors } = await import("../lib/r2/cors");
  const origin = extraOrigin ? new URL(extraOrigin).origin : undefined;

  await ensureR2UploadCors(origin);
  console.log("R2 bucket CORS configuration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
