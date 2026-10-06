import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
const root = new URL("../dist/", import.meta.url);
async function walk(dir, prefix = "") {
  const out = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const relative = prefix + item.name;
    if (item.isDirectory())
      out.push(...(await walk(new URL(item.name + "/", dir), relative + "/")));
    else if (
      !["sw.js", "_headers", "robots.txt"].includes(relative) &&
      !relative.endsWith("OFL.txt") && !relative.endsWith(".zip")
    )
      out.push("/" + relative);
  }
  return out;
}
const files = (await walk(root)).sort();
const hash = createHash("sha256");
for (const url of files)
  hash.update(await readFile(new URL(url.slice(1), root)));
const version = hash.digest("hex").slice(0, 12);
const template = await readFile(
  new URL("./service-worker.template.js", import.meta.url),
  "utf8",
);
const precacheUrls = ["/", ...files];
const source = template
  .replace("__CACHE_NAME__", JSON.stringify("club-owner-" + version))
  .replace("__PRECACHE_URLS__", JSON.stringify(precacheUrls));
await writeFile(new URL("sw.js", root), source);
console.log(
  `Offline build: ${precacheUrls.length} local resources, cache club-owner-${version}`,
);
