# Notes for agents working in this repo

- This is a toy project: keep it small, zero runtime dependencies, Node >= 20, ES modules only.
- Randomness uses `Math.random()` on purpose. Do not add seedable PRNGs or extra distributions unless asked.
- The public contract is `runTool(request)` in `src/random.js` and the CLI in `bin/agentic-random.js`.
  It must always return/print JSON of the shape `{ok, tool, values, params}` or `{ok, tool, error}` —
  never throw or print a traceback for bad input.
- CLI exit codes: 0 success, 1 handled tool error, 2 usage error.
- Run the tests with `npm test` (uses the built-in `node --test` runner, no install step needed).
- `tools/random-number.tool.json` documents the tool for LLM function-calling; update it whenever ops change.
