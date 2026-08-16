# OpenCode Sketch

Native OpenCode plugin and adapter skill for the local Sketch MCP, using
[MCPorter](https://github.com/openclaw/mcporter).

The plugin connects to Sketch's local MCP endpoint at
`http://localhost:31126/mcp`. Sketch must be running with **Settings → General
→ Allow AI tools to interact with open documents** enabled.

## Install

The native plugin and skills install separately. The Vercel
[Skills CLI](https://github.com/vercel-labs/skills) manages only `SKILL.md`
files; it does not install OpenCode plugins.

### 1. Install the native plugin

```bash
# Shell variables for these commands only; OpenCode does not read these names.
repo_dir=/path/to/opencode-sketch
opencode_dir="$HOME/.config/opencode"

# Install the plugin's runtime dependencies into OpenCode's global config.
cd "$opencode_dir"
bun add @opencode-ai/plugin mcporter

# Copy the plugin and its bundled MCP definition together.
mkdir -p "$opencode_dir/plugin"
cp "$repo_dir/plugin/sketch-mcporter.ts" \
  "$repo_dir/plugin/sketch.mcp.jsonc" \
  "$opencode_dir/plugin/"
```

Register the plugin in `~/.config/opencode/opencode.jsonc`. Merge this entry
with any existing `plugin` array; do not replace other configuration:

```jsonc
{
  "plugin": ["./plugin/sketch-mcporter.ts"]
}
```

### 2. Install the adapter skill

```bash
mkdir -p "$opencode_dir/skills"
cp -R "$repo_dir/skills/." "$opencode_dir/skills/"
```

Install the managed Sketch workflows separately. Do not edit those installed
skills; the adapter maps their MCP calls to the native `sketch` tool.

```bash
npx skills add sketch-hq/agents
# or: bunx skills add sketch-hq/agents
```

Restart OpenCode after changing configuration, plugins, or skills.

## Verify

```bash
bun install
bun -e 'import plugin from "./plugin/sketch-mcporter.ts"; const hooks = await plugin({}); const result = await hooks.tool.sketch.execute({ tool: "get_guide", arguments: { topic: "mcp" } }, { metadata() {} }); console.log(result.title); await hooks.dispose?.()'
```

## License

Licensed under [MIT](LICENSE).
