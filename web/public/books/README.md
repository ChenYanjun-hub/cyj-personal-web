# 书架封面图目录

第四幕「其他」下方的书架传送带（`web/src/components/sections/life.tsx` 里的 `BOOKS`）从这里读封面。

## 怎么放

1. 把扫描好的书封面图丢进本文件夹（本目录 = 网站根的 `/books/`）。
2. 格式：`.jpg` / `.png` / `.webp` 都行；竖版封面最佳（比例约 2:3）。
3. 文件名用英文 / 拼音 / 数字，别用空格，例如：
   - `ai-deeplearning.jpg`
   - `biz-zero-to-one.jpg`
   - `pm-inspired.jpg`
   - `phi-being-and-time.jpg`

## 放完告诉我

把「文件名 + 书名 + 分类（AI / 商业 / 产品 / 哲学）」发我，我来接进 `BOOKS` 数组：
每本填两个字段即可——`cover: "/books/你的文件名.jpg"` 和 `title: "书名"`，
占位色块会自动换成真封面，要加多少本都行（传送带会自动延长 + 无缝循环）。

> 没填 `cover` 的书显示分类色占位（标「封面整理中」），不影响页面运行。
