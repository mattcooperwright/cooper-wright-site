import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Starts the real server over stdio and talks to it with the SDK's client.
test("server lists its tools, renders over stdio and writes only inside its output folder", async () => {
  const outDir = mkdtempSync(join(tmpdir(), "mesh-mcp-"));
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [join(import.meta.dirname, "..", "src", "server.ts")],
      env: { ...process.env, MESH_GRADIENT_OUT_DIR: outDir } as Record<string, string>,
    }),
  );
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), ["generate_mesh_gradient", "list_palettes"]);

    const palettes = await client.callTool({ name: "list_palettes", arguments: {} });
    assert.match(JSON.stringify(palettes.content), /warm-yellows/);

    const result = await client.callTool({
      name: "generate_mesh_gradient",
      arguments: { palette: "cool-blues", size: 512, seed: 42, filename: "../../escape" },
    });
    assert.ok(!result.isError, JSON.stringify(result.content));
    const content = result.content as Array<{ type: string; mimeType?: string; text?: string }>;
    assert.equal(content[0].type, "image");
    assert.equal(content[0].mimeType, "image/jpeg");
    const files = readdirSync(outDir);
    assert.deepEqual(files, ["escape.png"]); // the folder part of the name was dropped
    assert.ok(statSync(join(outDir, files[0])).size > 1000);
    assert.ok(existsSync(join(outDir, "escape.png")));

    const again = await client.callTool({ name: "generate_mesh_gradient", arguments: { palette: "cool-blues", size: 512, seed: 42, filename: "escape" } });
    assert.ok(!again.isError);
    assert.deepEqual(readdirSync(outDir).sort(), ["escape-2.png", "escape.png"]); // never overwrites

    const bad = await client.callTool({ name: "generate_mesh_gradient", arguments: { colours: ["red", "#00FF00", "#0000FF", "#FFFFFF"] } });
    assert.ok(bad.isError);
  } finally {
    await client.close();
    rmSync(outDir, { recursive: true, force: true });
  }
});
