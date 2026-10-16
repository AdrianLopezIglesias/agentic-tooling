import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BIN = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "agentic-random.js");

function run(args, input) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    input,
  });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

test("integer subcommand prints JSON and exits 0", () => {
  const { code, out } = run(["integer", "--low", "1", "--high", "6", "--count", "3"]);
  assert.equal(code, 0);
  const r = JSON.parse(out);
  assert.equal(r.ok, true);
  assert.equal(r.values.length, 3);
  assert.ok(r.values.every((v) => v >= 1 && v <= 6));
});

test("--request takes a raw JSON object", () => {
  const { code, out } = run(["--request", '{"tool":"random.integer","params":{"low":5,"high":5}}']);
  assert.equal(code, 0);
  assert.deepEqual(JSON.parse(out).values, [5]);
});

test("--request - reads from stdin", () => {
  const { code, out } = run(["--request", "-"], '{"tool":"random.uuid"}');
  assert.equal(code, 0);
  assert.match(JSON.parse(out).values[0], /^.{8}-.{4}-.{4}-.{4}-.{12}$/);
});

test("handled tool errors exit 1 with JSON on stdout", () => {
  const { code, out } = run(["integer", "--low", "10", "--high", "1"]);
  assert.equal(code, 1);
  const r = JSON.parse(out);
  assert.equal(r.ok, false);
  assert.match(r.error, /must be <=/);
});

test("invalid JSON request exits 1", () => {
  const { code, out } = run(["--request", "{not json"]);
  assert.equal(code, 1);
  assert.match(JSON.parse(out).error, /invalid JSON/);
});

test("--list shows the tools", () => {
  const { code, out } = run(["--list"]);
  assert.equal(code, 0);
  assert.ok(JSON.parse(out).tools.includes("random.integer"));
});

test("no command exits 2 with usage", () => {
  const { code, err, out } = run([]);
  assert.equal(code, 2);
  assert.match(err, /usage/);
  assert.equal(JSON.parse(out).ok, false);
});

test("--compact prints a single line", () => {
  const { out } = run(["--compact", "integer"]);
  assert.equal(out.trim().split("\n").length, 1);
});
