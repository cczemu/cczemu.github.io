---
title: 博客运行原理：从 Markdown 到页面
categories: 技术
date: 2026-10-19
author: AI 助手（Copilot SDK in VS Code）
---

这篇文章从一次页面访问开始，说明这个博客如何找到文章、读取 Markdown、生成首页卡片和标签列表，以及如何把新文章发布到站点。项目没有使用需要常驻运行的后端服务；页面、样式、脚本、文章和 JSON 索引都是静态文件，由 GitHub Pages 等静态主机直接提供。

## 一、项目结构

目前的文件按用途分开放置：

| 路径 | 职责 |
| --- | --- |
| `index.html` | 首页入口，提供导航、图片和文章列表容器 |
| `article/index.html` | 文章详情页入口 |
| `tags/index.html` | 分类标签页入口 |
| `css/site.css` | 整站使用的 Material Design 1 样式 |
| `js/pages/` | 首页、文章页和标签页各自的页面逻辑 |
| `js/shared/` | 页面共用的文章读取、Markdown 处理和导航逻辑 |
| `content/articles/` | Markdown 文章正文 |
| `data/articles.json` | 网站运行时读取的文章文件名清单 |
| `tools/generate-article-index.py` | 扫描文章目录并重建 JSON 清单 |
| `assets/images/` | 页面使用的图片资源 |

入口文件负责提供页面骨架，并引用需要的 CSS 和 JavaScript。具体内容由浏览器端脚本加载后填入对应容器。

## 二、文章正文和索引

一篇文章保存在 `content/articles/` 中的 `.md` 文件里。文件开头可以用 YAML Front Matter 记录标题、分类、日期等元数据，例如：

```yaml
---
title: 我的新文章
categories: 技术
date: 2026-10-19
---
```

Front Matter 和正文仍在同一文件中。这样标题、分类和日期跟文章一起维护，不必再为同一篇文章单独维护一份展示数据。没有填写某些字段时，页面逻辑会使用默认标题或分类。

浏览器不会自己遍历网站目录。静态托管服务只负责按文件路径返回内容，并没有提供目录查询 API。因此项目用 `data/articles.json` 记录文章文件名，作为页面可读取的文章清单。

新增或删除 Markdown 文件时，GitHub Actions 会在对应更改推送到 `main` 后自动运行索引生成器，并将有变化的 `data/articles.json` 提交回仓库。工作流配置位于 `.github/workflows/update-article-index.yml`，只会响应文章目录、生成器或工作流本身的更改。

如果希望在本地预览新文章，也可以在项目根目录手动运行：

```bash
python3 tools/generate-article-index.py
```

生成器只扫描 `content/articles/` 目录下的 `.md` 文件，将文件名排序并写入 `data/articles.json`。它不会在浏览器打开页面时运行；在本地手动运行适合预览，而线上索引由 GitHub Actions 自动更新。

工作流需要仓库允许 Actions 写回内容。在仓库的 **Settings → Actions → General → Workflow permissions** 中启用 **Read and write permissions**。工作流本身也将 `contents` 权限限定为 `write`，只在索引变化时提交 JSON 文件。

## 三、共用的数据读取流程

`js/shared/articles.js` 集中处理文章索引和文章文件请求：

1. 页面请求 `data/articles.json`，取得文章文件名数组。
2. 对数组中的每个文件名请求 `content/articles/<文件名>`。
3. `js/shared/markdown.js` 使用 Front Matter 解析器分离元数据与正文。
4. 调用页面专属逻辑，把解析结果呈现为卡片、标签或文章详情。

索引文件与 Markdown 正文分开请求，是为了让三个页面共用同一份文章清单和读取逻辑。`loadArticles()` 会并行请求清单中的文章；单篇读取失败会记录错误并跳过该篇，若没有任何文章成功加载，则页面会显示错误提示。

这些请求通过浏览器的 `fetch` 完成，所以本地预览时应使用 HTTP 静态服务器，而不是直接用 `file://` 打开 HTML 文件。浏览器对本地文件的模块导入和跨文件请求有限制。

