/**
 * OpenCode plugin: registers `random_number` as a native tool for every agent.
 *
 * Loaded automatically by OpenCode when reachable at
 * `<project>/.opencode/plugins/agentic-random.js`, e.g. via a one-line
 * re-export (adjust the path as needed):
 *
 *   export { default } from "../../agentic-tooling/plugin/index.js"
 *
 * No "@opencode/plugin" import here on purpose: local plugins under
 * .opencode/plugins/ have no node_modules to resolve it from. The plain
 * { id, setup } default export is what Plugin.define() produces anyway;
 * if you publish this as a package, wrap it in Plugin.define() for types.
 */

import { TOOLS, runTool } from "../src/random.js"

export default {
  id: "agentic-random",
  async setup(ctx) {
    await ctx.tool.transform((editor) => {
      editor.add({
        name: "random_number",
        description:
          "Generate random values with Math.random(): integers, floats, choices from a list, alphanumeric strings, and crypto-random UUIDs. Output is a JSON string: {ok, tool, values, params} on success, {ok: false, error} on bad input.",
        input: {
          type: "object",
          properties: {
            tool: {
              type: "string",
              enum: TOOLS,
              description: "Which generator to run.",
            },
            params: {
              type: "object",
              description:
                'Generator options. integer/float: low, high, count (float also: decimals). choice: items (array or "a,b,c" string), count. string: length, count. uuid: count.',
              additionalProperties: true,
            },
          },
          required: ["tool"],
          additionalProperties: false,
        },
        execute: async (input) => {
          const response = runTool({ tool: input.tool, params: input.params ?? {} })
          return { content: JSON.stringify(response) }
        },
      })
    })
  },
}
