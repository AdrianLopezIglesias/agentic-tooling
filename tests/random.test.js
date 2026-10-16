import test from "node:test";
import assert from "node:assert/strict";
import { TOOLS, runTool } from "../src/random.js";

function okRun(tool, params) {
  const r = runTool({ tool, params });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  return r;
}

test("envelope shape", () => {
  const r = okRun("random.integer", {});
  assert.deepEqual(Object.keys(r).sort(), ["ok", "params", "tool", "values"]);
  assert.equal(r.tool, "random.integer");
});

test("integer stays inside inclusive bounds", () => {
  for (let i = 0; i < 300; i++) {
    const v = okRun("random.integer", { low: 1, high: 6 }).values[0];
    assert.ok(Number.isInteger(v) && v >= 1 && v <= 6, `out of range: ${v}`);
  }
});

test("integer hits both extremes eventually", () => {
  const seen = new Set();
  for (let i = 0; i < 500; i++) seen.add(okRun("random.integer", { low: 1, high: 6 }).values[0]);
  for (const n of [1, 6]) assert.ok(seen.has(n), `never saw ${n}`);
});

test("count is respected", () => {
  assert.equal(okRun("random.integer", { count: 7 }).values.length, 7);
});

test("float stays in range and respects decimals", () => {
  const r = okRun("random.float", { low: 2.5, high: 7.5, count: 100, decimals: 2 });
  for (const v of r.values) {
    assert.ok(v >= 2.5 && v <= 7.5);
    assert.equal(v, Number(v.toFixed(2)));
  }
});

test("choice from array and comma string", () => {
  const r = okRun("random.choice", { items: ["a", "b", "c"], count: 20 });
  assert.ok(r.values.every((v) => ["a", "b", "c"].includes(v)));
  assert.equal(r.params.population, 3);

  const r2 = okRun("random.choice", { items: "red, green, blue" });
  assert.ok(["red", "green", "blue"].includes(r2.values[0]));
});

test("string has requested length and charset", () => {
  const r = okRun("random.string", { length: 24, count: 5 });
  for (const v of r.values) {
    assert.equal(v.length, 24);
    assert.match(v, /^[A-Za-z0-9]+$/);
  }
});

test("uuid is a valid v4", () => {
  const r = okRun("random.uuid", { count: 10 });
  for (const v of r.values) {
    assert.match(v, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  }
});

test("tool names work with or without the random. prefix", () => {
  assert.equal(okRun("integer", { count: 1 }).ok, true);
  assert.equal(okRun("random.integer", { count: 1 }).ok, true);
});

test("errors are structured, never thrown", () => {
  assert.equal(runTool({ tool: "random.teleport" }).ok, false);
  assert.match(runTool({ tool: "random.teleport" }).error, /available/);
  assert.equal(runTool({ tool: "random.integer", params: { low: 10, high: 1 } }).ok, false);
  assert.equal(runTool({ tool: "random.integer", params: { low: "banana" } }).ok, false);
  assert.equal(runTool({ tool: "random.integer", params: { count: 0 } }).ok, false);
  assert.equal(runTool({ tool: "random.integer", params: { count: 100001 } }).ok, false);
  assert.equal(runTool({ tool: "random.float", params: { decimals: 99 } }).ok, false);
  assert.equal(runTool({ tool: "random.choice", params: { items: [] } }).ok, false);
  assert.equal(runTool({ tool: "random.string", params: { length: 0 } }).ok, false);
  assert.equal(runTool("not an object").ok, false);
  assert.equal(runTool({ tool: "random.integer", params: "nope" }).ok, false);
});

test("TOOLS lists every documented op", () => {
  assert.deepEqual(TOOLS, ["random.integer", "random.float", "random.choice", "random.string", "random.uuid"]);
});
