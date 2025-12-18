// =============================================================================
// MCP Tools for Krea AI
// =============================================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getKreaClient } from "../services/krea-client.js";
import {
  formatTextResponse,
  formatErrorResponse,
  formatJobMarkdown,
  formatJobsListMarkdown,
  formatAssetMarkdown,
  formatAssetsListMarkdown,
  formatStyleMarkdown,
  formatStylesListMarkdown,
  formatGenerationResult
} from "../services/formatters.js";
import { TOOL_ANNOTATIONS } from "../types.js";
import {
  ListJobsSchema,
  GetJobSchema,
  DeleteJobSchema,
  WaitForJobSchema,
  ListAssetsSchema,
  UploadAssetSchema,
  GetAssetSchema,
  DeleteAssetSchema,
  TrainStyleSchema,
  SearchStylesSchema,
  GetStyleSchema,
  UpdateStyleSchema,
  ShareStyleSchema,
  GenerateFluxSchema,
  GenerateFluxKontextSchema,
  GenerateNanoBananaSchema,
  GenerateIdeogramSchema,
  GenerateImagenSchema,
  GenerateSeedreamSchema,
  GenerateRunwayImageSchema,
  GenerateChatGPTImageSchema,
  EditImageSchema,
  GenerateKlingSchema,
  GenerateHailuoSchema,
  GenerateVeoSchema,
  GenerateWanSchema,
  GeneratePikaSchema,
  GenerateSeedanceSchema,
  GenerateRunwayVideoSchema,
  GenerateRaySchema,
  EnhanceImageSchema,
  type ListJobsInput,
  type GetJobInput,
  type DeleteJobInput,
  type WaitForJobInput,
  type ListAssetsInput,
  type UploadAssetInput,
  type GetAssetInput,
  type DeleteAssetInput,
  type TrainStyleInput,
  type SearchStylesInput,
  type GetStyleInput,
  type UpdateStyleInput,
  type ShareStyleInput,
  type GenerateFluxInput,
  type GenerateFluxKontextInput,
  type GenerateNanoBananaInput,
  type GenerateIdeogramInput,
  type GenerateImagenInput,
  type GenerateSeedreamInput,
  type GenerateRunwayImageInput,
  type GenerateChatGPTImageInput,
  type EditImageInput,
  type GenerateKlingInput,
  type GenerateHailuoInput,
  type GenerateVeoInput,
  type GenerateWanInput,
  type GeneratePikaInput,
  type GenerateSeedanceInput,
  type GenerateRunwayVideoInput,
  type GenerateRayInput,
  type EnhanceImageInput
} from "../schemas/index.js";

