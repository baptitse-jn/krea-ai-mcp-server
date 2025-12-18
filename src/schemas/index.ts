// =============================================================================
// Zod Schemas for Krea AI MCP Server
// =============================================================================

import { z } from "zod";
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  ENHANCE_MODELS,
  ASPECT_RATIOS,
  VIDEO_DURATIONS,
  VIDEO_RESOLUTIONS
} from "../types.js";

// =============================================================================
// Common Schemas
// =============================================================================

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum results to return"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset"),
  cursor: z.string().optional().describe("Cursor for pagination")
}).strict();

export const AspectRatioSchema = z.enum(ASPECT_RATIOS as [string, ...string[]]).describe("Aspect ratio");

// =============================================================================
// Job Schemas
// =============================================================================

export const ListJobsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum results"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset"),
  status: z.enum(["pending", "processing", "completed", "failed", "cancelled", "all"]).default("all").describe("Filter by status"),
  type: z.string().optional().describe("Filter by job type (e.g., 'image', 'video')")
}).strict();
export type ListJobsInput = z.infer<typeof ListJobsSchema>;

export const GetJobSchema = z.object({
  job_id: z.string().min(1).describe("The job ID to retrieve")
}).strict();
export type GetJobInput = z.infer<typeof GetJobSchema>;

export const DeleteJobSchema = z.object({
  job_id: z.string().min(1).describe("The job ID to delete"),
  confirm: z.boolean().default(false).describe("Confirm deletion")
}).strict();
export type DeleteJobInput = z.infer<typeof DeleteJobSchema>;

export const WaitForJobSchema = z.object({
  job_id: z.string().min(1).describe("The job ID to wait for"),
  timeout_seconds: z.number().int().min(10).max(300).default(120).describe("Maximum wait time in seconds"),
  poll_interval_ms: z.number().int().min(1000).max(10000).default(2000).describe("Polling interval in milliseconds")
}).strict();
export type WaitForJobInput = z.infer<typeof WaitForJobSchema>;

// =============================================================================
// Asset Schemas
// =============================================================================

export const ListAssetsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum results"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset"),
  type: z.enum(["image", "video", "all"]).default("all").describe("Filter by asset type")
}).strict();
export type ListAssetsInput = z.infer<typeof ListAssetsSchema>;

export const UploadAssetSchema = z.object({
  url: z.string().url().describe("URL of the asset to upload"),
  name: z.string().optional().describe("Optional name for the asset")
}).strict();
export type UploadAssetInput = z.infer<typeof UploadAssetSchema>;

export const GetAssetSchema = z.object({
  asset_id: z.string().min(1).describe("The asset ID")
}).strict();
export type GetAssetInput = z.infer<typeof GetAssetSchema>;

export const DeleteAssetSchema = z.object({
  asset_id: z.string().min(1).describe("The asset ID to delete"),
  confirm: z.boolean().default(false).describe("Confirm deletion")
}).strict();
export type DeleteAssetInput = z.infer<typeof DeleteAssetSchema>;

// =============================================================================
// Style Schemas
// =============================================================================

export const TrainStyleSchema = z.object({
  name: z.string().min(1).max(100).describe("Name for the custom style"),
  images: z.array(z.string().url()).min(3).max(20).describe("URLs of training images (3-20 images)"),
  description: z.string().max(500).optional().describe("Optional description"),
  trigger_word: z.string().optional().describe("Optional trigger word for the style")
}).strict();
export type TrainStyleInput = z.infer<typeof TrainStyleSchema>;

export const SearchStylesSchema = z.object({
  query: z.string().optional().describe("Search query"),
  type: z.enum(["preset", "custom", "shared", "all"]).default("all").describe("Filter by style type"),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum results"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset")
}).strict();
export type SearchStylesInput = z.infer<typeof SearchStylesSchema>;

export const GetStyleSchema = z.object({
  style_id: z.string().min(1).describe("The style ID")
}).strict();
export type GetStyleInput = z.infer<typeof GetStyleSchema>;

export const UpdateStyleSchema = z.object({
  style_id: z.string().min(1).describe("The style ID to update"),
  name: z.string().min(1).max(100).optional().describe("New name"),
  description: z.string().max(500).optional().describe("New description")
}).strict();
export type UpdateStyleInput = z.infer<typeof UpdateStyleSchema>;

export const ShareStyleSchema = z.object({
  style_id: z.string().min(1).describe("The style ID to share")
}).strict();
export type ShareStyleInput = z.infer<typeof ShareStyleSchema>;

// =============================================================================
// Image Generation Schemas
// =============================================================================

