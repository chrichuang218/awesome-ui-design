# TOOOLS.design 首页取证与本地改造

## 发布记录

2026-09-06：用户确认发布当前版本，明确授权提交、推送及部署。移除本地预览阶段的 noindex，使用现有 GitHub Pages 工作流。下文保留初始改造阶段的取证记录。最终普通资源卡片使用本地图标、仓库作者头像与名称字标；推荐路线采用顶部简介与三步卡片。

## 目标与边界

用户指定 https://www.toools.design/ 并调用 website-rebuild，目标是先取得真实设计参照，再重构现有 awesome-ui-design。沿用用户此前要求：不提交、不推送，仅本地 review。

本次范围为首页的设计语言与核心目录流程，不扩展为原站 Newsletter、Blog、Deals 及全部子页面的复制。现有 66 条资源、搜索、分类、分页、推荐路线、对比和复制行为继续使用原项目数据与逻辑。

交付分为本地首页参照镜像与现有项目的衍生改造。后者不声称与原站内容、字节或全站行为等价；未声明通过 website-rebuild 的 L2/L3 全站逆向验收。

## 实际使用的 skill 工具

- website-rebuild v0.3.22 的 fingerprint.mjs：两次首页请求字节一致，sha256 见 fingerprint-report.md。
- mirror-site.mjs 的本次工作副本：将页面队列限制为 `/`，资产引用闭包仍保持完整，单 worker 获取。
- verify-mirror.mjs：验证路径映射、账本、内容真实性、静态资产闭包。
- serve.mjs 的 Windows 工作副本：修正 path.normalize 将 URL 变为反斜杠导致 `/ext/` 识别失败的问题；不修改已安装 skill。
- 复用本机 Playwright/Chrome 执行原站和镜像截图、网络检查、桌面与移动端验证。原 skill 的 POSIX 浏览器生命周期脚本未在 Windows 上运行。

## 架构与规范来源

1. 首页为 Webflow 导出的确定性 HTML；主要视觉由 DOM/CSS 驱动。未发现将此首页主要视觉定义为 WebGL 场景的证据。
2. 浏览器实际计算字体：正文 Inter，英文标题 KMRMelangeGrotesk。项目正文采用本地 Inter 与中文系统字体，标题也使用此组合。
3. 悬浮工具图标由 keyvisualdockfloat-1.0.4.js 驱动，脚本原始字节复制到 src/dock.js。参数包括半径 R=120、放大上限 MAX=.25、纵向振幅 AY=7、横向振幅 AX=6。脚本已有 prefers-reduced-motion 启动检测。
4. 原站平台依赖包含 jQuery 3.5.1、Webflow chunks、Swiper 11。它们留在参照镜像；本项目已有 Vite 与原生 JavaScript，不为改造引入这些平台依赖。
5. source-readable.css 为源站 CSS 按右花括号换行得到的可检索副本。source-evidence.json 为 1440×1000 视口的实际计算样式、位置与素材 URL。

主要来源坐标（source-readable.css）：

- 377：颜色与字体变量；背景 #f3f4fd、正文 #0a0523、强调色 #006aff。
- 882：全局 6.25vw 边距、1920px 最大宽度。
- 搜索 `.nav_wrapper` / `.nav_item`：导航 60px 高度、24px 圆角、76px 图标按钮及阴影。
- 搜索 `.categories_grid` / `.categories_link`：六列、12px 列距、14px 行距、96px 高度、24px 圆角。
- 搜索 `.featured_item` / `.featured_img-container`：28px 圆角、20px 内边距、16:9 图片、23px 内部间距。
- 1140–1153：工具图标基本尺寸、十个素材与错落位置、hero_right-inner 容器。
- 各媒体查询：991px 隐藏工具图标与桌面导航，767px 压缩头部，479px 分类双列。

## 有意差异

| 原站 | 项目改造 | 原因 |
| --- | --- | --- |
| TOOOLS.design 品牌与英文介绍 | UI.design / 界面设计指南及中文介绍 | 保留用户项目身份 |
| 18 个分类、2200+ 资源 | 6 个真实分类、66 个已有资源 | 不编造分类或统计 |
| 分类跳往独立页面 | 分类筛选当前目录并滚动至结果 | 保留已有单页功能 |
| 原站广告及赞助推荐 | Mobbin、React Bits、Jitter | 使用本项目已有资源；不保留推广或佣金链接 |
| 原站商业英文字体 | Inter + 中文系统字体 | 中文支持；KMR 字体未复制入产品 |
| 原站表单、Newsletter、Blog、Deals | 搜索、比较、任务选择指南 | 接入本项目真实能力 |
| 资源图标 / 图片 | 推荐区使用真实来源图片；普通目录用文字标识或分类图标 | 现有数据无全量品牌素材，避免虚构截图 |
| 平台详情实现 | 原生 dialog、键盘焦点恢复、剪贴板备用流程 | 保留功能并支持键盘操作 |
| 首页统计及跟踪 | 不上报原站统计 | 本地用途；镜像服务中禁用已验证的 GTM 代理 |

## 素材记录

asset-sources.json 记录复制自镜像的背景、工具标识、Inter 字体与 Mobbin 图片 URL 和 SHA256。

- public/toools/react-bits-preview.jpg：2026-09-06 捕获 https://reactbits.dev/，页面标题 React Bits - Animated UI Components For React。
- public/toools/jitter-preview.jpg：2026-09-06 捕获 https://jitter.video/templates/，页面标题 Free motion graphics templates · Jitter。
- Mobbin 卡片使用原站收录的 Mobbin MCP 产品图片，详情与入口仍指向已有 Mobbin 条目。
- 普通目录中的纯文字封面为项目排版，非官方品牌标识。

素材版权仍归原作者。本次没有确认原站图片与脚本的公开再分发许可；依用户要求维持本地 review，并添加 noindex。若未来发布，需要替换或确认相应素材许可；此处为初始取证状态；后续发布决定见上方发布记录。

## 验证

- npm test：资源数据、搜索匹配、推荐路线。
- npm run build：Vite 生产构建。
- npm run test:browser：生产子路径、搜索/筛选、详情、复制与备用流程、对比上限与移除、分页、焦点恢复、减少动态效果、320/390/768/1440px 布局。
- 新增导航菜单与搜索入口、推荐图片加载和图片比例检查。

## 可回退性

改造前的未提交版本已另存到本任务 work/before-toools。初始改造阶段未提交或部署，后续状态见上方发布记录。源镜像位于本任务 work/toools-rebuild/mirror，与产品代码分开保存。
