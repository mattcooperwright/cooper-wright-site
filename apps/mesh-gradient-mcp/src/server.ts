// MCP server (stdio) that lets Claude render mesh gradients with the Mesh Gradient Studio engine.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MAX_COLOURS, MAX_SIZE, MIN_COLOURS, MIN_SIZE, PALETTES, RATIO_NAMES, renderGradient } from "./render.ts";

// Files are only ever written here, never to a path the caller supplies.
const OUT_DIR = process.env.MESH_GRADIENT_OUT_DIR ?? join(homedir(), "mesh-gradients");

function safeName(requested: string | undefined, gradient: { seed: number; width: number; height: number }): string {
  const stem = (requested ? basename(requested) : `mesh-gradient-${gradient.seed}-${gradient.width}x${gradient.height}`)
    .replace(/\.png$/i, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 80) || "mesh-gradient";
  let file = join(OUT_DIR, `${stem}.png`);
  for (let n = 2; existsSync(file); n += 1) file = join(OUT_DIR, `${stem}-${n}.png`); // never overwrite
  return file;
}

const server = new McpServer({ name: "mesh-gradient", version: "0.1.0" });

server.registerTool(
  "generate_mesh_gradient",
  {
    title: "Generate mesh gradient",
    description:
      "Render a textured mesh gradient (soft overlapping colour fields with film grain) using the Mesh Gradient Studio engine. " +
      "Returns a small JPEG preview and saves the full-size PNG, reporting its path. " +
      "Pass your own hex colours, or a palette name from list_palettes. The same colours, seed, ratio, grain and blur always give the same picture, " +
      "so reuse the returned seed to re-render a result you liked, or change only the seed to get a different arrangement of the same colours.",
    inputSchema: {
      colours: z
        .array(z.string())
        .min(MIN_COLOURS)
        .max(MAX_COLOURS)
        .optional()
        .describe(`${MIN_COLOURS} to ${MAX_COLOURS} colours as 6-digit hex, e.g. "#FF5C35". The first is the base colour; order affects where each colour lands.`),
      palette: z.string().optional().describe("Name of a preset from list_palettes. Ignored if you give colours; defaults to \"studio\"."),
      ratio: z.enum(RATIO_NAMES).optional().describe("Aspect ratio, width:height. Default 1:1."),
      size: z.number().int().min(MIN_SIZE).max(MAX_SIZE).optional().describe(`Long edge in pixels, ${MIN_SIZE} to ${MAX_SIZE}. Default 2048.`),
      grain: z.number().min(0).max(100).optional().describe("Film grain strength, 0 to 100. Default 18."),
      blur: z.number().min(0).max(100).optional().describe("Softness, 0 to 100. Higher melts the colour fields together. Default 28."),
      seed: z.number().int().min(0).max(2 ** 31 - 1).optional().describe("Seed for the layout of the colour fields. Random if omitted; the result reports the one used."),
      filename: z.string().optional().describe("Name for the saved PNG (no folders). Defaults to one built from the seed and size."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ filename, ...params }) => {
    try {
      const gradient = renderGradient(params);
      mkdirSync(OUT_DIR, { recursive: true });
      const file = safeName(filename, gradient);
      writeFileSync(file, gradient.png);
      const summary = {
        file,
        width: gradient.width,
        height: gradient.height,
        ratio: gradient.ratio,
        colours: gradient.colours,
        grain: gradient.grain,
        blur: gradient.blur,
        seed: gradient.seed,
      };
      return {
        content: [
          { type: "image", data: gradient.jpegPreview.toString("base64"), mimeType: "image/jpeg" },
          { type: "text", text: `Saved ${gradient.width}x${gradient.height} PNG to ${file}. The image above is a reduced JPEG preview.\n${JSON.stringify(summary, null, 2)}` },
        ],
      };
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }] };
    }
  },
);

server.registerTool(
  "list_palettes",
  {
    title: "List palettes",
    description: "List the preset palettes taken from Mesh Gradient Studio. You are not limited to these: generate_mesh_gradient accepts any 4 to 8 hex colours.",
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async () => ({
    content: [{ type: "text", text: JSON.stringify(PALETTES, null, 2) }],
  }),
);

await server.connect(new StdioServerTransport());