const BaseImageSchema = z.object({
  prompt: z.string().min(1).max(2000).describe("Text prompt describing the image to generate"),
  negative_prompt: z.string().max(1000).optional().describe("What to avoid in the image"),
  aspect_ratio: z.enum(ASPECT_RATIOS as [string, ...string[]]).default("1:1").describe("Aspect ratio"),
  style_id: z.string().optional().describe("Custom style/LoRA ID to apply"),
  style_weight: z.number().min(0).max(1).default(0.8).optional().describe("Style influence (0-1)"),
  image_url: z.string().url().optional().describe("Reference image URL for image-to-image"),
  image_weight: z.number().min(0).max(1).default(0.5).optional().describe("Image reference influence"),
  seed: z.number().int().optional().describe("Random seed for reproducibility"),
  num_images: z.number().int().min(1).max(4).default(1).describe("Number of images to generate"),
  wait_for_completion: z.boolean().default(false).describe("Wait for job to complete before returning")
}).strict();

export const GenerateFluxSchema = BaseImageSchema.extend({
  model: z.enum(["flux", "flux-1.1-pro", "flux-1.1-pro-ultra"]).default("flux").describe("Flux model variant")
}).strict();
export type GenerateFluxInput = z.infer<typeof GenerateFluxSchema>;

export const GenerateFluxKontextSchema = BaseImageSchema.extend({
  edit_prompt: z.string().optional().describe("Edit instructions for existing image"),
  mask_url: z.string().url().optional().describe("Mask URL for inpainting")
}).strict();
export type GenerateFluxKontextInput = z.infer<typeof GenerateFluxKontextSchema>;

export const GenerateNanoBananaSchema = BaseImageSchema.extend({
  model: z.enum(["nano-banana", "nano-banana-pro"]).default("nano-banana-pro").describe("Nano Banana model variant")
}).strict();
export type GenerateNanoBananaInput = z.infer<typeof GenerateNanoBananaSchema>;

export const GenerateIdeogramSchema = BaseImageSchema.extend({
  model: z.enum(["ideogram-2.0a-turbo", "ideogram-3.0"]).default("ideogram-3.0").describe("Ideogram model variant"),
  magic_prompt: z.boolean().default(true).describe("Enable prompt enhancement")
}).strict();
export type GenerateIdeogramInput = z.infer<typeof GenerateIdeogramSchema>;

export const GenerateImagenSchema = BaseImageSchema.extend({
  model: z.enum(["imagen-3", "imagen-4", "imagen-4-fast", "imagen-4-ultra"]).default("imagen-4").describe("Imagen model variant")
}).strict();
export type GenerateImagenInput = z.infer<typeof GenerateImagenSchema>;

export const GenerateSeedreamSchema = BaseImageSchema.extend({
  model: z.enum(["seedream-3", "seedream-4"]).default("seedream-4").describe("Seedream model variant")
}).strict();
export type GenerateSeedreamInput = z.infer<typeof GenerateSeedreamSchema>;

export const GenerateRunwayImageSchema = BaseImageSchema.extend({}).strict();
export type GenerateRunwayImageInput = z.infer<typeof GenerateRunwayImageSchema>;

export const GenerateChatGPTImageSchema = BaseImageSchema.extend({
  edit_mode: z.boolean().default(false).describe("Enable edit mode for image manipulation")
}).strict();
export type GenerateChatGPTImageInput = z.infer<typeof GenerateChatGPTImageSchema>;

export const EditImageSchema = z.object({
  image_url: z.string().url().describe("URL of the image to edit"),
  prompt: z.string().min(1).max(2000).describe("Edit instructions"),
  mask_url: z.string().url().optional().describe("Mask URL for targeted editing"),
  model: z.enum(["seededit", "flux-kontext", "nano-banana-pro"]).default("nano-banana-pro").describe("Edit model"),
  wait_for_completion: z.boolean().default(false).describe("Wait for job to complete")
}).strict();
export type EditImageInput = z.infer<typeof EditImageSchema>;

// =============================================================================
// Video Generation Schemas
// =============================================================================

const BaseVideoSchema = z.object({
  prompt: z.string().min(1).max(2000).describe("Text prompt describing the video"),
  negative_prompt: z.string().max(1000).optional().describe("What to avoid"),
  aspect_ratio: z.enum(["16:9", "9:16", "1:1"]).default("16:9").describe("Video aspect ratio"),
  duration: z.enum(VIDEO_DURATIONS as [string, ...string[]]).default("5s").describe("Video duration"),
  resolution: z.enum(VIDEO_RESOLUTIONS as [string, ...string[]]).default("1080p").describe("Video resolution"),
  start_image_url: z.string().url().optional().describe("Starting frame image URL"),
  end_image_url: z.string().url().optional().describe("Ending frame image URL"),
  seed: z.number().int().optional().describe("Random seed"),
  wait_for_completion: z.boolean().default(false).describe("Wait for job to complete")
}).strict();

