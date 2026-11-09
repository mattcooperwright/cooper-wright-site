"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MeshNode = {
  x: number;
  y: number;
  radius: number;
  angle: number;
  warp: number;
};

type Ratio = "1:1" | "4:5" | "16:9";

const INITIAL_COLOURS = [
  "#FF5C35",
  "#F5E960",
  "#E950FF",
  "#6B5CFF",
  "#22D3C5",
  "#101426",
];

const RANDOM_COLOURS = [
  "#FF5C35", "#FF8A4C", "#FFE45C", "#C7FF4A", "#2EE6A6", "#18C8FF",
  "#5072FF", "#7557FF", "#C44DFF", "#FF53AA", "#FF3864", "#11152C",
];

const QUICK_COLOUR_GROUPS = [
  {
    name: "Warm yellows",
    colours: ["#FFB500", "#E07C00", "#FFC300", "#E68300"],
  },
  {
    name: "Cool blues",
    colours: ["#1FBFD7", "#C4EBF2", "#024C77", "#00A5D5"],
  },
];

const RATIOS: Record<Ratio, [number, number]> = {
  "1:1": [1, 1],
  "4:5": [4, 5],
  "16:9": [16, 9],
};

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNodes(count: number, seed: number): MeshNode[] {
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

function hexToRgb(hex: string) {
  const safe = hex.replace("#", "");
  const expanded = safe.length === 3 ? safe.split("").map((c) => c + c).join("") : safe;
  const value = Number.parseInt(expanded, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderMesh(
  output: HTMLCanvasElement,
  width: number,
  height: number,
  colours: string[],
  nodes: MeshNode[],
  grain: number,
  blur: number,
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
  const mesh = document.createElement("canvas");
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
    const noise = document.createElement("canvas");
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

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="slider-control">
      <span className="control-label"><span>{label}</span><span className="control-value">{value}</span></span>
      <input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [colours, setColours] = useState(INITIAL_COLOURS);
  const [nodes, setNodes] = useState(() => makeNodes(INITIAL_COLOURS.length, 2719));
  const [grain, setGrain] = useState(18);
  const [blur, setBlur] = useState(28);
  const [ratio, setRatio] = useState<Ratio>("1:1");
  const [exportSize, setExportSize] = useState(4096);
  const [editingMesh, setEditingMesh] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [draggedColour, setDraggedColour] = useState<number | null>(null);
  const [draggedQuickColour, setDraggedQuickColour] = useState<string | null>(null);
  const [colourDropIndex, setColourDropIndex] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const dimensions = useMemo(() => {
    const [rw, rh] = RATIOS[ratio];
    return rw >= rh ? [exportSize, Math.round((exportSize * rh) / rw)] : [Math.round((exportSize * rw) / rh), exportSize];
  }, [ratio, exportSize]);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const bounds = stage.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderMesh(canvas, Math.max(1, Math.round(bounds.width * dpr)), Math.max(1, Math.round(bounds.height * dpr)), colours, nodes, grain, blur);
  }, [colours, nodes, grain, blur]);

  useEffect(() => {
    drawPreview();
    const observer = new ResizeObserver(drawPreview);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [drawPreview, ratio]);

  useEffect(() => {
    if (dragging === null) return;
    const move = (event: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      const x = Math.min(1.08, Math.max(-0.08, (event.clientX - bounds.left) / bounds.width));
      const y = Math.min(1.08, Math.max(-0.08, (event.clientY - bounds.top) / bounds.height));
      setNodes((current) => current.map((node, index) => index === dragging ? { ...node, x, y } : node));
    };
    const stop = () => setDragging(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
  }, [dragging]);

  const updateColour = (index: number, value: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) return;
    setColours((current) => current.map((colour, colourIndex) => colourIndex === index ? value.toUpperCase() : colour));
  };

  const addSpecificColour = (colour: string) => {
    if (colours.length >= 8) return;
    setColours((current) => [...current, colour]);
    setNodes((current) => [...current, makeNodes(1, Date.now())[0]]);
  };

  const addColour = () => {
    const nextColour = RANDOM_COLOURS[(colours.length * 3 + Math.floor(Math.random() * RANDOM_COLOURS.length)) % RANDOM_COLOURS.length];
    addSpecificColour(nextColour);
  };

  const removeColourAt = (index: number) => {
    if (colours.length <= 4) return;
    setColours((current) => current.filter((_, colourIndex) => colourIndex !== index));
    setNodes((current) => current.filter((_, nodeIndex) => nodeIndex !== index));
  };

  const moveColour = (from: number, to: number) => {
    if (from === to) return;
    setColours((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const randomise = () => setNodes(makeNodes(colours.length, Date.now()));

  const exportPng = async () => {
    setExporting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 20));
    const exportCanvas = document.createElement("canvas");
    renderMesh(exportCanvas, dimensions[0], dimensions[1], colours, nodes, grain, blur);
    exportCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `mesh-gradient-${dimensions[0]}x${dimensions[1]}.png`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setExporting(false);
    }, "image/png");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span>Mesh Studio</span>
        </div>
        <div className="top-actions">
          <button className="button button-secondary randomise-button" onClick={randomise}>
            Randomise
          </button>
          <button className="button button-primary desktop-export" onClick={exportPng} disabled={exporting}>
            {exporting ? "Rendering…" : "Export PNG"}
          </button>
        </div>
      </header>

      <section className="workspace">
        <div className="preview-pane">
          <div className="preview-toolbar">
            <span>{colours.length} colour mesh</span>
            <button className={`mesh-edit-toggle ${editingMesh ? "is-active" : ""}`} onClick={() => setEditingMesh((current) => !current)} aria-pressed={editingMesh}>
              <span className="points-symbol" aria-hidden="true" />{editingMesh ? "Done" : "Edit points"}
            </button>
          </div>
          <div className="canvas-frame">
            <div className={`canvas-stage ratio-${ratio.replace(":", "-")}`} ref={stageRef}>
              <canvas ref={canvasRef} aria-label="Mesh gradient preview" />
              {editingMesh && nodes.map((node, index) => (
                <button
                  key={index}
                  className="mesh-point"
                  style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%`, background: colours[index] }}
                  onPointerDown={(event) => { event.preventDefault(); setDragging(index); }}
                  aria-label={`Move colour ${index + 1}`}
                ><span /></button>
              ))}
            </div>
          </div>
          <p className={`edit-hint ${editingMesh ? "is-visible" : ""}`}>Drag the colour points to reshape the mesh.</p>
        </div>

        <aside className="control-panel">
          <section className="control-section palette-section">
            <div className="section-heading">
              <div><span className="eyebrow">Palette</span><h2>Colours</h2></div>
              <div className="colour-stepper" aria-label="Number of colours">
                <button onClick={() => removeColourAt(colours.length - 1)} disabled={colours.length <= 4} aria-label="Remove last colour">−</button>
                <span>{colours.length}</span>
                <button onClick={addColour} disabled={colours.length >= 8} aria-label="Add colour">+</button>
              </div>
            </div>
            <div className="colour-list">
              {colours.map((colour, index) => (
                <div
                  className={`colour-row ${draggedColour === index ? "is-dragging" : ""} ${colourDropIndex === index && (draggedQuickColour !== null || draggedColour !== index) ? "is-drop-target" : ""}`}
                  key={index}
                  onDragOver={(event) => {
                    if (draggedColour === null && draggedQuickColour === null) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = draggedQuickColour !== null ? "copy" : "move";
                    setColourDropIndex(index);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedQuickColour !== null) updateColour(index, draggedQuickColour);
                    else if (draggedColour !== null) moveColour(draggedColour, index);
                    setDraggedColour(null);
                    setDraggedQuickColour(null);
                    setColourDropIndex(null);
                  }}
                >
                  <label className="colour-swatch" style={{ background: colour }}>
                    <input type="color" value={colour} onChange={(event) => updateColour(index, event.target.value)} aria-label={`Choose colour ${index + 1}`} />
                  </label>
                  <div className="colour-row-meta">
                    <span
                      className="drag-handle"
                      draggable
                      role="button"
                      tabIndex={0}
                      aria-label={`Drag ${colour} to reorder`}
                      title="Drag to reorder"
                      onDragStart={(event) => {
                        setDraggedColour(index);
                        setDraggedQuickColour(null);
                        setColourDropIndex(index);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", String(index));
                      }}
                      onDragEnd={() => {
                        setDraggedColour(null);
                        setDraggedQuickColour(null);
                        setColourDropIndex(null);
                      }}
                      onKeyDown={(event) => {
                        if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && index > 0) {
                          event.preventDefault();
                          moveColour(index, index - 1);
                        }
                        if ((event.key === "ArrowRight" || event.key === "ArrowDown") && index < colours.length - 1) {
                          event.preventDefault();
                          moveColour(index, index + 1);
                        }
                      }}
                    ><span aria-hidden="true">⠿</span></span>
                    <input
                      key={colour}
                      className="hex-input"
                      defaultValue={colour}
                      onChange={(event) => {
                        if (/^#[0-9A-Fa-f]{6}$/.test(event.target.value)) updateColour(index, event.target.value);
                      }}
                      onBlur={(event) => {
                        if (!/^#[0-9A-Fa-f]{6}$/.test(event.target.value)) event.target.value = colour;
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                      aria-label={`Hex value for colour ${index + 1}`}
                      spellCheck={false}
                    />
                    <button
                      className="remove-colour"
                      onClick={() => removeColourAt(index)}
                      disabled={colours.length <= 4}
                      aria-label={`Remove ${colour}`}
                      title={colours.length <= 4 ? "A mesh needs at least four colours" : `Remove ${colour}`}
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="quick-colours">
              <div className="quick-colours-heading">
                <span>Quick colours</span>
                <span>Add or drag to replace</span>
              </div>
              {QUICK_COLOUR_GROUPS.map((group) => (
                <div className="quick-colour-group" key={group.name}>
                  <span className="quick-colour-label">{group.name}</span>
                  <div className="quick-colour-grid">
                    {group.colours.map((colour) => {
                      const isActive = colours.includes(colour);
                      const isDisabled = isActive;
                      return (
                        <button
                          key={colour}
                          className={`quick-colour ${isActive ? "is-active" : ""}`}
                          onClick={() => addSpecificColour(colour)}
                          disabled={isDisabled}
                          draggable={!isActive}
                          onDragStart={(event) => {
                            setDraggedQuickColour(colour);
                            setDraggedColour(null);
                            event.dataTransfer.effectAllowed = "copy";
                            event.dataTransfer.setData("text/plain", colour);
                          }}
                          onDragEnd={() => {
                            setDraggedQuickColour(null);
                            setColourDropIndex(null);
                          }}
                          title={isActive ? `${colour} already added` : colours.length >= 8 ? `Drag ${colour} onto an active chip to replace it` : `Add ${colour}, or drag to replace`}
                          aria-label={isActive ? `${colour} already added` : `Add ${colour}`}
                        >
                          <span className="quick-colour-chip" style={{ background: colour }} />
                          <span className="quick-colour-code">{colour.slice(1)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="limit-note">Drag active chips to reorder, or drop a quick colour onto one to replace it.</p>
          </section>

          <section className="control-section finish-section">
            <span className="eyebrow">Finish</span><h2>Texture</h2>
            <div className="slider-stack">
              <Slider label="Grain" value={grain} onChange={setGrain} />
              <Slider label="Blur" value={blur} onChange={setBlur} />
            </div>
          </section>

          <section className="control-section export-section">
            <span className="eyebrow">Output</span><h2>Export</h2>
            <div className="field-group">
              <span className="field-label">Format</span>
              <div className="segmented-control three-up">
                {(Object.keys(RATIOS) as Ratio[]).map((item) => (
                  <button key={item} className={ratio === item ? "is-selected" : ""} onClick={() => setRatio(item)}>{item}</button>
                ))}
              </div>
            </div>
            <div className="field-group">
              <span className="field-label">Long edge</span>
              <div className="segmented-control three-up">
                {[1024, 2048, 4096].map((size) => (
                  <button key={size} className={exportSize === size ? "is-selected" : ""} onClick={() => setExportSize(size)}>{size === 1024 ? "1K" : size === 2048 ? "2K" : "4K"}</button>
                ))}
              </div>
            </div>
            <button className="button button-primary mobile-export" onClick={exportPng} disabled={exporting}>
              {exporting ? "Rendering…" : `Export ${dimensions[0]} × ${dimensions[1]} PNG`}
            </button>
            <p className="export-meta">PNG · {dimensions[0]} × {dimensions[1]} px</p>
          </section>
        </aside>
      </section>
    </main>
  );
}
