# UI Design Guide · 界面设计指南

从“我要做什么”出发的前端 UI 资源门户。面向设计新手与开发者，帮助选择灵感网站、工具、素材、案例和 Agent Skills。

**[立即打开界面设计指南 →](https://chrichuang218.github.io/awesome-ui-design/)**

A curated guide to UI design resources and AI skills. Find the right inspiration, tools, and workflow for your next interface.

[![界面设计指南首页](docs/home-preview.png)](https://chrichuang218.github.io/awesome-ui-design/)

## 本地使用

需要 Node.js 20.19+ 或 22.12+。

```sh
npm install
npm run dev
```

打开终端显示的本地网址。`npm run build` 构建到 `dist/`，`npm run preview` 预览构建结果。

## 功能

- 四种任务引导：找灵感、开始设计、改善现有 UI、交互动效。
- 按产品/桌面工具、品牌/落地页、博客/作品集调整推荐路线。
- 设计网站与 Skill / 套件的搜索、分类、排序、分页；数量由资源数据自动计算。
- 资源详情、官方入口、使用限制，最多三项同时对比。
- 生成可复制的 AI 使用提示；复制权限不足时提供手动复制。
- 搜索与推荐条件记录在 URL，便于分享与刷新；无账号、无后台。
- 首页采用编辑式指南风格。

## 数据维护

- `src/resources.js` 是目录数据；每项包括稳定 id、名称、类型、描述、URL、来源与注意事项。
- `src/catalog.js` 是编辑推荐路线与搜索逻辑。
- `docs/resource-research.md` 保存历史整理供维护使用；页面不展示社区出处，构建产物不包含该文档。
- 本轮沿用 2026-08-31 的资料整理，未重新访问并核验全部外站。请以官方最新说明为准。条目不代表排名或质量保证。
- 网站和 Skill 是不同记录，即使属于同一产品也分别呈现。条目数量不等于不同产品的数量。
- 添加资源时保留第一方链接和 Linux.do 来源；不要编造安装量、评分、价格或实测体验。

## 验证

```sh
npm test
npm run build
npm run test:browser
```

浏览器测试自动启动生产预览，优先使用本机 Chrome；未安装 Chrome 时可执行 `npx playwright install chromium` 并设 `PW_BROWSER=chromium` 后运行。覆盖搜索、筛选、推荐、对比、弹窗、复制与移动端布局。截图写入 `test-results/`。

## GitHub 首页与发布

仓库：[chrichuang218/awesome-ui-design](https://github.com/chrichuang218/awesome-ui-design)

在线指南：[chrichuang218.github.io/awesome-ui-design](https://chrichuang218.github.io/awesome-ui-design/)

GitHub 仓库主页展示本 README，点击上方入口或截图即可打开交互指南。网页通过 GitHub Pages 托管，无需额外服务器。

维护者更新代码并推送后，在 Actions 中手动运行 `Deploy Pages` 工作流，测试与构建通过后部署 `dist/`。Pages 的 Source 使用 GitHub Actions。本项目使用相对资源路径，支持仓库子路径。

## 授权与来源

本站代码采用 MIT License。资源链接及描述用于索引，第三方网站、商标、素材与 Skill 的许可由各自作者决定。完整来源见 `docs/resource-research.md`。

## 致谢

感谢 [LINUX DO](https://linux.do/) 社区的支持与讨论。
