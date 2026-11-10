// usage: node scripts/render.mjs <out.mp4> <from> <to> [scale] [concurrency]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [out, from, to, scale = "1", conc = "2", id = "Film"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
const t0 = Date.now(); let last = 0;
await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: out, frameRange: [Number(from), Number(to)], scale: Number(scale),
  browserExecutable, chromiumOptions, concurrency: Number(conc), crf: 16, imageFormat: "jpeg", jpegQuality: 92, timeoutInMilliseconds: 300000, muted: true,
  onProgress: ({ renderedFrames }) => { if (renderedFrames - last >= 25) { last = renderedFrames; console.log("frames", renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + "s"); } } });
console.log("done", out, ((Date.now() - t0) / 1000).toFixed(0) + "s");
