---
name: agentic-random
description: Generate random numbers and values — dice rolls, random integers and floats, picks from a list, random tokens/strings, and UUIDs — by running the bundled zero-dependency Node CLI. Use whenever the user asks for random numbers, coin flips, dice, picking items at random, or generating random tokens/passwords/samples.
license: MIT
---

# agentic-random

Run the CLI bundled in this skill folder with Node (no install step, no dependencies):

```bash
node <this-folder>/cli.js <op> [--flag value ...]
```

If installed as a personal skill, `<this-folder>` is `~/.claude/skills/agentic-random`
(or `~/.config/opencode/plugins/agentic-random` in OpenCode; in a project, the matching
`.claude/skills/...` / `.opencode/plugins/...` path).

## Operations

| op              | flags                              | defaults               |
| --------------- | ---------------------------------- | ---------------------- |
| `integer`       | `--low --high --count`             | 0–100 inclusive, 1     |
| `float`         | `--low --high --count --decimals`  | 0.0–1.0, 1 value       |
| `choice`        | `--items "a,b,c" --count`          | 1 pick, with repeats   |
| `string`        | `--length --count`                 | 1× 16 alnum chars      |
| `uuid`          | `--count`                          | 1 (crypto-random)      |

## Examples

```bash
node ~/.claude/skills/agentic-random/cli.js integer --low 1 --high 20 --count 3
node ~/.claude/skills/agentic-random/cli.js choice --items "alice, bob, carol" --count 2
node ~/.claude/skills/agentic-random/cli.js string --length 24 --count 1
node ~/.claude/skills/agentic-random/cli.js --request '{"tool":"random.uuid","params":{"count":2}}'
```

## Contract

- stdout is always exactly one JSON object: `{"ok": true, "tool", "values", "params}` on success,
  `{"ok": false, "tool", "error"}` on failure — parse it, don't scrape text.
- Exit codes: `0` ok · `1` handled tool error · `2` usage error.
- `--list` shows ops, `--compact` prints one line.
- Randomness is `Math.random()` (not reproducible); only `uuid` is cryptographically strong.
