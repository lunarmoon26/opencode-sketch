---
name: sketch-native-mcp-adapter
description: Sketch MCP native tool adapter for sketch-design-to-code and sketch-design-from-reference. Use when either managed Sketch skill needs to inspect, edit, screenshot, or export a Sketch document through the native sketch tool.
---

# Sketch Native MCP Adapter

Keep the managed `sketch-design-to-code` and `sketch-design-from-reference`
skills unchanged. This adapter only maps their Sketch MCP method calls to the
native `sketch` tool.

Call `sketch` with the original Sketch MCP method in `tool` and its payload in
`arguments`. For example:

```text
sketch({ tool: "get_document_info", arguments: {} })
sketch({ tool: "get_screenshot", arguments: { targetDocumentID, layerID } })
```

Before every Sketch workflow, call `get_guide` with `{ topic: "mcp" }`, then
call `{ topic: "use" }` before inspecting or changing document content. For
`sketch-design-from-reference`, also call `{ topic: "layout" }` before creating
or restructuring frames, groups, stacks, page placement, sizing, pins, or
container types.

Pass through the managed skills' exact method names and arguments unchanged:
`get_document_info`, `get_layer_tree_summary`, `get_screenshot`,
`get_libraries`, `get_design_assets`, `get_symbol_overrides`, and `run_code`.
Use `tool: "list"` only when the live catalog needs confirmation.

For an MCP or document-operation failure, call `get_guide` with
`{ topic: "troubleshooting" }` before retrying. Do not bypass the native
`sketch` tool with direct HTTP calls or alter the managed skill files.
