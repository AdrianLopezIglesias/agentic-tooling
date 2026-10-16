/**
 * OpenCode plugin: exposes `random_number` as a real tool for every agent.
 *
 * To wire it into a project, create a file at `.opencode/plugins/agentic-random.js`
 * that re-exports this plugin (OpenCode auto-loads files there):
 *
 *   export { default } from "../../agentic-tooling/plugin/index.js"
 *
 * Or add the path to this plugin's folder to the "plugins" list in opencode.json.
 */

import { Plugin } from "@opencode/plugin"
import { TOOLS, runTool } from "../src/random.js"

export default Plugin.define({
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
                "Generator options. integer/float: low, high, count (float also: decimals). choice: items (array or \"a,b,c\" string), count. string: length, count. uuid: count.",
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
})
