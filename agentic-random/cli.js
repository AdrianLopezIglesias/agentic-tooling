#!/usr/bin/env node
/**
 * agentic-random CLI. Prints exactly one JSON object on stdout.
 * Exit codes: 0 success, 1 handled tool error, 2 usage error.
 */

import fs from "node:fs";
import { TOOLS, runTool } from "./random.js";

const USAGE = `agentic-random — toy random numbers for agents

usage:
  agentic-random <op> [--flag value ...]     e.g. agentic-random integer --low 1 --high 6 --count 2
  agentic-random --request '<json>'          e.g. --request '{"tool":"random.integer","params":{"low":1,"high":6}}'
  agentic-random --request -                 read the JSON request from stdin
  agentic-random --list | --help

ops and flags:
  integer  --low N --high N --count N
  float    --low N --high N --count N --decimals N
  choice   --items "a,b,c" --count N
  string   --length N --count N
  uuid     --count N

output: one JSON object {ok, tool, values, params} on stdout (use --compact for a single line).
`;

function print(obj, compact) {
  process.stdout.write(JSON.stringify(obj, null, compact ? 0 : 2) + "\n");
}

function die(tool, error, code, compact) {
  print({ ok: false, tool: tool ?? null, error }, compact);
  process.exit(code);
}

const argv = process.argv.slice(2);
let compact = false;
let requestRaw = null;
let op = null;
const params = {};

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === "--help" || arg === "-h") {
    process.stdout.write(USAGE);
    process.exit(0);
  } else if (arg === "--compact") {
    compact = true;
  } else if (arg === "--list") {
    print({ ok: true, tools: TOOLS }, compact);
    process.exit(0);
  } else if (arg === "--request") {
    requestRaw = argv[++i];
    if (requestRaw === undefined) die(null, "--request needs a JSON string or '-'", 2, compact);
  } else if (arg.startsWith("--")) {
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) die(null, `flag ${arg} needs a value`, 2, compact);
    params[arg.slice(2)] = value;
    i++;
  } else if (op) {
    die(null, `unexpected argument ${JSON.stringify(arg)}`, 2, compact);
  } else {
    op = arg;
  }
}

let request;
if (requestRaw != null) {
  const raw = requestRaw === "-" ? fs.readFileSync(0, "utf8") : requestRaw;
  try {
    request = JSON.parse(raw);
  } catch (e) {
    die(null, `invalid JSON request: ${e.message}`, 1, compact);
  }
} else if (op) {
  request = { tool: `random.${op}`, params };
} else {
  process.stderr.write(USAGE);
  die(null, "no command given; see --help", 2, compact);
}

const response = runTool(request);
print(response, compact);
process.exit(response.ok ? 0 : 1);
