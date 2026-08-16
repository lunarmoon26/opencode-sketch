# OpenCode Sketch

## Structure

- `plugin/sketch-mcporter.ts` is the runtime entrypoint. It resolves the
  sibling `plugin/sketch.mcp.jsonc` with `import.meta.url`; always ship/copy
  those files together.
- The bundled server is named `sketch` and targets Sketch's local MCP endpoint
  at `http://localhost:31126/mcp`.
- The plugin exposes one native `sketch` tool, not one tool per MCP method. Pass
  the exact MCP method in `tool` and its payload in `arguments`; use
  `tool: "list"` to inspect the live method catalog.
- `skills/sketch-native-mcp-adapter/SKILL.md` only bridges native tool calls.
  Do not alter the managed `sketch-design-to-code` or
  `sketch-design-from-reference` skills from `sketch-hq/agents`.

## Setup and verification

- Use Bun: `bun install`. This repository has no package scripts or test suite.
- Sketch must be running with MCP access enabled. Smoke-test the bundled
  configuration with `get_guide` before relying on other tools:

  ```bash
  bun -e 'import plugin from "./plugin/sketch-mcporter.ts"; const hooks = await plugin({}); const result = await hooks.tool.sketch.execute({ tool: "get_guide", arguments: { topic: "mcp" } }, { metadata() {} }); console.log(result.title); await hooks.dispose?.()'
  ```
- Before handoff, copy both plugin files and the adapter skill into
  `$HOME/.config/opencode`, register the plugin in `opencode.jsonc`, restart
  OpenCode, then call the native `sketch` tool.

## Sketch workflow

- Call `get_guide` with `topic: "mcp"` before other Sketch calls and with
  `topic: "use"` before content work. For layout creation or restructuring,
  load `topic: "layout"` first.
- On an MCP or document-operation failure, load `topic: "troubleshooting"`
  before retrying. Do not bypass the native tool with direct HTTP calls.
