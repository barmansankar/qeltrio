import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface ServiceAccountCredentials {
  project_id: string;
  client_email: string;
  private_key: string;
}

/**
 * Reads a single variable from `.env.local`, including multiline quoted values.
 */
export function readEnvLocalValue(name: string): string | undefined {
  const envPath = resolve(process.cwd(), ".env.local");
  let raw: string;

  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    return undefined;
  }

  const marker = `${name}=`;
  const start = raw.indexOf(marker);
  if (start === -1) return undefined;

  let cursor = start + marker.length;
  while (cursor < raw.length && (raw[cursor] === " " || raw[cursor] === "\t")) {
    cursor += 1;
  }

  const quote = raw[cursor];
  if (quote === "'" || quote === '"') {
    cursor += 1;
    const valueStart = cursor;

    while (cursor < raw.length) {
      const char = raw[cursor];
      if (char === quote && raw[cursor - 1] !== "\\") {
        return raw.slice(valueStart, cursor);
      }
      cursor += 1;
    }

    throw new Error(`${name} has an unterminated quoted value in .env.local`);
  }

  const lineEnd = raw.indexOf("\n", cursor);
  const line = (lineEnd === -1 ? raw.slice(cursor) : raw.slice(cursor, lineEnd)).trim();
  return line || undefined;
}

export function parseServiceAccountFromEnvFile(): ServiceAccountCredentials {
  const raw = readEnvLocalValue("FIREBASE_SERVICE_ACCOUNT_KEY");

  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local"
    );
  }

  try {
    return JSON.parse(raw) as ServiceAccountCredentials;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON in .env.local");
  }
}
