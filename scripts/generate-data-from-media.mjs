/**
 * 扫描项目内「内容收集」文件夹（默认 content/，可为 media/ 等），按 0001.jpg～1000.xxx 合并进 data.json。
 * 用法（项目根目录）：
 *   node scripts/generate-data-from-media.mjs
 *   node scripts/generate-data-from-media.mjs content
 *   node scripts/generate-data-from-media.mjs media
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataPath = path.join(root, "data.json");

const subdir = (process.argv[2] || "content").replace(/^[./\\]+|[/\\]+$/g, "").replace(/\\/g, "/") || "content";
const mediaDir = path.join(root, subdir);

let data = {
  version: 1,
  range: { min: 1, max: 1000, cols: 40, rows: 25 },
  heroImage: "",
  items: {},
};

if (fs.existsSync(dataPath)) {
  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    data = { ...data, ...JSON.parse(raw) };
    if (!data.items || typeof data.items !== "object") data.items = {};
  } catch (e) {
    console.warn("读取 data.json 失败，将新建结构。", e.message);
  }
}

if (!fs.existsSync(mediaDir)) {
  console.error(`未找到文件夹 ${subdir}/ ，请在项目根目录创建并放入 0001.jpg 等文件。`);
  process.exit(1);
}

const files = fs.readdirSync(mediaDir);
let n = 0;
for (const f of files) {
  const m = /^(\d{4})\.([a-z0-9]+)$/i.exec(f);
  if (!m) continue;
  const id = m[1];
  const url = `./${subdir}/${f}`;
  const prev = data.items[id] && typeof data.items[id] === "object" ? data.items[id] : {};
  data.items[id] = {
    ...prev,
    type: "image",
    url,
    imageUrl: url,
    title: prev.title != null ? prev.title : "",
    text: prev.text != null ? prev.text : "",
  };
  if (prev.thumbnail != null) data.items[id].thumbnail = prev.thumbnail;
  n += 1;
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
console.log(`已写入 data.json：从 ${subdir}/ 登记 ${n} 条图片路径（其余条目保持不变）。`);
