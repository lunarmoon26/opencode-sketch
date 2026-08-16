import { fileURLToPath } from "node:url"
import { tool, type Plugin } from "@opencode-ai/plugin"
import { createRuntime, wrapCallResult, type Runtime, type ServerToolInfo } from "mcporter"

const server = "sketch"
const configPath = fileURLToPath(new URL("./sketch.mcp.jsonc", import.meta.url))

let runtimePromise: Promise<Runtime> | undefined
let toolsPromise: Promise<ServerToolInfo[]> | undefined

function runtime() {
  runtimePromise ??= createRuntime({ configPath })
  return runtimePromise
}

async function availableTools() {
  if (!toolsPromise) {
    toolsPromise = runtime().then((client) =>
      client.listTools(server, { disableOAuth: true, includeSchema: false })
    )
  }

  try {
    return await toolsPromise
  } catch (error) {
    toolsPromise = undefined
    throw error
  }
}

function catalog(tools: readonly ServerToolInfo[]) {
  return tools
    .map((item) => `- ${item.name}${item.description ? `: ${item.description}` : ""}`)
    .join("\n")
}

function renderResult(value: unknown) {
  const result = wrapCallResult(value)
  const text = result.callResult.text()
  if (text) return text

  const structured = result.callResult.structuredContent()
  return JSON.stringify(structured ?? result.raw ?? {}, null, 2)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export default (async () => ({
  tool: {
    sketch: tool({
      description:
        "Call one tool from the local Sketch MCP through MCPorter. Call get_guide with topic 'mcp' before other Sketch MCP tools. Pass tool: 'list' to inspect the live catalog, otherwise pass the exact MCP tool name and its argument object.",
      args: {
        tool: tool.schema
          .string()
          .describe("Exact Sketch MCP tool name, or 'list' to display its available tools."),
        arguments: tool.schema
          .record(tool.schema.string(), tool.schema.unknown())
          .default({})
          .describe("Arguments for the selected Sketch MCP tool."),
      },
      execute: async (args, context) => {
        try {
          const tools = await availableTools()
          if (args.tool === "list") {
            return { title: "Sketch tools", output: catalog(tools) }
          }

          if (!tools.some((item) => item.name === args.tool)) {
            return {
              title: "Unknown Sketch tool",
              output: `Unknown Sketch MCP tool '${args.tool}'. Available tools:\n${catalog(tools)}`,
            }
          }

          context.metadata({ title: `Sketch: ${args.tool}`, metadata: { server, tool: args.tool } })
          const result = await (await runtime()).callTool(server, args.tool, { args: args.arguments })
          return { title: `Sketch: ${args.tool}`, output: renderResult(result) }
        } catch (error) {
          return {
            title: `Sketch: ${args.tool}`,
            output: `Sketch MCP call failed: ${errorMessage(error)}`,
          }
        }
      },
    }),
  },
  dispose: async () => {
    if (runtimePromise) await (await runtimePromise).close()
  },
})) satisfies Plugin
