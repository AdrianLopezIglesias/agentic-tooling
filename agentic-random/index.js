/**
 * OpenCode plugin: registers `random_number` as a native tool for every agent.
 *
 * This folder (agentic-random/) is self-contained: OpenCode auto-discovers it
 * as a "plugin package directory" when copied to `~/.config/opencode/plugins/`
 * (all projects) or to a project's `.opencode/plugins/`. See install.sh and
 * README.md for the one-command install.
 *
 * No "@opencode/plugin" import on purpose: discovered local plugins may live
 * outside any node_modules; the plain { id, setup } default export is what
 * Plugin.define() produces anyway.
 */

import { TOOLS, runTool } from "./random.js"

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
