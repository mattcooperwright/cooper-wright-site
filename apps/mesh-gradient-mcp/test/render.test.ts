import assert from "node:assert/strict";
import test from "node:test";
import { PALETTES, renderGradient, resolveColours } from "../src/render.ts";

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

test("renders a PNG at the requested long edge and ratio", () => {
  const g = renderGradient({ size: 512, ratio: "16:9", seed: 7 });
  assert.deepEqual([...g.png.subarray(0, 4)], PNG_MAGIC);
  assert.equal(g.width, 512);
  assert.equal(g.height, 288);
  const portrait = renderGradient({ size: 512, ratio: "4:5", seed: 7 });
  assert.equal(portrait.height, 512);
  assert.equal(portrait.width, 410);
});

test("the same inputs give the same picture, and a new seed gives a different one", () => {
  const a = renderGradient({ size: 256, seed: 1 });
  const b = renderGradient({ size: 256, seed: 1 });
  const c = renderGradient({ size: 256, seed: 2 });
  assert.ok(a.png.equals(b.png));
  assert.ok(!a.png.equals(c.png));
});

test("a JPEG preview is small enough to show inline", () => {
  const g = renderGradient({ size: 4096, seed: 3 });
  assert.deepEqual([...g.jpegPreview.subarray(0, 2)], [0xff, 0xd8]);
  assert.ok(g.jpegPreview.length < 500_000, `preview is ${g.jpegPreview.length} bytes`);
});

test("colours are validated and upper-cased", () => {
  assert.deepEqual(resolveColours({ colours: ["#ff0000", "#00ff00", "#0000ff", "#ffffff"] }, 1), ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF"]);
  assert.throws(() => resolveColours({ colours: ["#fff", "#00ff00", "#0000ff", "#ffffff"] }, 1), /6-digit hex/);
  assert.throws(() => resolveColours({ colours: ["#ff0000", "#00ff00"] }, 1), /4 to 8/);
  assert.throws(() => resolveColours({ colours: ["#ff0000", "#00ff00", "#0000ff", "#ffffff"], palette: "studio" }, 1), /either/);
  assert.throws(() => resolveColours({ palette: "nope" }, 1), /Known palettes/);
});

test("every preset palette renders", () => {
  for (const palette of PALETTES) {
    const g = renderGradient({ palette: palette.name, size: 256, seed: 5 });
    assert.ok(g.colours.length >= 4 && g.colours.length <= 8, palette.name);
  }
});

test("size and ratio limits are enforced", () => {
  assert.throws(() => renderGradient({ size: 100 }), /size must be/);
  assert.throws(() => renderGradient({ size: 5000 }), /size must be/);
});
