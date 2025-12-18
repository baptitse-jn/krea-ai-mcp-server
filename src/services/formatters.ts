// =============================================================================
// Response Formatting Utilities for Krea AI MCP Server
// =============================================================================

import { KreaJob, KreaAsset, KreaStyle, CHARACTER_LIMIT } from "../types.js";

/**
 * MCP Tool Result
 */
export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

/**
 * Format a text response
 */
export function formatTextResponse(text: string, data?: Record<string, unknown>): ToolResult {
  const truncatedText = truncateText(text, CHARACTER_LIMIT);
  return {
    content: [{ type: "text", text: truncatedText }],
    ...(data !== undefined && { structuredContent: data })
  };
}

/**
 * Format an error response
 */
export function formatErrorResponse(message: string, suggestion?: string): ToolResult {
  const errorText = suggestion
    ? `❌ **Error**: ${message}\n\n💡 **Suggestion**: ${suggestion}`
    : `❌ **Error**: ${message}`;

  return {
    content: [{ type: "text", text: errorText }],
    isError: true
  };
}

/**
 * Truncate text to limit
 */
export function truncateText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text.substring(0, limit - 100)}\n\n... [Truncated. Use pagination for more results.]`;
}

/**
 * Format a job as Markdown
 */
export function formatJobMarkdown(job: KreaJob): string {
  const statusEmoji = getStatusEmoji(job.status);
  const lines: string[] = [
    `## Job ${statusEmoji}`,
    "",
    `- **ID**: \`${job.id}\``,
    `- **Status**: ${job.status}`,
    `- **Type**: ${job.type}`,
    `- **Created**: ${formatDate(job.createdAt)}`,
    `- **Updated**: ${formatDate(job.updatedAt)}`
  ];

  if (job.completedAt) {
    lines.push(`- **Completed**: ${formatDate(job.completedAt)}`);
  }

  if (job.progress !== undefined) {
    lines.push(`- **Progress**: ${Math.round(job.progress * 100)}%`);
  }

  if (job.error) {
    lines.push("", `### Error`, "", `\`\`\``, job.error, `\`\`\``);
  }

  if (job.result?.urls && job.result.urls.length > 0) {
    lines.push("", "### Generated Assets", "");
    job.result.urls.forEach((url, i) => {
      lines.push(`${i + 1}. ${url}`);
    });
  } else if (job.result?.url) {
    lines.push("", "### Generated Asset", "", job.result.url);
  }

  return lines.join("\n");
}

/**
 * Format jobs list as Markdown
 */
