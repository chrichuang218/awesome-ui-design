# fingerprint report — https://www.toools.design/

- 探测时间：2026-09-06T15:16:53.171Z
- UA：协议钉死串（Chrome/126 桌面）；请求间隔 ≥1s；单会话
- ⛔ 本报告只提供证据与"信号提示"。判级按 references/scope-and-fingerprint.md §3 判定树人工执行；
  全部计数为出现次数（非行数），且未做 vendor 归属剔除——进评级表前先过 §2《计数硬约束》。

## 步骤 1：存活性（GET，路径粒度）
- code=200 final=https://www.toools.design/ redirects=0 time=1263ms bytes=196789

## 步骤 2：双抓 diff（间隔 5000ms）
- BYTE-IDENTICAL（理想镜像对象；apple/noomo 型）

## 步骤 3：物种/年代校验（防"HTTP 200 的尸体"）
- generator meta：无
- wp-content 出现次数：0
- 版权/年份字串（前 8 条）：
  - © 2019
- 商店主题替身 grep（shopify|Prestige|Dawn|elementor，忽略大小写）：0
- Shopify 平台指纹：cdn/shop/=0  Shopify.theme=0  cdn.shopify.com=0  myshopify.com=0（命中 → B 类路由候选，见 references/shopify-platform.md）
- Sanity CMS 指纹：无
- 人工核对项：技术栈年代 vs 获奖年份是否矛盾；generator/license 年份晚于获奖期 + 获奖期技术栈残留为零 → 隐性下线判 X（§2 步骤 3）。

## 步骤 4：技术指纹（HTML 层，已剥注释；计数=出现次数）
- <script src> 枚举（7 条）：
  - /g0lnomhfn3mgNWNlMTBhNGMwYjVmMGIwNWY1MjJlNzQ2/fJ9IXkRrNq4kRpEZY4ZDkEf_c2cryw
  - https://www.googletagmanager.com/gtag/js?id=G-YP56TCC7X4
  - https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=5ce10a4c0b5f0b05f522e746
  - https://cdn.prod.website-files.com/5ce10a4c0b5f0b05f522e746/js/webflow.schunk.36b8fb49256177c8.js
  - https://cdn.prod.website-files.com/5ce10a4c0b5f0b05f522e746/js/webflow.6d2fe01d.ac725a0dc04d47fa.js
  - https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js
  - https://cdn.prod.website-files.com/5ce10a4c0b5f0b05f522e746%2F689e5ba67671442434f3ca35%2F6a2baa8b57dfbbc434e64e5d%2Fkeyvisualdockfloat-1.0.4.js
- 内联动态 import()（0 条；现代站可能没有任何 <script src>）：
- 维度① 框架模式标记（单独命中一律不判级，见 §3/§4 二维表）：
  - self.__next_f（Next RSC flight）        = 0
  - __reactRouterContext（RR framework 模式）= 0
  - __NUXT__（Nuxt）                         = 0
  - data-v-xxxxxxxx（Vue scoped 密度）       = 0
  - <!--[-->（Vue3 SSR fragment 注释，剥注释前计数）= 0
- 维度② 引擎范式标记：
  - theatre|@react-three（声明式引擎 → C 信号）= 0

## 步骤 5：bundle 可逆向性初检
- 未传 --bundle。从上面 <script src>/import() 清单里挑主 bundle 后复跑：
  node fingerprint.mjs --target "https://www.toools.design/" --bundle <bundle-url> --out probe
## 下载物账本（sha256）
- a.html  196789B  sha256=064b3d438897248cc809752005831ebd6bb68c3b130cb851de50b3253b2da328
- b.html  196789B  sha256=064b3d438897248cc809752005831ebd6bb68c3b130cb851de50b3253b2da328

## 下一步
1. 按 references/scope-and-fingerprint.md §3 判定树逐条走（命中即停），落判级写 probe/verdict.md；
2. 框架标记命中时必答 §4 三判据（框架模式 × 引擎范式二维表）；
3. 判级 A/B → 立即进 M0 镜像（历年获奖站消失率约 29%，镜像是抢救行为）。
