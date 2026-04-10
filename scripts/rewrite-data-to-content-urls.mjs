/**
 * 将 data.json 中格子的 url 统一改为内链 ./content/{四位编号}.{扩展名}
 * 运行：node scripts/rewrite-data-to-content-urls.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataPath = path.join(root, "data.json");

const raw = fs.readFileSync(dataPath, "utf8");
const data = JSON.parse(raw);
if (!data.items || typeof data.items !== "object") {
  console.error("data.json 缺少 items");
  process.exit(1);
}

let n = 0;
for (const [id, item] of Object.entries(data.items)) {
  if (!item || typeof item !== "object") continue;
  const t = String(item.type || "text").toLowerCase();
  let next = null;
  if (t === "text") {
    const u = String(item.url || "").trim();
    if (!u || /^https?:\/\//i.test(u)) next = `./content/${id}.jpg`;
  } else if (t === "image") {
    next = `./content/${id}.jpg`;
  } else if (t === "audio") {
    next = `./content/${id}.mp3`;
  } else if (t === "video") {
    next = `./content/${id}.mp4`;
  }
  if (next != null && item.url !== next) {
    item.url = next;
    n += 1;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`已更新 ${n} 条 url → ./content/…（共 ${Object.keys(data.items).length} 条）`);
