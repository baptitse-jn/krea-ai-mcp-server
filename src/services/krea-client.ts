// =============================================================================
// Krea AI API Client
// =============================================================================

import { KreaJob, KreaAsset, KreaStyle, JobStatus } from "../types.js";

interface KreaClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  webhookUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

interface ListResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Krea AI API Client
 */
export class KreaClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private webhookUrl?: string;

  constructor(config: KreaClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://api.krea.ai").replace(/\/$/, "");
    this.timeout = config.timeout || 120000;
    this.webhookUrl = config.webhookUrl;
  }

  // ===========================================================================
  // HTTP Methods
  // ===========================================================================

  private async request<T>(
    method: string,
    endpoint: string,
    options?: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      if (options?.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        method,
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json() as T;

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: (data as Record<string, unknown>)?.message as string || `Request failed with status ${response.status}`,
            details: data as Record<string, unknown>
          }
        };
      }

      return { success: true, data };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return {
          success: false,
          error: { code: "TIMEOUT", message: "Request timed out" }
        };
      }
      return {
        success: false,
        error: {
          code: "REQUEST_ERROR",
          message: err instanceof Error ? err.message : "Unknown error"
        }
      };
    }
  }

  private async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, { params });
  }

  private async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, { body });
  }

  private async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, { body });
  }

  private async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint);
  }

  // ===========================================================================
  // Jobs API
  // ===========================================================================

  async listJobs(params: {
    limit?: number;
    offset?: number;
    status?: string;
    type?: string;
  }): Promise<ApiResponse<ListResponse<KreaJob>>> {
    return this.get("/v1/jobs", {
      limit: params.limit,
      offset: params.offset,
      status: params.status !== "all" ? params.status : undefined,
      type: params.type
    });
  }

  async getJob(jobId: string): Promise<ApiResponse<KreaJob>> {
    return this.get(`/v1/jobs/${jobId}`);
  }

  async deleteJob(jobId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.delete(`/v1/jobs/${jobId}`);
  }

  async waitForJob(
    jobId: string,
    timeoutMs: number = 120000,
    pollIntervalMs: number = 2000
  ): Promise<ApiResponse<KreaJob>> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const result = await this.getJob(jobId);
      
      if (!result.success) {
        return result;
      }

      const job = result.data!;
      
      if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
        return result;
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    return {
      success: false,
      error: {
        code: "TIMEOUT",
        message: `Job ${jobId} did not complete within ${timeoutMs}ms`
      }
    };
  }

  // ===========================================================================
  // Assets API
  // ===========================================================================

  async listAssets(params: {
    limit?: number;
    offset?: number;
    type?: string;
  }): Promise<ApiResponse<ListResponse<KreaAsset>>> {
    return this.get("/v1/assets", {
      limit: params.limit,
      offset: params.offset,
      type: params.type !== "all" ? params.type : undefined
    });
  }

  async uploadAsset(params: {
    url: string;
    name?: string;
  }): Promise<ApiResponse<KreaAsset>> {
    return this.post("/v1/assets", params);
  }

  async getAsset(assetId: string): Promise<ApiResponse<KreaAsset>> {
    return this.get(`/v1/assets/${assetId}`);
  }

  async deleteAsset(assetId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.delete(`/v1/assets/${assetId}`);
  }

  // ===========================================================================
  // Styles API
  // ===========================================================================

  async trainStyle(params: {
    name: string;
    images: string[];
    description?: string;
    trigger_word?: string;
  }): Promise<ApiResponse<KreaJob>> {
    return this.post("/v1/styles/train", {
      ...params,
      webhook_url: this.webhookUrl
    });
  }

  async searchStyles(params: {
    query?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<ListResponse<KreaStyle>>> {
    return this.get("/v1/styles", {
      q: params.query,
      type: params.type !== "all" ? params.type : undefined,
      limit: params.limit,
      offset: params.offset
    });
  }

  async getStyle(styleId: string): Promise<ApiResponse<KreaStyle>> {
    return this.get(`/v1/styles/${styleId}`);
  }

  async updateStyle(styleId: string, params: {
    name?: string;
    description?: string;
  }): Promise<ApiResponse<KreaStyle>> {
    return this.patch(`/v1/styles/${styleId}`, params);
  }

  async getStyleShareLink(styleId: string): Promise<ApiResponse<{ url: string }>> {
    return this.get(`/v1/styles/${styleId}/share`);
  }

  async shareStyleWithWorkspace(styleId: string): Promise<ApiResponse<{ shared: boolean }>> {
    return this.post(`/v1/styles/${styleId}/share`);
  }

  async removeStyleFromWorkspace(styleId: string): Promise<ApiResponse<{ removed: boolean }>> {
    return this.delete(`/v1/styles/${styleId}/share`);
  }

  // ===========================================================================
  // Image Generation API
  // ===========================================================================

  async generateImage(
    endpoint: string,
    params: Record<string, unknown>,
    waitForCompletion: boolean = false
  ): Promise<ApiResponse<KreaJob>> {
    const body = {
      ...params,
      webhook_url: this.webhookUrl
    };

    const result = await this.post<KreaJob>(`/v1/image/${endpoint}`, body);

    if (!result.success || !waitForCompletion) {
      return result;
    }

    return this.waitForJob(result.data!.id);
  }

  async generateFlux(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "flux";
    const endpoint = model === "flux" ? "flux" : model === "flux-1.1-pro" ? "flux-11-pro" : "flux-11-pro-ultra";
    return this.generateImage(endpoint, params, wait);
  }

  async generateFluxKontext(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    return this.generateImage("flux-kontext", params, wait);
  }

  async generateNanoBanana(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "nano-banana-pro";
    const endpoint = model === "nano-banana" ? "nano-banana" : "nano-banana-pro";
    return this.generateImage(endpoint, params, wait);
  }

  async generateIdeogram(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "ideogram-3.0";
    const endpoint = model === "ideogram-2.0a-turbo" ? "ideogram-20a-turbo" : "ideogram-30";
    return this.generateImage(endpoint, params, wait);
  }

  async generateImagen(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "imagen-4";
    const endpointMap: Record<string, string> = {
      "imagen-3": "imagen-3",
      "imagen-4": "imagen-4",
      "imagen-4-fast": "imagen-4-fast",
      "imagen-4-ultra": "imagen-4-ultra"
    };
    return this.generateImage(endpointMap[model as string] || "imagen-4", params, wait);
  }

  async generateSeedream(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "seedream-4";
    const endpoint = model === "seedream-3" ? "seedream-3" : "seedream-4";
    return this.generateImage(endpoint, params, wait);
  }

  async generateRunwayImage(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    return this.generateImage("runway-gen-4", params, wait);
  }

  async generateChatGPTImage(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    return this.generateImage("chatgpt-image", params, wait);
  }

  async editImage(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "nano-banana-pro";
    const endpointMap: Record<string, string> = {
      "seededit": "seededit",
      "flux-kontext": "flux-kontext",
      "nano-banana-pro": "nano-banana-pro"
    };
    return this.generateImage(endpointMap[model as string] || "nano-banana-pro", params, wait);
  }

  // ===========================================================================
  // Video Generation API
  // ===========================================================================

  async generateVideo(
    endpoint: string,
    params: Record<string, unknown>,
    waitForCompletion: boolean = false
  ): Promise<ApiResponse<KreaJob>> {
    const body = {
      ...params,
      webhook_url: this.webhookUrl
    };

    const result = await this.post<KreaJob>(`/v1/video/${endpoint}`, body);

    if (!result.success || !waitForCompletion) {
      return result;
    }

    return this.waitForJob(result.data!.id, 300000); // Videos can take longer
  }

  async generateKling(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "kling-2.5";
    const endpointMap: Record<string, string> = {
      "kling-1.0": "kling-10",
      "kling-1.5": "kling-15",
      "kling-1.6": "kling-16",
      "kling-2.0": "kling-20",
      "kling-2.1": "kling-21",
      "kling-2.5": "kling-25"
    };
    return this.generateVideo(endpointMap[model as string] || "kling-25", params, wait);
  }

  async generateHailuo(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "hailuo-2.3";
    const endpointMap: Record<string, string> = {
      "hailuo": "hailuo",
      "hailuo-02": "hailuo-02",
      "hailuo-2.3": "hailuo-23",
      "hailuo-2.3-fast": "hailuo-23-fast"
    };
    return this.generateVideo(endpointMap[model as string] || "hailuo-23", params, wait);
  }

  async generateVeo(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "veo-3";
    const endpointMap: Record<string, string> = {
      "veo-2": "veo-2",
      "veo-3": "veo-3",
      "veo-3-fast": "veo-3-fast",
      "veo-3.1": "veo-31",
      "veo-3.1-fast": "veo-31-fast"
    };
    return this.generateVideo(endpointMap[model as string] || "veo-3", params, wait);
  }

  async generateWan(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "wan-2.5";
    const endpointMap: Record<string, string> = {
      "wan-2.1": "wan-21",
      "wan-2.2": "wan-22",
      "wan-2.5": "wan-25"
    };
    return this.generateVideo(endpointMap[model as string] || "wan-25", params, wait);
  }

  async generatePika(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    return this.generateVideo("pika-22", params, wait);
  }

  async generateSeedance(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "seedance-pro";
    const endpointMap: Record<string, string> = {
      "seedance-lite": "seedance-lite",
      "seedance-pro": "seedance-pro",
      "seedance-pro-fast": "seedance-pro-fast"
    };
    return this.generateVideo(endpointMap[model as string] || "seedance-pro", params, wait);
  }

  async generateRunwayVideo(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "runway-gen-4";
    const endpointMap: Record<string, string> = {
      "runway-gen-3": "runway-gen-3",
      "runway-gen-4": "runway-gen-4",
      "runway-aleph": "runway-aleph"
    };
    return this.generateVideo(endpointMap[model as string] || "runway-gen-4", params, wait);
  }

  async generateRay(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    return this.generateVideo("ray-2", params, wait);
  }

  // ===========================================================================
  // Enhance API
  // ===========================================================================

  async enhanceImage(params: Record<string, unknown>, wait: boolean = false): Promise<ApiResponse<KreaJob>> {
    const model = params.model || "topaz-generative";
    const endpointMap: Record<string, string> = {
      "topaz-generative": "topaz-generative",
      "topaz": "topaz",
      "bloom": "bloom"
    };

    const body = {
      ...params,
      webhook_url: this.webhookUrl
    };

    const result = await this.post<KreaJob>(`/v1/image-enhance/${endpointMap[model as string] || "topaz-generative"}`, body);

    if (!result.success || !wait) {
      return result;
    }

    return this.waitForJob(result.data!.id);
  }
}

// Singleton
let kreaClientInstance: KreaClient | null = null;

export function initializeKreaClient(config: KreaClientConfig): KreaClient {
  kreaClientInstance = new KreaClient(config);
  return kreaClientInstance;
}

export function getKreaClient(): KreaClient {
  if (!kreaClientInstance) {
    throw new Error("Krea client not initialized. Call initializeKreaClient first.");
  }
  return kreaClientInstance;
}
