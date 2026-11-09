// Mesh gradient engine. Shared by the studio page and the MCP server in
// apps/mesh-gradient-mcp, so both draw exactly the same picture. It touches no
// DOM at import time: pass `createCanvas` to render outside a browser.

export type MeshNode = {
  x: number;
  y: number;
  radius: number;
  angle: number;
  warp: number;
};

export type Ratio = "1:1" | "4:5" | "16:9";

export const INITIAL_COLOURS = [
  "#FF5C35",
  "#F5E960",
  "#E950FF",
  "#6B5CFF",
  "#22D3C5",
  "#101426",
];

export const RANDOM_COLOURS = [
  "#FF5C35", "#FF8A4C", "#FFE45C", "#C7FF4A", "#2EE6A6", "#18C8FF",
  "#5072FF", "#7557FF", "#C44DFF", "#FF53AA", "#FF3864", "#11152C",
];

export const QUICK_COLOUR_GROUPS = [
  {
    name: "Warm yellows",
    colours: ["#FFB500", "#E07C00", "#FFC300", "#E68300"],
  },
  {
    name: "Cool blues",
    colours: ["#1FBFD7", "#C4EBF2", "#024C77", "#00A5D5"],
  },
];

export const RATIOS: Record<Ratio, [number, number]> = {
  "1:1": [1, 1],
  "4:5": [4, 5],
  "16:9": [16, 9],
};

export function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeNodes(count: number, seed: number): MeshNode[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, index) => {
    const perimeter = index / count;
    const angle = perimeter * Math.PI * 2 + (random() - 0.5) * 1.4;
    const distance = 0.18 + random() * 0.42;
    return {
      x: Math.min(1.08, Math.max(-0.08, 0.5 + Math.cos(angle) * distance)),
      y: Math.min(1.08, Math.max(-0.08, 0.5 + Math.sin(angle) * distance)),
      radius: 0.52 + random() * 0.38,
      angle: random() * Math.PI * 2,
      warp: 0.08 + random() * 0.18,
    };
  });
}

export function hexToRgb(hex: string) {
  const safe = hex.replace("#", "");
  const expanded = safe.length === 3 ? safe.split("").map((c) => c + c).join("") : safe;
  const value = Number.parseInt(expanded, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function renderMesh(
  output: HTMLCanvasElement,
  width: number,
  height: number,
  colours: string[],
  nodes: MeshNode[],
  grain: number,
  blur: number,
  createCanvas: () => HTMLCanvasElement = () => document.createElement("canvas"),
) {
  output.width = width;
  output.height = height;
  const outputContext = output.getContext("2d");
  if (!outputContext) return;

  // Keep the colour field bounded for fast 4K export; full-resolution grain is
  // added afterwards so exported texture remains genuinely high resolution.
  const maxWorkingEdge = 1800;
  const scale = Math.min(1, maxWorkingEdge / Math.max(width, height));
  const workingWidth = Math.max(1, Math.round(width * scale));
  const workingHeight = Math.max(1, Math.round(height * scale));
  const mesh = createCanvas();
  mesh.width = workingWidth;
  mesh.height = workingHeight;
  const context = mesh.getContext("2d");
  if (!context) return;

  context.fillStyle = colours[0];
  context.fillRect(0, 0, workingWidth, workingHeight);

  const maxDimension = Math.max(workingWidth, workingHeight);
  nodes.forEach((node, index) => {
    const colour = colours[index % colours.length];
    const x = node.x * workingWidth;
    const y = node.y * workingHeight;
    const radius = node.radius * maxDimension;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(colour, 0.98));
    gradient.addColorStop(0.34, rgba(colour, 0.78));
    gradient.addColorStop(0.72, rgba(colour, 0.24));
    gradient.addColorStop(1, rgba(colour, 0));
    context.globalCompositeOperation = "source-over";
    context.fillStyle = gradient;
    context.fillRect(0, 0, workingWidth, workingHeight);
  });

  // Offset echoes create folded transitions rather than obvious radial blobs.
  nodes.forEach((node, index) => {
    const colour = colours[index % colours.length];
    const x = (node.x + Math.cos(node.angle) * node.warp) * workingWidth;
    const y = (node.y + Math.sin(node.angle) * node.warp) * workingHeight;
    const radius = node.radius * maxDimension * 0.42;
    const echo = context.createRadialGradient(x, y, 0, x, y, radius);
    echo.addColorStop(0, rgba(colour, 0.54));
    echo.addColorStop(0.56, rgba(colour, 0.22));
    echo.addColorStop(1, rgba(colour, 0));
    context.globalCompositeOperation = index % 2 === 0 ? "screen" : "soft-light";
    context.fillStyle = echo;
    context.fillRect(0, 0, workingWidth, workingHeight);
  });
  context.globalCompositeOperation = "source-over";

  outputContext.clearRect(0, 0, width, height);
  const blurPixels = (blur / 100) * Math.min(workingWidth, workingHeight) * 0.055;
  // Draw beyond the crop so the blur kernel always samples real mesh pixels.
  // This removes the coloured halo that appeared when the blurred layer faded
  // into a separate backing colour at the canvas boundary.
  const overscan = Math.ceil(blurPixels * 3);
  outputContext.filter = blurPixels > 0.1 ? `blur(${blurPixels}px)` : "none";
  outputContext.drawImage(mesh, -overscan, -overscan, width + overscan * 2, height + overscan * 2);
  outputContext.filter = "none";

  if (grain > 0) {
    const noise = createCanvas();
    noise.width = 192;
    noise.height = 192;
    const noiseContext = noise.getContext("2d");
    if (noiseContext) {
      const image = noiseContext.createImageData(noise.width, noise.height);
      const random = mulberry32(948251);
      for (let i = 0; i < image.data.length; i += 4) {
        const value = Math.floor(random() * 255);
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
      noiseContext.putImageData(image, 0, 0);
      const pattern = outputContext.createPattern(noise, "repeat");
      if (pattern) {
        outputContext.globalCompositeOperation = "soft-light";
        outputContext.globalAlpha = (grain / 100) * 0.48;
        outputContext.fillStyle = pattern;
        outputContext.fillRect(0, 0, width, height);
        outputContext.globalAlpha = 1;
        outputContext.globalCompositeOperation = "source-over";
      }
    }
  }
}