export function formatJobsListMarkdown(jobs: KreaJob[], total: number): string {
  if (jobs.length === 0) {
    return "No jobs found.";
  }

  const lines: string[] = [`## Jobs (${jobs.length} of ${total})`, ""];

  for (const job of jobs) {
    const statusEmoji = getStatusEmoji(job.status);
    lines.push(`### ${statusEmoji} \`${job.id}\``);
    lines.push(`- **Type**: ${job.type} | **Status**: ${job.status}`);
    lines.push(`- **Created**: ${formatDate(job.createdAt)}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format an asset as Markdown
 */
export function formatAssetMarkdown(asset: KreaAsset): string {
  const lines: string[] = [
    `## Asset`,
    "",
    `- **ID**: \`${asset.id}\``,
    `- **Type**: ${asset.type}`,
    `- **URL**: ${asset.url}`
  ];

  if (asset.width && asset.height) {
    lines.push(`- **Dimensions**: ${asset.width}x${asset.height}`);
  }

  if (asset.duration) {
    lines.push(`- **Duration**: ${asset.duration}s`);
  }

  if (asset.format) {
    lines.push(`- **Format**: ${asset.format}`);
  }

  if (asset.size) {
    lines.push(`- **Size**: ${formatFileSize(asset.size)}`);
  }

  lines.push(`- **Created**: ${formatDate(asset.createdAt)}`);

  return lines.join("\n");
}

/**
 * Format assets list as Markdown
 */
export function formatAssetsListMarkdown(assets: KreaAsset[], total: number): string {
  if (assets.length === 0) {
    return "No assets found.";
  }

  const lines: string[] = [`## Assets (${assets.length} of ${total})`, ""];

  for (const asset of assets) {
    const typeEmoji = asset.type === "image" ? "🖼️" : "🎬";
    lines.push(`### ${typeEmoji} \`${asset.id}\``);
    lines.push(`- **URL**: ${asset.url}`);
    if (asset.width && asset.height) {
      lines.push(`- **Dimensions**: ${asset.width}x${asset.height}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format a style as Markdown
 */
export function formatStyleMarkdown(style: KreaStyle): string {
  const statusEmoji = style.status === "ready" ? "✅" : style.status === "training" ? "⏳" : "❌";
  const lines: string[] = [
    `## Style ${statusEmoji}`,
    "",
    `- **ID**: \`${style.id}\``,
    `- **Name**: ${style.name}`,
    `- **Type**: ${style.type}`,
    `- **Status**: ${style.status}`
  ];

  if (style.description) {
    lines.push(`- **Description**: ${style.description}`);
  }

  if (style.thumbnailUrl) {
    lines.push(`- **Thumbnail**: ${style.thumbnailUrl}`);
  }

  lines.push(`- **Created**: ${formatDate(style.createdAt)}`);
  lines.push(`- **Updated**: ${formatDate(style.updatedAt)}`);

  return lines.join("\n");
}

/**
 * Format styles list as Markdown
 */
export function formatStylesListMarkdown(styles: KreaStyle[], total: number): string {
  if (styles.length === 0) {
    return "No styles found.";
  }

  const lines: string[] = [`## Styles (${styles.length} of ${total})`, ""];

  for (const style of styles) {
    const statusEmoji = style.status === "ready" ? "✅" : style.status === "training" ? "⏳" : "❌";
    const typeEmoji = style.type === "preset" ? "📦" : style.type === "custom" ? "🎨" : "🤝";
    lines.push(`### ${typeEmoji} ${style.name} ${statusEmoji}`);
    lines.push(`- **ID**: \`${style.id}\``);
    if (style.description) {
      lines.push(`- **Description**: ${style.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format generation job result
 */
export function formatGenerationResult(job: KreaJob, type: "image" | "video"): string {
  const emoji = type === "image" ? "🖼️" : "🎬";
  const lines: string[] = [];

  if (job.status === "completed") {
    lines.push(`## ${emoji} Generation Complete!`);
    lines.push("");
    
    if (job.result?.urls && job.result.urls.length > 0) {
      lines.push("### Generated Assets");
      lines.push("");
      job.result.urls.forEach((url, i) => {
        lines.push(`${i + 1}. ${url}`);
      });
    } else if (job.result?.url) {
      lines.push("### Generated Asset");
      lines.push("");
      lines.push(job.result.url);
    }
  } else if (job.status === "processing" || job.status === "pending") {
    lines.push(`## ${emoji} Generation In Progress`);
    lines.push("");
    lines.push(`- **Job ID**: \`${job.id}\``);
    lines.push(`- **Status**: ${job.status}`);
    if (job.progress !== undefined) {
      lines.push(`- **Progress**: ${Math.round(job.progress * 100)}%`);
    }
    lines.push("");
    lines.push("Use `krea_get_job` with this ID to check status, or `krea_wait_for_job` to wait for completion.");
  } else {
    lines.push(`## ${emoji} Generation Failed`);
    lines.push("");
    lines.push(`- **Job ID**: \`${job.id}\``);
    lines.push(`- **Status**: ${job.status}`);
    if (job.error) {
      lines.push(`- **Error**: ${job.error}`);
    }
  }

  return lines.join("\n");
}

/**
 * Get status emoji
 */
function getStatusEmoji(status: string): string {
  switch (status) {
    case "completed": return "✅";
    case "processing": return "⏳";
    case "pending": return "🕐";
    case "failed": return "❌";
    case "cancelled": return "🚫";
    default: return "❓";
  }
}

/**
 * Format date
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
