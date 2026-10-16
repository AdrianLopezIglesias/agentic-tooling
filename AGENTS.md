# Notes for agents working in this repo

- This is a toy project: keep it small, zero runtime dependencies, Node >= 20, ES modules only.
- Randomness uses `Math.random()` on purpose. Do not add seedable PRNGs or extra distributions unless asked.
- `agentic-random/` is **one self-contained folder** — the unit users copy when installing
  (Claude Code skill via `SKILL.md`, OpenCode plugin via `index.js` + `package.json`).
  Everything the folder needs must live inside it; never import outside it.
- The public contract is `runTool(request)` in `agentic-random/random.js` and the CLI in
  `agentic-random/cli.js`. It must always return/print JSON of the shape `{ok, tool, values, params}`
  or `{ok, tool, error}` — never throw or print a stack trace for bad input.
- CLI exit codes: 0 success, 1 handled tool error, 2 usage error.
- Run the tests from the repo root with `npm test` (built-in `node --test`, no install step).
- `agentic-random/random-number.tool.json` documents the tool for LLM function-calling;
  `install.sh` (bash, LF endings via .gitattributes) wires the folder into `~/.claude/skills/`
  and `~/.config/opencode/plugins/`. When ops change, update all of these plus README and SKILL.md.
