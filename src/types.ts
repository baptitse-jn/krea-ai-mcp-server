// =============================================================================
// Types & Interfaces for Krea AI MCP Server
// =============================================================================

/**
 * Job status in Krea AI
 */
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

/**
 * Krea AI Job
 */
export interface KreaJob {
  id: string;
  status: JobStatus;
  type: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  result?: KreaJobResult;
  error?: string;
  progress?: number;
}

/**
 * Job result containing generated assets
 */
export interface KreaJobResult {
  assets?: KreaAsset[];
  url?: string;
  urls?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Krea Asset (image or video)
 */
export interface KreaAsset {
  id: string;
  url: string;
  type: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  size?: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Krea Style (LoRA)
 */
export interface KreaStyle {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  type: "preset" | "custom" | "shared";
  status: "ready" | "training" | "failed";
  createdAt: string;
  updatedAt: string;
}

/**
 * Image generation models
 */
export type ImageModel =
  | "flux"
  | "flux-kontext"
  | "nano-banana-pro"
  | "nano-banana"
  | "flux-1.1-pro"
  | "flux-1.1-pro-ultra"
  | "ideogram-2.0a-turbo"
  | "ideogram-3.0"
  | "imagen-3"
  | "imagen-4"
  | "imagen-4-fast"
  | "imagen-4-ultra"
  | "runway-gen-4"
  | "chatgpt-image"
  | "seedream-3"
  | "seedream-4"
  | "seededit";

/**
 * Video generation models
 */
export type VideoModel =
  | "kling-1.0"
  | "kling-1.5"
  | "kling-1.6"
  | "kling-2.0"
  | "kling-2.1"
  | "kling-2.5"
  | "hailuo"
  | "hailuo-02"
  | "hailuo-2.3"
  | "hailuo-2.3-fast"
  | "pika-2.2"
  | "wan-2.1"
  | "wan-2.2"
  | "wan-2.5"
  | "veo-2"
  | "veo-3"
  | "veo-3-fast"
  | "veo-3.1"
  | "veo-3.1-fast"
  | "seedance-lite"
  | "seedance-pro"
  | "seedance-pro-fast"
  | "ray-2"
  | "runway-gen-3"
  | "runway-gen-4"
  | "runway-aleph";

/**
 * Enhance models
 */
export type EnhanceModel = "topaz-generative" | "topaz" | "bloom";

/**
 * Aspect ratios
 */
export type AspectRatio =
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "3:2"
  | "2:3"
  | "21:9"
  | "9:21";

/**
 * Video duration options
 */
export type VideoDuration = "5s" | "6s" | "8s" | "10s" | "12s";

/**
 * Video resolution options
 */
export type VideoResolution = "720p" | "1080p";

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  count: number;
  offset: number;
  hasMore: boolean;
  nextCursor?: string;
}

// =============================================================================
// Constants
// =============================================================================

export const IMAGE_MODELS: ImageModel[] = [
  "flux",
  "flux-kontext",
  "nano-banana-pro",
  "nano-banana",
  "flux-1.1-pro",
  "flux-1.1-pro-ultra",
  "ideogram-2.0a-turbo",
  "ideogram-3.0",
  "imagen-3",
  "imagen-4",
  "imagen-4-fast",
  "imagen-4-ultra",
  "runway-gen-4",
  "chatgpt-image",
  "seedream-3",
  "seedream-4",
  "seededit"
];

export const VIDEO_MODELS: VideoModel[] = [
  "kling-1.0",
  "kling-1.5",
  "kling-1.6",
  "kling-2.0",
  "kling-2.1",
  "kling-2.5",
  "hailuo",
  "hailuo-02",
  "hailuo-2.3",
  "hailuo-2.3-fast",
  "pika-2.2",
  "wan-2.1",
  "wan-2.2",
  "wan-2.5",
  "veo-2",
  "veo-3",
  "veo-3-fast",
  "veo-3.1",
  "veo-3.1-fast",
  "seedance-lite",
  "seedance-pro",
  "seedance-pro-fast",
  "ray-2",
  "runway-gen-3",
  "runway-gen-4",
  "runway-aleph"
];

export const ENHANCE_MODELS: EnhanceModel[] = ["topaz-generative", "topaz", "bloom"];

export const ASPECT_RATIOS: AspectRatio[] = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "3:2",
  "2:3",
  "21:9",
  "9:21"
];

export const VIDEO_DURATIONS: VideoDuration[] = ["5s", "6s", "8s", "10s", "12s"];

export const VIDEO_RESOLUTIONS: VideoResolution[] = ["720p", "1080p"];

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const CHARACTER_LIMIT = 10000;

// Tool annotations
export const TOOL_ANNOTATIONS = {
  READ_ONLY: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true
  },
  CREATE: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true
  },
  UPDATE: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true
  },
  DELETE: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true
  }
} as const;
