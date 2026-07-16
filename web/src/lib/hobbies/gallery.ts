/**
 * 爱好图集 · 构建期扫描 public/hobbies/<slug>/ 自动生成分组图集（服务端专用）
 * ---------------------------------------------------------------
 * 组织约定（见 public/hobbies/README.md）：
 *  - 子文件夹 = 一个「项目」分组（title 取文件夹名，支持中文）
 *  - 根目录散图 = 汇总到「零散记录」组
 * 只在 Server Component（/hobbies/[slug] 是 SSG）里 import；用 node:fs，构建时读盘。
 * 文件名/文件夹名可含中文与特殊字符，逐段 encodeURIComponent 成安全 URL，无需重命名。
 */
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const HOBBIES_DIR = path.join(process.cwd(), "public", "hobbies");

export type HobbyGroup = { title: string; photos: string[] };

/** 逐段编码成 /hobbies/... 的安全 URL */
function webPath(...segments: string[]): string {
  return "/" + ["hobbies", ...segments].map(encodeURIComponent).join("/");
}

function listImages(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => !f.startsWith(".") && IMG_RE.test(f))
    .sort((a, b) => a.localeCompare(b, "zh"));
}

/** 扫描某爱好目录 → 分组图集；目录不存在或无图返回 [] */
export function getHobbyGallery(slug: string): HobbyGroup[] {
  const dir = path.join(HOBBIES_DIR, slug);
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  const groups: HobbyGroup[] = [];
  const loose: string[] = [];

  for (const name of entries.sort((a, b) => a.localeCompare(b, "zh"))) {
    if (name.startsWith(".")) continue; // .DS_Store / .gitkeep
    const full = path.join(dir, name);
    let isDir = false;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      continue;
    }
    if (isDir) {
      const photos = listImages(full).map((f) => webPath(slug, name, f));
      if (photos.length) groups.push({ title: name, photos });
    } else if (IMG_RE.test(name)) {
      loose.push(webPath(slug, name));
    }
  }

  if (loose.length) groups.push({ title: "零散记录", photos: loose });
  return groups;
}
