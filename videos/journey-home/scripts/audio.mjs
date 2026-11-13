// usage: node scripts/audio.mjs <out.wav> [composition]  (renders the soundtrack only)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [out, id = "ChillsRemake"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
await renderMedia({ composition, serveUrl, codec: "wav", outputLocation: out, browserExecutable, timeoutInMilliseconds: 300000 });
console.log("done", out);