## 四、三个页面各自做什么

### 首页

`js/pages/home.js` 加载文章清单和文章元数据，将每篇正文转换为纯文本，计算字数并截取摘要，然后创建文章卡片。标题与摘要链接指向文章详情页，分类链接指向对应的标签。

卡片间距由 `css/site.css` 中 `.article-list` 的网格布局统一控制。卡片本身使用 MD1 的边框、底色、阴影和间距样式。

### 文章详情页

文章链接包含文件名参数，例如：

```text
/article/?slug=blog-principles.md
```

详情页脚本从 URL 查询参数取得 `slug`，读取对应 Markdown 文件，再把标题、分类、字数、日期和正文写入页面。Markdown 正文先经过 `marked` 转换为 HTML，再交给 `DOMPurify` 清理后插入文档。

站外链接会在新标签页打开，并设置 `rel="noopener noreferrer"`，避免新页面通过 `window.opener` 操作来源页面。

### 标签页

`js/pages/tags.js` 复用相同的文章加载函数，读取每篇文章的分类，再按分类和文件名排序并分组。标签名称会成为页面内锚点；每个文章标题链接到对应详情页。

## 五、Markdown 转换与安全边界

Markdown 处理位于 `js/shared/markdown.js`：

- `gray-matter-browser` 解析 Front Matter 和正文。
- `marked` 将 Markdown 转成 HTML。
- `DOMPurify` 清理 HTML，降低插入文章内容时的 XSS 风险。
- `getPlainText()` 通过 DOM 解析 HTML 并提取文本，用于摘要和字数统计。

这些库通过 CDN 以 ES module 方式加载，因此浏览器需要能够访问 CDN。文章数据本身由站点静态文件提供；CDN 只提供解析和清理所需的 JavaScript 库。

清理 HTML 是重要的防护措施，但并不代表可以忽略内容来源。发布文章前仍应检查 Markdown 中的外部链接、嵌入内容和其他主动内容。

## 六、导航和样式

`js/shared/navigation.js` 只负责移动端菜单的展开状态，并通过 `aria-expanded` 同步按钮状态。页面结构与颜色、排版、响应式断点等外观规则分别由 HTML 和 `css/site.css` 负责。

当前站点只保留 Material Design 1 风格，没有运行时主题切换器。桌面与移动端共用同一套样式文件，移动端规则集中放在 CSS 媒体查询中。

## 七、发布一篇新文章

可以按下面的顺序发布文章：

1. 在 `content/articles/` 新建一个 `.md` 文件。
2. 写好 Front Matter 和 Markdown 正文。
3. 本地预览前可执行 `python3 tools/generate-article-index.py`，提前更新索引。
4. 将新文章推送到 `main`；GitHub Actions 会生成并提交更新后的索引。
5. 检查工作流运行成功，并确认 `data/articles.json` 出现新文件名。
6. 打开首页、文章详情页和标签页，确认标题、分类、日期和正文正常。

文章详情链接中的文件名需要与 `data/articles.json` 里的条目一致。URL 参数会进行编码，因此文件名包含空格时也能正常生成链接；为便于维护，仍建议使用简短、稳定且不重复的文件名。

## 八、当前方案的优点和限制

这种结构没有服务端数据库，也不需要为每次发布重新构建整站，便于直接托管和阅读源码。共享模块将文章加载与 Markdown 处理集中管理，页面文件则只保留各自的展示逻辑。

它也有明确限制：文章索引要在新增或删除文件后重新生成；首页和标签页会读取索引中的文章，文章数量增加时请求和渲染开销也会增加；解析库通过 CDN 加载，网络无法访问 CDN 时 Markdown 页面可能无法完成渲染。需要更大规模的搜索、分页、离线支持或更快首屏时，可以再考虑构建流程或缓存，但当前项目优先保持实现简单。

---

署名：AI 助手（Copilot SDK in VS Code）
