// =============================================================================
// Krea AI MCP Server - Main Entry Point
// =============================================================================

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import cors from "cors";

import { initializeKreaClient } from "./services/krea-client.js";
import { registerTools } from "./tools/index.js";

// =============================================================================
// Configuration
// =============================================================================

const PORT = parseInt(process.env.PORT || "3000", 10);
const KREA_API_KEY = process.env.KREA_API_KEY;
const KREA_API_BASE_URL = process.env.KREA_API_BASE_URL || "https://api.krea.ai";
const KREA_WEBHOOK_URL = process.env.KREA_WEBHOOK_URL;
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || "120000", 10);

// =============================================================================
// Validate Configuration
// =============================================================================

if (!KREA_API_KEY) {
  console.error("❌ KREA_API_KEY environment variable is required");
  console.error("   Get your API key from https://krea.ai/settings/api");
  process.exit(1);
}

// =============================================================================
// Initialize Krea Client
// =============================================================================

initializeKreaClient({
  apiKey: KREA_API_KEY,
  baseUrl: KREA_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  webhookUrl: KREA_WEBHOOK_URL
});

// =============================================================================
// Create MCP Server
// =============================================================================

const server = new McpServer({
  name: "krea-ai-mcp-server",
  version: "1.0.0",
  description: "MCP Server for Krea AI - Generate images and videos with 30+ AI models"
});

// Register all tools
registerTools(server);

// =============================================================================
// Transport Selection
// =============================================================================

const useStdio = process.argv.includes("--stdio");

if (useStdio) {
  // Stdio transport for CLI usage
  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.error("🚀 Krea AI MCP Server running on stdio");
  });
} else {
  // HTTP transport for web usage
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "mcp-session-id"]
  }));

  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "krea-ai-mcp-server",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  });

  // MCP endpoint
  app.all("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
    });

    res.on("close", () => {
      transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // API info
  app.get("/", (_req, res) => {
    res.json({
      name: "Krea AI MCP Server",
      version: "1.0.0",
      description: "MCP Server for Krea AI - Generate images and videos with 30+ AI models",
      endpoints: {
        mcp: "/mcp",
        health: "/health"
      },
      documentation: "https://docs.krea.ai/api-reference/introduction",
      tools: [
        // Jobs
        "krea_list_jobs",
        "krea_get_job",
        "krea_wait_for_job",
        "krea_delete_job",
        // Assets
        "krea_list_assets",
        "krea_upload_asset",
        "krea_get_asset",
        "krea_delete_asset",
        // Styles
        "krea_train_style",
        "krea_search_styles",
        "krea_get_style",
        "krea_update_style",
        "krea_share_style",
        // Image Generation
        "krea_generate_flux",
        "krea_generate_flux_kontext",
        "krea_generate_nano_banana",
        "krea_generate_ideogram",
        "krea_generate_imagen",
        "krea_generate_seedream",
        "krea_generate_chatgpt_image",
        "krea_edit_image",
        // Video Generation
        "krea_generate_kling",
        "krea_generate_hailuo",
        "krea_generate_veo",
        "krea_generate_wan",
        "krea_generate_pika",
        "krea_generate_seedance",
        "krea_generate_runway",
        "krea_generate_ray",
        // Enhance
        "krea_enhance_image"
      ]
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🎨 Krea AI MCP Server Running                                  ║
║                                                                  ║
║   MCP Endpoint:  http://localhost:${PORT}/mcp                     ║
║   Health Check:  http://localhost:${PORT}/health                  ║
║   API Info:      http://localhost:${PORT}/                        ║
║                                                                  ║
║   Available Models:                                              ║
║   ├── Images: Flux, Nano Banana, Ideogram, Imagen, Seedream...  ║
║   ├── Videos: Kling, Hailuo, Veo, Wan, Pika, Runway, Ray...     ║
║   └── Enhance: Topaz, Bloom                                      ║
║                                                                  ║
║   To test with MCP Inspector:                                    ║
║   npx @modelcontextprotocol/inspector http://localhost:${PORT}/mcp ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  });
}
