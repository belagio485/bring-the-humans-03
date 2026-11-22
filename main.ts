// Bring the humans with a TikTok ad — entry program.
//
// The entry is the TikTok video named by VIDEO.json at this repository's
// root. This program's only job is to copy that file into the grader's
// output directory, exactly as the bounty requires: the house reads the
// video itself from TikTok, so nothing the program writes about the video
// counts. Standard library only, no network.
//
// Run it locally the way the kit does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const videoJsonPath = join(repoRoot, "VIDEO.json");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "VIDEO.json");

const raw = await readFile(videoJsonPath, "utf8");
const video = JSON.parse(raw);

if (typeof video !== "object" || video === null || Array.isArray(video)) {
  throw new Error("VIDEO.json must hold a JSON object with a url field.");
}
if (typeof video.url !== "string" || video.url.length === 0) {
  throw new Error("VIDEO.json must name the video's full TikTok address.");
}

// Fail loudly here, at build time, if the address is not the shape the
// gate accepts: https://www.tiktok.com/@<handle>/video/<id>, id digits only.
// A short link (vm.tiktok.com, vt.tiktok.com, tiktok.com/t/...) or a photo
// post (/photo/<id>) is refused, so refuse it here first.
const videoUrlPattern =
  /^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+(\?.*)?$/;
if (!videoUrlPattern.test(video.url)) {
  throw new Error(
    `VIDEO.json url is not a TikTok video address: ${video.url}`,
  );
}

await mkdir(outputDir, { recursive: true });
await copyFile(videoJsonPath, outputPath);

console.log(`Copied VIDEO.json to ${outputPath}`);
console.log(`Video: ${video.url}`);