export function registerTools(server: McpServer): void {
  const client = getKreaClient();

  // ===========================================================================
  // Job Management Tools
  // ===========================================================================

  server.registerTool(
    "krea_list_jobs",
    {
      title: "List Jobs",
      description: `List all generation jobs in your Krea AI account.

Use this to see pending, processing, completed, or failed jobs.

Args:
  - limit: Max results (1-100, default: 20)
  - offset: Pagination offset (default: 0)
  - status: Filter by status (pending, processing, completed, failed, cancelled, all)
  - type: Filter by job type (image, video)`,
      inputSchema: ListJobsSchema,
      annotations: TOOL_ANNOTATIONS.READ_ONLY
    },
    async (params: ListJobsInput) => {
      const result = await client.listJobs(params);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const { items, total } = result.data!;
      const markdown = formatJobsListMarkdown(items, total);
      return formatTextResponse(markdown, { jobs: items, total });
    }
  );

  server.registerTool(
    "krea_get_job",
    {
      title: "Get Job Details",
      description: `Get detailed information about a specific job.

Use this to check job status, progress, and results.

Args:
  - job_id: The job ID to retrieve`,
      inputSchema: GetJobSchema,
      annotations: TOOL_ANNOTATIONS.READ_ONLY
    },
    async (params: GetJobInput) => {
      const result = await client.getJob(params.job_id);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatJobMarkdown(result.data!);
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_wait_for_job",
    {
      title: "Wait for Job Completion",
      description: `Wait for a job to complete and return the result.

Use this after starting a generation to get the final result.

Args:
  - job_id: The job ID to wait for
  - timeout_seconds: Max wait time (10-300, default: 120)
  - poll_interval_ms: Polling interval (1000-10000, default: 2000)`,
      inputSchema: WaitForJobSchema,
      annotations: TOOL_ANNOTATIONS.READ_ONLY
    },
    async (params: WaitForJobInput) => {
      const result = await client.waitForJob(
        params.job_id,
        params.timeout_seconds * 1000,
        params.poll_interval_ms
      );
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const job = result.data!;
      const type = job.type.includes("video") ? "video" : "image";
      const markdown = formatGenerationResult(job, type as "image" | "video");
      return formatTextResponse(markdown, { job });
    }
  );

  server.registerTool(
    "krea_delete_job",
    {
      title: "Delete Job",
      description: `Delete a job from your account.

Args:
  - job_id: The job ID to delete
  - confirm: Must be true to confirm deletion`,
      inputSchema: DeleteJobSchema,
      annotations: TOOL_ANNOTATIONS.DELETE
    },
    async (params: DeleteJobInput) => {
      if (!params.confirm) {
        return formatErrorResponse("Deletion not confirmed", "Set confirm=true to delete");
      }
      const result = await client.deleteJob(params.job_id);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      return formatTextResponse(`✅ Job \`${params.job_id}\` deleted successfully.`);
    }
  );

  // ===========================================================================
  // Asset Management Tools
  // ===========================================================================

  server.registerTool(
    "krea_list_assets",
    {
      title: "List Assets",
      description: `List all uploaded and generated assets.

Args:
  - limit: Max results (default: 20)
  - offset: Pagination offset
  - type: Filter by type (image, video, all)`,
      inputSchema: ListAssetsSchema,
      annotations: TOOL_ANNOTATIONS.READ_ONLY
    },
    async (params: ListAssetsInput) => {
      const result = await client.listAssets(params);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const { items, total } = result.data!;
      const markdown = formatAssetsListMarkdown(items, total);
      return formatTextResponse(markdown, { assets: items, total });
    }
  );

  server.registerTool(
    "krea_upload_asset",
    {
      title: "Upload Asset",
      description: `Upload an asset from a URL to use in generations.

Args:
  - url: URL of the image/video to upload
  - name: Optional name for the asset`,
      inputSchema: UploadAssetSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: UploadAssetInput) => {
      const result = await client.uploadAsset(params);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = `✅ **Asset Uploaded**\n\n${formatAssetMarkdown(result.data!)}`;
      return formatTextResponse(markdown, { asset: result.data });
    }
  );

  server.registerTool(
    "krea_get_asset",
    {
      title: "Get Asset",
      description: `Get details about a specific asset.

Args:
  - asset_id: The asset ID`,
      inputSchema: GetAssetSchema,
      annotations: TOOL_ANNOTATIONS.READ_ONLY
    },
    async (params: GetAssetInput) => {
      const result = await client.getAsset(params.asset_id);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatAssetMarkdown(result.data!);
      return formatTextResponse(markdown, { asset: result.data });
    }
  );

  server.registerTool(
    "krea_delete_asset",
    {
      title: "Delete Asset",
      description: `Delete an asset from your account.

Args:
  - asset_id: The asset ID to delete
  - confirm: Must be true to confirm`,
      inputSchema: DeleteAssetSchema,
      annotations: TOOL_ANNOTATIONS.DELETE
    },
    async (params: DeleteAssetInput) => {
      if (!params.confirm) {
        return formatErrorResponse("Deletion not confirmed", "Set confirm=true to delete");
      }
      const result = await client.deleteAsset(params.asset_id);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      return formatTextResponse(`✅ Asset \`${params.asset_id}\` deleted successfully.`);
    }
  );

  // ===========================================================================
  // Style/LoRA Tools
  // ===========================================================================

  server.registerTool(
    "krea_train_style",
    {
      title: "Train Custom Style (LoRA)",
      description: `Train a custom style/LoRA from your images.

Upload 3-20 similar images to create a consistent style.

Args:
  - name: Name for the style
  - images: Array of image URLs (3-20)
  - description: Optional description
  - trigger_word: Optional trigger word`,
      inputSchema: TrainStyleSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: TrainStyleInput) => {
      const result = await client.trainStyle(params);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      return formatTextResponse(
        `🎨 **Style Training Started**\n\n- **Job ID**: \`${result.data!.id}\`\n- **Name**: ${params.name}\n\nUse \`krea_wait_for_job\` to wait for training completion.`,
        { job: result.data }
      );
    }
  );

  server.registerTool(
    "krea_search_styles",
    {
      title: "Search Styles",
      description: `Search for available styles/LoRAs.

Args:
  - query: Search query
  - type: Filter by type (preset, custom, shared, all)
  - limit: Max results
  - offset: Pagination offset`,
      inputSchema: SearchStylesSchema,
      annotations: TOOL_ANNOTATIONS.READ_ONLY
    },
    async (params: SearchStylesInput) => {
      const result = await client.searchStyles(params);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const { items, total } = result.data!;
      const markdown = formatStylesListMarkdown(items, total);
      return formatTextResponse(markdown, { styles: items, total });
    }
  );

  server.registerTool(
    "krea_get_style",
    {
      title: "Get Style Details",
      description: `Get details about a specific style.

Args:
  - style_id: The style ID`,
      inputSchema: GetStyleSchema,
      annotations: TOOL_ANNOTATIONS.READ_ONLY
    },
    async (params: GetStyleInput) => {
      const result = await client.getStyle(params.style_id);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatStyleMarkdown(result.data!);
      return formatTextResponse(markdown, { style: result.data });
    }
  );

  server.registerTool(
    "krea_update_style",
    {
      title: "Update Style",
      description: `Update a style's name or description.

Args:
  - style_id: The style ID
  - name: New name
  - description: New description`,
      inputSchema: UpdateStyleSchema,
      annotations: TOOL_ANNOTATIONS.UPDATE
    },
    async (params: UpdateStyleInput) => {
      const result = await client.updateStyle(params.style_id, {
        name: params.name,
        description: params.description
      });
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      return formatTextResponse(`✅ **Style Updated**\n\n${formatStyleMarkdown(result.data!)}`, { style: result.data });
    }
  );

  server.registerTool(
    "krea_share_style",
    {
      title: "Share Style",
      description: `Get a shareable link for a style.

Args:
  - style_id: The style ID to share`,
      inputSchema: ShareStyleSchema,
      annotations: TOOL_ANNOTATIONS.READ_ONLY
    },
    async (params: ShareStyleInput) => {
      const result = await client.getStyleShareLink(params.style_id);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      return formatTextResponse(`🔗 **Shareable Link**: ${result.data!.url}`, result.data);
    }
  );

  // ===========================================================================
  // Image Generation Tools
  // ===========================================================================

  server.registerTool(
    "krea_generate_flux",
    {
      title: "Generate Image with Flux",
      description: `Generate images using Flux models (fast, high-quality).

Models: flux (default), flux-1.1-pro, flux-1.1-pro-ultra

Args:
  - prompt: Text description of the image
  - model: Flux variant
  - aspect_ratio: 1:1, 16:9, 9:16, etc.
  - style_id: Custom style to apply
  - image_url: Reference image for img2img
  - num_images: 1-4
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateFluxSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateFluxInput) => {
      const result = await client.generateFlux(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_flux_kontext",
    {
      title: "Generate/Edit with Flux Kontext",
      description: `Generate or edit images with Flux Kontext (advanced editing).

Best for: precise edits, inpainting, style transfer.

Args:
  - prompt: Description or edit instructions
  - image_url: Image to edit
  - edit_prompt: Specific edit instructions
  - mask_url: Mask for inpainting
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateFluxKontextSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateFluxKontextInput) => {
      const result = await client.generateFluxKontext(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_nano_banana",
    {
      title: "Generate Image with Nano Banana",
      description: `Generate images using Google's Nano Banana (Gemini image model).

Best for: realistic images, natural language editing, multi-image fusion.

Models: nano-banana-pro (default), nano-banana

Args:
  - prompt: Text description
  - model: Nano Banana variant
  - aspect_ratio: Image dimensions
  - image_url: Reference image
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateNanoBananaSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateNanoBananaInput) => {
      const result = await client.generateNanoBanana(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_ideogram",
    {
      title: "Generate Image with Ideogram",
      description: `Generate images using Ideogram (excellent for text in images).

Models: ideogram-3.0 (default), ideogram-2.0a-turbo

Args:
  - prompt: Text description
  - model: Ideogram version
  - magic_prompt: Enable prompt enhancement
  - aspect_ratio: Image dimensions
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateIdeogramSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateIdeogramInput) => {
      const result = await client.generateIdeogram(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_imagen",
    {
      title: "Generate Image with Imagen",
      description: `Generate images using Google's Imagen models.

Models: imagen-4 (default), imagen-4-fast, imagen-4-ultra, imagen-3

Args:
  - prompt: Text description
  - model: Imagen version
  - aspect_ratio: Image dimensions
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateImagenSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateImagenInput) => {
      const result = await client.generateImagen(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_seedream",
    {
      title: "Generate Image with Seedream",
      description: `Generate images using ByteDance's Seedream models.

Models: seedream-4 (default), seedream-3

Args:
  - prompt: Text description
  - model: Seedream version
  - aspect_ratio: Image dimensions
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateSeedreamSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateSeedreamInput) => {
      const result = await client.generateSeedream(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_chatgpt_image",
    {
      title: "Generate Image with ChatGPT Image",
      description: `Generate images using OpenAI's ChatGPT Image model.

Args:
  - prompt: Text description
  - edit_mode: Enable edit mode
  - image_url: Reference image
  - aspect_ratio: Image dimensions
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateChatGPTImageSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateChatGPTImageInput) => {
      const result = await client.generateChatGPTImage(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_edit_image",
    {
      title: "Edit Image",
      description: `Edit an existing image with AI.

Models: nano-banana-pro (default), seededit, flux-kontext

Args:
  - image_url: Image to edit
  - prompt: Edit instructions
  - mask_url: Optional mask for targeted edits
  - model: Edit model to use
  - wait_for_completion: Wait for result`,
      inputSchema: EditImageSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: EditImageInput) => {
      const result = await client.editImage(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  // ===========================================================================
  // Video Generation Tools
  // ===========================================================================

  server.registerTool(
    "krea_generate_kling",
    {
      title: "Generate Video with Kling",
      description: `Generate videos using Kling models.

Models: kling-2.5 (default), kling-2.1, kling-2.0, kling-1.6, kling-1.5, kling-1.0

Args:
  - prompt: Video description
  - model: Kling version
  - duration: 5s, 6s, 8s, 10s, 12s
  - aspect_ratio: 16:9, 9:16, 1:1
  - resolution: 720p, 1080p
  - start_image_url: Starting frame
  - motion_intensity: 0-1
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateKlingSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateKlingInput) => {
      const result = await client.generateKling(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "video");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_hailuo",
    {
      title: "Generate Video with Hailuo",
      description: `Generate videos using MiniMax Hailuo models.

Models: hailuo-2.3 (default), hailuo-2.3-fast, hailuo-02, hailuo

Args:
  - prompt: Video description
  - model: Hailuo version
  - duration: Video length
  - aspect_ratio: Video dimensions
  - start_image_url: Starting frame
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateHailuoSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateHailuoInput) => {
      const result = await client.generateHailuo(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "video");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_veo",
    {
      title: "Generate Video with Veo",
      description: `Generate videos using Google's Veo models.

⭐ Veo 3+ generates matching audio!

Models: veo-3 (default), veo-3.1, veo-3.1-fast, veo-3-fast, veo-2

Args:
  - prompt: Video description
  - model: Veo version
  - generate_audio: Generate matching audio (Veo 3+)
  - duration: Video length
  - aspect_ratio: Video dimensions
  - start_image_url: Starting frame
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateVeoSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateVeoInput) => {
      const result = await client.generateVeo(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "video");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_wan",
    {
      title: "Generate Video with Wan",
      description: `Generate videos using Alibaba's Wan models.

Models: wan-2.5 (default), wan-2.2, wan-2.1

Args:
  - prompt: Video description
  - model: Wan version
  - duration: Video length
  - aspect_ratio: Video dimensions
  - start_image_url: Starting frame
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateWanSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateWanInput) => {
      const result = await client.generateWan(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "video");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_pika",
    {
      title: "Generate Video with Pika",
      description: `Generate videos using Pika 2.2.

Args:
  - prompt: Video description
  - duration: Video length
  - aspect_ratio: Video dimensions
  - start_image_url: Starting frame
  - wait_for_completion: Wait for result`,
      inputSchema: GeneratePikaSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GeneratePikaInput) => {
      const result = await client.generatePika(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "video");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_seedance",
    {
      title: "Generate Video with Seedance",
      description: `Generate videos using ByteDance's Seedance models.

Models: seedance-pro (default), seedance-pro-fast, seedance-lite

Args:
  - prompt: Video description
  - model: Seedance version
  - duration: Video length
  - aspect_ratio: Video dimensions
  - start_image_url: Starting frame
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateSeedanceSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateSeedanceInput) => {
      const result = await client.generateSeedance(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "video");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_runway",
    {
      title: "Generate Video with Runway",
      description: `Generate videos using Runway models.

Models: runway-gen-4 (default), runway-aleph, runway-gen-3

Args:
  - prompt: Video description
  - model: Runway version
  - duration: Video length
  - aspect_ratio: Video dimensions
  - start_image_url: Starting frame
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateRunwayVideoSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateRunwayVideoInput) => {
      const result = await client.generateRunwayVideo(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "video");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  server.registerTool(
    "krea_generate_ray",
    {
      title: "Generate Video with Ray",
      description: `Generate videos using Luma Ray 2.

Args:
  - prompt: Video description
  - duration: Video length
  - aspect_ratio: Video dimensions
  - start_image_url: Starting frame
  - wait_for_completion: Wait for result`,
      inputSchema: GenerateRaySchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: GenerateRayInput) => {
      const result = await client.generateRay(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "video");
      return formatTextResponse(markdown, { job: result.data });
    }
  );

  // ===========================================================================
  // Image Enhancement Tools
  // ===========================================================================

  server.registerTool(
    "krea_enhance_image",
    {
      title: "Enhance/Upscale Image",
      description: `Upscale and enhance images up to 8x.

Models:
- topaz-generative: AI upscaling with detail generation
- topaz: Simple upscaling preserving details
- bloom: Krea's generative upscaler

Args:
  - image_url: Image to enhance
  - model: Enhancement model
  - scale: 1x, 2x, 4x, 8x
  - prompt: Optional prompt for generative upscaling
  - creativity: Creativity level (0-1)
  - wait_for_completion: Wait for result`,
      inputSchema: EnhanceImageSchema,
      annotations: TOOL_ANNOTATIONS.CREATE
    },
    async (params: EnhanceImageInput) => {
      const result = await client.enhanceImage(params as Record<string, unknown>, params.wait_for_completion);
      if (!result.success) {
        return formatErrorResponse(result.error!.message);
      }
      const markdown = formatGenerationResult(result.data!, "image");
      return formatTextResponse(markdown, { job: result.data });
    }
  );
}
