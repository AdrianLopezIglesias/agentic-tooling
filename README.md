# agentic-tooling

A tiny home for **agent tools**: small, single-purpose programs that an AI
agent can call from the shell. Zero dependencies, JSON in / JSON out.

First tool: **agentic-random** — random numbers (and friends) via `Math.random()`.
Toy project, so output is not reproducible across runs; for security-sensitive
randomness reach for `random.uuid` (crypto-backed) or a real CSPRNG.

## Quickstart

```bash
node bin/agentic-random.js integer --low 1 --high 6 --count 2
```

```json
{
  "ok": true,
  "tool": "random.integer",
  "values": [1, 5],
  "params": { "low": 1, "high": 6, "count": 2 }
}
```

No install step needed. With `npm link` you also get an `agentic-random` command.

## What it does

| op              | flags                                       | default              |
| --------------- | ------------------------------------------- | -------------------- |
| `random.integer`| `--low --high --count`                      | 1–100, inclusive     |
| `random.float`  | `--low --high --count --decimals`           | 0.0–1.0              |
| `random.choice` | `--items "a,b,c" --count`                   | 1 pick, with repeats |
| `random.string` | `--length --count`                          | 1× 16 alnum chars    |
| `random.uuid`   | `--count`                                   | 1 (crypto-random)    |

## The agent contract

Every call prints **exactly one JSON object** on stdout:

- success: `{"ok": true, "tool", "values", "params"}` — `params` echoes the effective values
- failure: `{"ok": false, "tool", "error"}` — friendly message, never a stack trace
- exit codes: `0` ok · `1` handled tool error · `2` usage error

Agents that prefer raw JSON requests skip the flag parsing entirely —
`--request` takes the JSON inline or `-` to read it from stdin:

```bash
echo '{"tool":"random.choice","params":{"items":"red, green, blue","count":3}}' \
  | node bin/agentic-random.js --request -
```

```json
{
  "ok": true,
  "tool": "random.choice",
  "values": ["blue", "green", "blue"],
  "params": { "population": 3, "count": 3 }
}
```

Handy flags: `--compact` (one line), `--list` (show ops), `--help`.

`tools/random-number.tool.json` contains a ready-to-use function-call schema,
and `AGENTS.md` explains the contract for agents working *on* the repo.

## Use as a library

```js
import { runTool, randomInt } from "agentic-tooling"; // or the src/random.js path

randomInt(1, 6);                       // a number
runTool({ tool: "random.float", params: { low: 1.5, high: 2.5, decimals: 3 } });
```

## Tests

```bash
npm test        # or: node --test
```

Uses the built-in `node:test` runner — 19 tests, no dependencies.

## License

MIT — see [LICENSE](LICENSE).
