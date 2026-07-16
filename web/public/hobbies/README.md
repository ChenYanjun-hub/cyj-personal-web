# 爱好照片存放说明（第四幕「其他 / Other」）

每个爱好一个文件夹，把该爱好的照片丢进对应文件夹即可。文件夹名 = 爱好 slug，和爱好数据（`web/src/components/hobbies/hobbies-data.ts`）一一对应。

## 文件夹对照

| 爱好 | 文件夹 | 卡牌封面（勿删） |
| --- | --- | --- |
| Vibe Coding | `vibe-coding/` | `vibe-coding.png` |
| 3D 打印 | `3d-printing/` | `3d-printing.png` |
| 摄影 | `photography/` | `photography.png` |
| 游戏 | `gaming/` | `gaming.png` |
| AIGC 创作 | `aigc/` | `aigc.png` |
| 绘画 | `painting/` | `painting.png` |
| 骑行 | `cycling/` | `cycling.png` |
| 轮滑 | `skating/` | `skating.png` |

> 根目录下的 `<slug>.png` 是扇形卡牌用的封面图，**不要删**；各爱好的多张照片放进对应的**同名文件夹**里。

## 命名规范

- 同一爱好内用**有序两位数**命名：`01.jpg`、`02.jpg`、`03.jpg`……
  - 图集按文件名排序展示，`01` 会作为该爱好的首图。
- 格式：`.jpg` / `.png` / `.webp` 均可（照片优先 jpg/webp，体积更小）。
- 大小：**单张压到 2MB 以内**（站点自托管在阿里云、带宽有限，详情页加载更快）。
- 文件名用**纯 ASCII**（数字/英文），别用中文或空格，避免 URL 编码问题。

## 示例

```
web/public/hobbies/
├── photography/
│   ├── 01.jpg
│   ├── 02.jpg
│   └── 03.jpg
├── cycling/
│   ├── 01.jpg
│   └── 02.jpg
└── ...
```

## 放好之后

告诉我照片已就位，我会：
1. 给 `hobbies-data.ts` 加图集字段（每个爱好的照片列表）；
2. 在 `/hobbies/<slug>` 详情页做图集展示（可复用规划作品集那套图集切换交互）。

（`.gitkeep` 是空文件夹占位，你放了照片后可删可留，不影响。）
