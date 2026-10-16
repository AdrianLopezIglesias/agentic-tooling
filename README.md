# agentic-tooling

A tiny home for **agent tools**: small, single-purpose programs that an AI
agent can call. Zero dependencies, JSON in / JSON out.

First tool: **agentic-random** — random numbers (and friends) via `Math.random()`.
Toy project, so output is not reproducible across runs; for security-sensitive
randomness reach for `random.uuid` (crypto-backed) or a real CSPRNG.

## Install (macOS / Linux)

One command. It clones this repo, then copies the **single self-contained
`agentic-random/` folder** into the folders Claude Code and OpenCode
auto-discover — no restart, no package install, no dependencies:

```bash
curl -fsSL https://raw.githubusercontent.com/AdrianLopezIglesias/agentic-tooling/main/install.sh | bash
```

Or, if you already have the repo checked out somewhere: `bash install.sh`.

What it runs, in full:

```bash
git clone-or-pull https://github.com/AdrianLopezIglesias/agentic-tooling ~/.local/share/agentic-tooling
cp -R ~/.local/share/agentic-tooling/agentic-random ~/.claude/skills/           # Claude Code
cp -R ~/.local/share/agentic-tooling/agentic-random ~/.config/opencode/plugins/ # OpenCode
```

Pick one target with `--claude` or `--opencode`. Updating later = re-run the same command.

**Claude Code** picks up the `agentic-random/` skill folder live (or run
`/reload-skills` once if it was missing at startup); Claude invokes it
automatically when you ask for dice rolls, random picks, tokens, etc.
**OpenCode** discovers folders in `~/.config/opencode/plugins/` as plugin
packages and registers a native `random_number` tool for **every agent**
(restart `opencode service` once if it doesn't appear).

To do it by hand instead of via the script: just copy the `agentic-random/`
folder to either of those locations. Everything it needs is inside it.

## What it does

| op              | flags                                       | default              |
| --------------- | ------------------------------------------- | -------------------- |
| `random.integer`| `--low --high --count`                      | 1–100, inclusive     |
| `random.float`  | `--low --high --count --decimals`           | 0.0–1.0              |
| `random.choice` | `--items "a,b,c" --count`                   | 1 pick, with repeats |
| `random.string` | `--length --count`                          | 1× 16 alnum chars    |
| `random.uuid`   | `--count`                                   | 1 (crypto-random)    |

```bash
$ node agentic-random/cli.js integer --low 1 --high 6 --count 2
{
  "ok": true,
  "tool": "random.integer",
  "values": [1, 5],
  "params": { "low": 1, "high": 6, "count": 2 }
}
```

## The agent contract

Every call prints **exactly one JSON object** on stdout:

- success: `{"ok": true, "tool", "values", "params"}` — `params` echoes the effective values
- failure: `{"ok": false, "tool", "error"}` — friendly message, never a stack trace
- exit codes: `0` ok · `1` handled tool error · `2` usage error

Agents that prefer raw JSON skip the flag parsing entirely —
`--request` takes the JSON inline or `-` to read it from stdin:

```bash
echo '{"tool":"random.choice","params":{"items":"red, green, blue","count":3}}' \
  | node agentic-random/cli.js --request -
```

Handy flags: `--compact` (one line), `--list` (show ops), `--help`.

## Repo layout

```
agentic-random/              ← the one folder installs copy
├── SKILL.md                 # Agent-Skills spec: Claude Code skill entry
├── index.js                 # OpenCode plugin: registers random_number for all agents
├── random.js                # the tool (runTool + one-liner helpers, stdlib only)
├── cli.js                   # JSON-first CLI (also used by the skill)
├── package.json             # makes the folder a plugin package dir / npm-linkable
└── random-number.tool.json  # function-call schema for other harnesses
install.sh                   # the one-command unix installer
tests/                       # node --test, 19 tests
```

## Use as a library

```js
import { runTool, randomInt } from "agentic-tooling";

randomInt(1, 6);                     // a number
runTool({ tool: "random.float", params: { low: 1.5, high: 2.5, decimals: 3 } });
```

## Tests

```bash
npm test        # or: node --test
```

Uses the built-in `node:test` runner — no dependencies.

## License

MIT — see [LICENSE](LICENSE).
