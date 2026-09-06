import { resources } from './resources.js';
export const categories = { all: '全部资源', inspiration: '设计灵感', tools: '设计工具', assets: '素材组件', examples: '优秀案例', skills: 'Agent Skills' };
export const intents = [
  { id: 'inspire', title: '先找一点灵感', short: '还没想好风格', description: '看看真实页面、配色与交互，找到方向。' },
  { id: 'create', title: '开始设计界面', short: '从想法到第一版', description: '选好规范和 Skill，把想法做成原型。' },
  { id: 'improve', title: '让现有 UI 更好', short: '告别默认模板感', description: '理清层级、去掉噪声，再打磨细节。' },
  { id: 'motion', title: '补上交互与动效', short: '让反馈更自然', description: '找到值得动的地方，选合适的实现。' }
];
const routes = {
  inspire: { title: '先看真实产品，再确定视觉语言。', description: '每一步选一个参考就够了。先看结构，再看风格，最后记下可以复用的细节。', ids: ['r8','r1','r10'], steps: ['看产品流程','选视觉方向','学交互细节'], reasons: ['真实产品界面适合学习信息层级和完整流程。','从精选整站中选一个主参考，明确你喜欢的视觉特征。','把观察收敛到按钮、反馈和导航等可落地的细节。'] },
  create: { title: '明确设计约束，再做第一版。', description: '先确定页面类型与主要操作，再用一个生成型 Skill 实现，最后检查可用性。', ids: ['r54','r66','r62'], steps: ['建立设计规则','生成产品界面','检查可用性'], reasons: ['根据产品类型选择配色、字体和 UX 规则。','适合桌面工具与登录后的产品界面，关注导航与操作效率。','实现后检查键盘操作、排版、反馈和无障碍。'] },
  improve: { title: '先找问题，再精修。', description: '截图和真实页面是最好的上下文。先拆解问题，再有针对性地改善视觉和体验。', ids: ['r61','r57','r62'], steps: ['识别设计问题','调整并精修','检查交互边界'], reasons: ['通过 audit 检视常见套路，或 study 提取参考设计规则。','用 critique 判断层级，再用 polish 打磨间距与一致性。','检查修改后是否仍然可读、可操作，特别是键盘和小屏场景。'] },
  motion: { title: '从需要反馈的地方开始。', description: '优先让用户知道发生了什么。普通状态变化用 CSS；复杂编排再使用专项工具。', ids: ['r9','r63','r31'], steps: ['观察真实动效','判断并设计动效','选择实现组件'], reasons: ['观察产品中短促、克制的动画如何传递状态。','先用 find-animation-opportunities 判断价值，再决定实现。','React 项目可参考现成组件；其他栈借鉴效果，不直接搬代码。'] }
};
export function getRoute(intent, project) {
  const base = routes[intent] || routes.inspire;
  const route = { ...base, ids: [...base.ids], reasons: [...base.reasons], steps: [...base.steps] };
  if (intent === 'create' && project !== 'product') {
    route.ids[1] = 'r53'; route.steps[1] = '生成页面原型'; route.reasons[1] = '带上真实内容和参考，让 frontend-design 建立明确的视觉方向。';
  }
  if (intent === 'inspire' && project !== 'product') {
    route.ids[0] = project === 'marketing' ? 'r3' : 'r4'; route.steps[0] = '观察页面结构'; route.reasons[0] = '选择与你的页面目的接近的案例，观察内容顺序和主操作。';
  }
  return route;
}
export function filterResources(query, category) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return resources.filter(r => (category === 'all' || r.category === category) && terms.every(term => `${r.name} ${r.description} ${r.note} ${categories[r.category]}`.toLocaleLowerCase().includes(term)));
}
export function makePrompt(intent, project) {
  const route = getRoute(intent, project);
  const projectName = {product:'产品 / 桌面工具',marketing:'品牌 / 落地页',portfolio:'博客 / 作品集'}[project];
  return `我想${intents.find(i=>i.id===intent).title}，项目类型是${projectName}。\n\n请先读取我提供的真实项目、内容和截图，明确页面用户、主要操作与技术栈。\n建议路线：\n${route.ids.map((id,i)=>{const r=resources.find(r=>r.id===id);return `${i+1}. ${route.steps[i]}：${r.name}\n   ${r.url}\n   ${route.reasons[i]}`;}).join('\n')}\n\n先说明配色、字号、间距和布局规则，再实现。已有设计系统优先继承；资源不适合当前技术栈时请说明原因。仅在需要时使用对应 Skill，先确认是否可用。完成后在真实浏览器检查主流程、小屏布局和键盘操作。`;
}
