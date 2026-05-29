/**
 * Connectivity check — run with: node scripts/verify-connections.mjs
 * Does not print secret values.
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

function supabaseHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function verifyOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, message: "OPENAI_API_KEY is not set" };
  }

  try {
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 5,
        messages: [{ role: "user", content: "Reply with OK only." }],
      }),
    });

    const body = await res.json();

    if (!res.ok) {
      const errMsg =
        body?.error?.message ?? `HTTP ${res.status} ${res.statusText}`;
      return { ok: false, message: errMsg };
    }

    const text = body.choices?.[0]?.message?.content?.trim();
    return {
      ok: true,
      message: `Connected (model: ${model}, response: "${text ?? "empty"}")`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

async function verifySupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceKey || anonKey;

  if (!url || !anonKey) {
    return {
      ok: false,
      tableExists: false,
      writeOk: false,
      message: "Supabase URL or anon key is not set",
    };
  }

  try {
    const restRes = await fetch(`${url}/rest/v1/`, {
      headers: supabaseHeaders(key),
    });

    if (restRes.status === 401 || restRes.status === 403) {
      return {
        ok: false,
        tableExists: false,
        writeOk: false,
        message: `Auth failed (HTTP ${restRes.status}) — check your Supabase keys`,
      };
    }

    const tableRes = await fetch(`${url}/rest/v1/mirror_entries?select=id&limit=1`, {
      headers: supabaseHeaders(key),
    });

    const tableBody = await tableRes.text();

    if (tableRes.status === 404 || tableBody.includes("PGRST205")) {
      return {
        ok: true,
        tableExists: false,
        writeOk: false,
        message:
          "Connected, but mirror_entries table is missing — run supabase/schema.sql in the Supabase SQL Editor",
      };
    }

    if (!tableRes.ok) {
      return {
        ok: false,
        tableExists: false,
        writeOk: false,
        message: `Table check failed (HTTP ${tableRes.status}): ${tableBody.slice(0, 200)}`,
      };
    }

    const sessionId = `verify-${crypto.randomUUID()}`;
    const insertRes = await fetch(`${url}/rest/v1/mirror_entries`, {
      method: "POST",
      headers: supabaseHeaders(key),
      body: JSON.stringify({
        session_id: sessionId,
        situation: "Connection verification test",
        original_message: "Test message — safe to delete",
        anxious_pattern_analysis: "Test pattern",
        anxiety_score: 50,
        secure_rewrite: "Test rewrite",
        boundary_statement: "Test boundary",
        suggested_next_action: "Test action",
        what_not_to_do: "Test avoid",
      }),
    });

    const insertBody = await insertRes.text();

    if (!insertRes.ok) {
      return {
        ok: true,
        tableExists: true,
        writeOk: false,
        message: `Connected; mirror_entries exists but write failed (HTTP ${insertRes.status}): ${insertBody.slice(0, 200)}`,
      };
    }

    const inserted = JSON.parse(insertBody);
    const id = Array.isArray(inserted) ? inserted[0]?.id : inserted?.id;

    if (id) {
      await fetch(`${url}/rest/v1/mirror_entries?id=eq.${id}`, {
        method: "DELETE",
        headers: supabaseHeaders(key),
      });
    }

    return {
      ok: true,
      tableExists: true,
      writeOk: true,
      message: "Connected; mirror_entries exists; insert/delete test passed",
    };
  } catch (err) {
    return {
      ok: false,
      tableExists: false,
      writeOk: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

loadEnvLocal();

console.log("=== SecureSelf Mirror — connection check ===\n");
console.log("Env (masked):");
console.log(`  OPENAI_API_KEY: ${mask(process.env.OPENAI_API_KEY)}`);
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(missing)"}`);
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${mask(process.env.SUPABASE_SERVICE_ROLE_KEY)}`);
console.log("");

const openai = await verifyOpenAI();
console.log(`OpenAI: ${openai.ok ? "PASS" : "FAIL"} — ${openai.message}`);

const supabase = await verifySupabase();
console.log(`Supabase: ${supabase.ok ? "PASS" : "FAIL"} — ${supabase.message}`);
if (supabase.tableExists) {
  console.log(`  Table: mirror_entries exists`);
  console.log(`  Write test: ${supabase.writeOk ? "PASS" : "FAIL"}`);
}

const ready = openai.ok && supabase.ok && supabase.tableExists && supabase.writeOk;

console.log("");
if (ready) {
  console.log("READY — App is fully connected and ready for testing.");
} else {
  console.log("NOT READY — Fix the issues above before end-to-end testing.");
}

process.exit(ready ? 0 : 1);
