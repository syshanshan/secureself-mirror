/**
 * Supabase-only connectivity check — run with: node scripts/verify-supabase.mjs
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function mask(value) {
  if (!value) return "(missing)";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}…${value.slice(-4)} (${value.length} chars)`;
}

function headers(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
  };
}

function isValidSupabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname === "/"
    );
  } catch {
    return false;
  }
}

async function columnExists(url, key, column) {
  const res = await fetch(`${url}/rest/v1/mirror_entries?select=${column}&limit=0`, {
    headers: headers(key),
  });
  return res.ok;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

console.log("=== Supabase connection check ===\n");

// 1. Environment variables
console.log("1. Environment variables");
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${url || "(missing)"}`);
console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${mask(anonKey)}`);
const envLoaded = Boolean(url && anonKey);
console.log(`   Result: ${envLoaded ? "PASS" : "FAIL"}\n`);

// 2. URL format
console.log("2. Supabase URL format");
const urlValid = isValidSupabaseUrl(url);
console.log(`   URL: ${url || "(missing)"}`);
console.log(`   Result: ${urlValid ? "PASS" : "FAIL"}\n`);

let keyValid = false;
let connected = false;
let schemaReadable = false;
let missingColumns = [];

if (envLoaded && urlValid) {
  // 3. Anon key — auth health endpoint accepts the key
  console.log("3. Supabase anon key");
  const authRes = await fetch(`${url}/auth/v1/health`, {
    headers: { apikey: anonKey },
  });
  keyValid = authRes.ok;
  console.log(`   Auth health: HTTP ${authRes.status}`);
  console.log(`   Result: ${keyValid ? "PASS" : "FAIL"}\n`);

  // 4. Connection — query mirror_entries (REST root requires service_role)
  console.log("4. Supabase connection");
  const tableRes = await fetch(`${url}/rest/v1/mirror_entries?select=id&limit=1`, {
    headers: headers(anonKey),
  });
  connected = tableRes.ok;
  console.log(`   mirror_entries query: HTTP ${tableRes.status}`);
  if (!connected) {
    const body = await tableRes.text();
    console.log(`   Error: ${body.slice(0, 200)}`);
  }
  console.log(`   Result: ${connected ? "PASS" : "FAIL"}\n`);

  // 5. Schema — probe expected app columns
  console.log("5. Database schema");
  const expectedColumns = [
    "id",
    "session_id",
    "situation",
    "original_message",
    "anxious_pattern_analysis",
    "anxiety_score",
    "secure_rewrite",
    "boundary_statement",
    "suggested_next_action",
    "what_not_to_do",
    "created_at",
  ];

  const columnStatus = [];
  for (const col of expectedColumns) {
    const exists = await columnExists(url, anonKey, col);
    columnStatus.push({ col, exists });
  }

  const present = columnStatus.filter((c) => c.exists).map((c) => c.col);
  missingColumns = columnStatus.filter((c) => !c.exists).map((c) => c.col);

  schemaReadable = connected && present.length > 0;
  console.log(`   mirror_entries table: ${connected ? "reachable" : "unreachable"}`);
  console.log(`   Columns present (${present.length}): ${present.join(", ") || "none"}`);
  if (missingColumns.length) {
    console.log(`   Columns missing (${missingColumns.length}): ${missingColumns.join(", ")}`);
  }
  console.log(`   Result: ${schemaReadable ? "PASS (partial)" : "FAIL"}\n`);
}

const allPass = envLoaded && urlValid && keyValid && connected && schemaReadable;

console.log("=== Summary ===");
console.log(`Env loaded:       ${envLoaded ? "PASS" : "FAIL"}`);
console.log(`URL valid:        ${urlValid ? "PASS" : "FAIL"}`);
console.log(`Anon key valid:   ${keyValid ? "PASS" : "FAIL"}`);
console.log(`Connected:        ${connected ? "PASS" : "FAIL"}`);
console.log(`Schema readable:  ${schemaReadable ? "PASS" : "FAIL"}`);
console.log("");
if (allPass && missingColumns.length) {
  console.log(
    "Supabase is connected. mirror_entries exists but is missing columns the app expects."
  );
  console.log("Run supabase/schema.sql in the SQL Editor to align the schema.");
} else if (allPass) {
  console.log("Supabase is fully connected and schema matches the app.");
} else {
  console.log("Supabase verification incomplete — see failures above.");
}

process.exit(allPass ? 0 : 1);