export const GenerateKlingSchema = BaseVideoSchema.extend({
  model: z.enum(["kling-1.0", "kling-1.5", "kling-1.6", "kling-2.0", "kling-2.1", "kling-2.5"]).default("kling-2.5").describe("Kling model version"),
  motion_intensity: z.number().min(0).max(1).default(0.5).optional().describe("Motion intensity (0-1)")
}).strict();
export type GenerateKlingInput = z.infer<typeof GenerateKlingSchema>;

export const GenerateHailuoSchema = BaseVideoSchema.extend({
  model: z.enum(["hailuo", "hailuo-02", "hailuo-2.3", "hailuo-2.3-fast"]).default("hailuo-2.3").describe("Hailuo model version")
}).strict();
export type GenerateHailuoInput = z.infer<typeof GenerateHailuoSchema>;

export const GenerateVeoSchema = BaseVideoSchema.extend({
  model: z.enum(["veo-2", "veo-3", "veo-3-fast", "veo-3.1", "veo-3.1-fast"]).default("veo-3").describe("Veo model version"),
  generate_audio: z.boolean().default(true).describe("Generate matching audio (Veo 3+ only)")
}).strict();
export type GenerateVeoInput = z.infer<typeof GenerateVeoSchema>;

export const GenerateWanSchema = BaseVideoSchema.extend({
  model: z.enum(["wan-2.1", "wan-2.2", "wan-2.5"]).default("wan-2.5").describe("Wan model version")
}).strict();
export type GenerateWanInput = z.infer<typeof GenerateWanSchema>;

export const GeneratePikaSchema = BaseVideoSchema.extend({}).strict();
export type GeneratePikaInput = z.infer<typeof GeneratePikaSchema>;

export const GenerateSeedanceSchema = BaseVideoSchema.extend({
  model: z.enum(["seedance-lite", "seedance-pro", "seedance-pro-fast"]).default("seedance-pro").describe("Seedance model version")
}).strict();
export type GenerateSeedanceInput = z.infer<typeof GenerateSeedanceSchema>;

export const GenerateRunwayVideoSchema = BaseVideoSchema.extend({
  model: z.enum(["runway-gen-3", "runway-gen-4", "runway-aleph"]).default("runway-gen-4").describe("Runway model version")
}).strict();
export type GenerateRunwayVideoInput = z.infer<typeof GenerateRunwayVideoSchema>;

export const GenerateRaySchema = BaseVideoSchema.extend({}).strict();
export type GenerateRayInput = z.infer<typeof GenerateRaySchema>;

// =============================================================================
// Enhance Schemas
// =============================================================================

export const EnhanceImageSchema = z.object({
  image_url: z.string().url().describe("URL of the image to enhance"),
  model: z.enum(ENHANCE_MODELS as [string, ...string[]]).default("topaz-generative").describe("Enhancement model"),
  scale: z.enum(["1x", "2x", "4x", "8x"]).default("2x").describe("Upscale factor"),
  prompt: z.string().max(500).optional().describe("Optional prompt for generative upscaling"),
  creativity: z.number().min(0).max(1).default(0.5).optional().describe("Creativity level for generative models"),
  wait_for_completion: z.boolean().default(false).describe("Wait for job to complete")
}).strict();
export type EnhanceImageInput = z.infer<typeof EnhanceImageSchema>;

// =============================================================================
// Export all schemas
// =============================================================================

export const schemas = {
  // Jobs
  ListJobsSchema,
  GetJobSchema,
  DeleteJobSchema,
  WaitForJobSchema,
  // Assets
  ListAssetsSchema,
  UploadAssetSchema,
  GetAssetSchema,
  DeleteAssetSchema,
  // Styles
  TrainStyleSchema,
  SearchStylesSchema,
  GetStyleSchema,
  UpdateStyleSchema,
  ShareStyleSchema,
  // Image Generation
  GenerateFluxSchema,
  GenerateFluxKontextSchema,
  GenerateNanoBananaSchema,
  GenerateIdeogramSchema,
  GenerateImagenSchema,
  GenerateSeedreamSchema,
  GenerateRunwayImageSchema,
  GenerateChatGPTImageSchema,
  EditImageSchema,
  // Video Generation
  GenerateKlingSchema,
  GenerateHailuoSchema,
  GenerateVeoSchema,
  GenerateWanSchema,
  GeneratePikaSchema,
  GenerateSeedanceSchema,
  GenerateRunwayVideoSchema,
  GenerateRaySchema,
  // Enhance
  EnhanceImageSchema
};
