/**
 * agentic-random: a toy random-number tool for agents.
 *
 * Zero dependencies. The whole point is the JSON contract:
 *
 *   runTool({ tool: "random.integer", params: { low: 1, high: 6 } })
 *   // => { ok: true, tool: "random.integer", values: [4], params: { ... } }
 *
 *   runTool({ tool: "random.teleport" })
 *   // => { ok: false, tool: "random.teleport", error: "unknown tool ..." }
 *
 * Uses Math.random(): great for dice, tokens, demos, picking items.
 * Do NOT use it for anything security-sensitive (only the uuid tool is
 * cryptographically strong, via crypto.randomUUID).
 */

import { randomUUID } from "node:crypto";

export const TOOLS = [
  "random.integer",
  "random.float",
  "random.choice",
  "random.string",
  "random.uuid",
];

const MAX_COUNT = 10_000;
const ALNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// --- one-liner helpers for direct imports ---------------------------------

export const randomInt = (low = 0, high = 100) =>
  low + Math.floor(Math.random() * (high - low + 1));

export const randomFloat = (low = 0, high = 1) => low + Math.random() * (high - low);

export const randomChoice = (items) => items[Math.floor(Math.random() * items.length)];

export const randomString = (length = 16) =>
  Array.from({ length }, () => ALNUM[Math.floor(Math.random() * ALNUM.length)]).join("");

export const randomUuid = () => randomUUID();

// --- the tool contract ------------------------------------------------------

function ok(name, values, params) {
  return { ok: true, tool: `random.${name}`, values, params };
}

function fail(tool, message) {
  return { ok: false, tool: String(tool), error: message };
}

export function runTool(request) {
  if (request === null || typeof request !== "object") {
    return fail(null, `request must be an object, got ${JSON.stringify(request)}`);
  }

  const tool = request.tool;
  const params = request.params ?? {};
  if (typeof params !== "object" || params === null) {
    return fail(tool, "'params' must be an object");
  }

  const name = String(tool).replace(/^random\./, "");
  if (!TOOLS.includes(`random.${name}`)) {
    return fail(tool, `unknown tool ${JSON.stringify(tool)}; available: ${TOOLS.join(", ")}`);
  }

  const count = Number(params.count ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    return fail(tool, `'count' must be an integer from 1 to ${MAX_COUNT}, got ${JSON.stringify(params.count ?? 1)}`);
  }

  switch (name) {
    case "integer": {
      const low = Number(params.low ?? 0);
      const high = Number(params.high ?? 100);
      if (!Number.isSafeInteger(low) || !Number.isSafeInteger(high)) {
        return fail(tool, `'low' and 'high' must be integers, got ${JSON.stringify([params.low ?? 0, params.high ?? 100])}`);
      }
      if (low > high) return fail(tool, `'low' (${low}) must be <= 'high' (${high})`);
      const values = Array.from({ length: count }, () => randomInt(low, high));
      return ok("integer", values, { low, high, count });
    }

    case "float": {
      const low = Number(params.low ?? 0);
      const high = Number(params.high ?? 1);
      if (!Number.isFinite(low) || !Number.isFinite(high)) {
        return fail(tool, "'low' and 'high' must be finite numbers");
      }
      if (low > high) return fail(tool, `'low' (${low}) must be <= 'high' (${high})`);
      const decimals = params.decimals == null ? null : Number(params.decimals);
      if (decimals != null && (!Number.isInteger(decimals) || decimals < 0 || decimals > 15)) {
        return fail(tool, `'decimals' must be an integer from 0 to 15, got ${JSON.stringify(params.decimals)}`);
      }
      const values = Array.from({ length: count }, () => {
        const v = randomFloat(low, high);
        return decimals == null ? v : Number(v.toFixed(decimals));
      });
      return ok("float", values, { low, high, count, decimals });
    }

    case "choice": {
      let items = params.items;
      if (typeof items === "string") {
        items = items.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
      }
      if (!Array.isArray(items) || items.length === 0) {
        return fail(tool, "'items' must be a non-empty array or comma-separated string");
      }
      const values = Array.from({ length: count }, () => randomChoice(items));
      return ok("choice", values, { population: items.length, count });
    }

    case "string": {
      const length = Number(params.length ?? 16);
      if (!Number.isInteger(length) || length < 1 || length > 1024) {
        return fail(tool, `'length' must be an integer from 1 to 1024, got ${JSON.stringify(params.length ?? 16)}`);
      }
      const values = Array.from({ length: count }, () => randomString(length));
      return ok("string", values, { length, count });
    }

    case "uuid": {
      const values = Array.from({ length: count }, () => randomUuid());
      return ok("uuid", values, { count });
    }

    default:
      return fail(tool, "not implemented");
  }
}
