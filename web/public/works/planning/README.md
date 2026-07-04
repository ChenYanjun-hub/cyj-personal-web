# 规划项目成果素材目录

`/works/planning` 页面（`web/src/components/works/planning-works.tsx` 的 `PLANNING_WORKS`）从这里读每个项目的成果图。

## 文件夹 ↔ 项目对照

| 文件夹 | 项目 |
|---|---|
| `xinyang-liulin/` | 信阳柳林矿坑文旅项目 |
| `changfeng-auto/` | 长丰汽车城战略规划项目 |
| `changfeng-fusion/` | 长丰核聚变城设计项目 |
| `xinyang-youth/` | 信阳青年营地设计项目 |
| `nanan-rural/` | 南安市乡村振兴项目 |
| `hami-spatial/` | 哈密市国土空间规划评估工作 |
| `xuhui-block/` | 徐汇美丽街区建设项目 |
| `lianxin-gate/` | 连心门改造项目 |

## 怎么放

1. 把每个项目的成果图（效果图 / 总平面 / 分析图 / 鸟瞰等）丢进对应文件夹。
2. 格式：`.jpg` / `.png` / `.webp` 都行；横版为主（页面视觉区当前 4:3）。
3. 命名建议带序号控制展示顺序，例如：
   - `01-birdview.jpg`（鸟瞰）
   - `02-masterplan.jpg`（总平面）
   - `03-analysis.jpg`（分析图）
   - 中文名也行，但别用空格。

## 放完告诉我

告诉我哪些文件夹放好了，我来接进 `PLANNING_WORKS` 的 `gallery` 字段。
图集约定：**连号命名 `01.jpg`、`02.jpg`…，`01` 为项目封面**（页面落到该项目时先显示它），
页面提供左右翻页按钮 + 键盘左右键 + 计数器。
提交前请压缩到 1920px 宽左右（原图 5120px 太重，会拖慢加载、膨胀仓库——柳林那批已由 Claude 压缩处理）。
没放图的项目继续显示渐变占位（标「效果图 · 整理中」），不影响页面运行。
