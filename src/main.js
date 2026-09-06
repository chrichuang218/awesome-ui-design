import { resources } from './resources.js';
import { categories, intents, projectTypes, usesProjectType, getRoute, filterResources, makePrompt } from './catalog.js';
import { icon } from './icons.js';
import { resourceIcons } from './resource-icons.js';
import { resourceIdentity } from './resource-identity.js';
import './dock.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const byId = new Map(resources.map(resource => [resource.id, resource]));
const pageSize = 12;
const params = new URLSearchParams(location.search);
const state = {
  intent: intents.some(item => item.id === params.get('intent')) ? params.get('intent') : 'inspire',
  project: projectTypes.some(item => item.id === params.get('project')) ? params.get('project') : 'product',
  category: Object.hasOwn(categories, params.get('category')) ? params.get('category') : 'all',
  query: params.get('q') || '',
  sort: 'curated',
  page: 1,
  selected: []
};
let notificationTimer;
const categoryTotals = Object.fromEntries(Object.keys(categories).map(key => [key, key === 'all' ? resources.length : resources.filter(resource => resource.category === key).length]));
const shortIntent = { inspire: '寻找灵感', create: '开始设计', improve: '改善界面', motion: '交互与动效' };
const asset = name => `${import.meta.env.BASE_URL}toools/${name}`;

function link(url, label, className = '') {
  return `<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>`;
}
function avatar(resource) {
  const { background, color, monogram } = resourceIdentity(resource);
  const visual = resourceIcons[resource.id];
  return `<span class="resource-avatar" style="--avatar-bg:${background};--avatar-ink:${color}" aria-hidden="true"><span class="resource-monogram">${esc(monogram)}</span>${visual ? `<img data-resource-icon src="${esc(import.meta.env.BASE_URL + visual.file)}" alt="" width="48" height="48" loading="lazy" decoding="async">` : ''}</span>`;
}
function syncUrl() {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries({ intent: state.intent, project: usesProjectType(state.intent) ? state.project : '', category: state.category, q: state.query })) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null, '', url);
}
function notify(message) {
  clearTimeout(notificationTimer);
  $('#notification').textContent = message;
  $('#notification').hidden = false;
  notificationTimer = setTimeout(() => { $('#notification').hidden = true; }, 3500);
}
function renderCategories() {
  $('#categories').innerHTML = Object.entries(categories).map(([key, label]) => `<button data-category="${key}" aria-pressed="${key === state.category}">${icon(key)}<span>${label}</span><span class="category-count">${categoryTotals[key]}</span></button>`).join('');
}
function renderFeatured() {
  const features = [
    { id: 'r8', label: '设计灵感', description: '从真实产品的界面与流程，找到下一版设计的参考。', image: 'mobbin-preview.webp', logo: 'dot-04.svg' },
    { id: 'r31', label: '素材组件', description: '浏览可以直接上手的 React 动效组件，把想法做出来。', image: 'react-bits-preview.jpg', mark: 'R' },
    { id: 'r28', label: '交互动效', description: '从现成模板开始，为界面与品牌制作清晰自然的动效。', image: 'jitter-preview.jpg', logo: 'dot-05.svg' }
  ];
  $('#featured-items').innerHTML = features.map(item => {
    const resource = byId.get(item.id);
    return `<article class="feature-card"><button class="feature-image" data-detail="${item.id}" aria-label="了解 ${esc(resource.name)}"><img src="${asset(item.image)}" alt="${esc(resource.name)} 资源预览" width="1280" height="800"><span class="feature-badge" aria-hidden="true">${item.logo ? `<img src="${asset(item.logo)}" alt="">` : item.mark}</span></button><div class="feature-copy"><h3>${link(resource.url, resource.name)}</h3><p>${item.description}</p></div><div class="feature-footer"><span>${item.label}</span><button class="text-button" data-detail="${item.id}">了解资源 ↗</button></div></article>`;
  }).join('');
}
function renderGuide() {
  // Keep the task controls mounted so keyboard focus survives a route change.
  for (const button of document.querySelectorAll('[data-intent]')) button.setAttribute('aria-pressed', String(button.dataset.intent === state.intent));
  const showProjectOptions = usesProjectType(state.intent);
  $('#project-options').hidden = !showProjectOptions;
  $('#project-question').textContent = state.intent === 'inspire' ? '你想参考哪类界面？' : '你想设计什么？';
  for (const button of document.querySelectorAll('[data-project]')) button.setAttribute('aria-pressed', String(button.dataset.project === state.project));
  const projectLabel = projectTypes.find(item => item.id === state.project).label;
  $('#route-context-label').textContent = showProjectOptions ? `${projectLabel} · 建议路线` : '建议路线';
  const route = getRoute(state.intent, state.project);
  $('#route-title').textContent = route.title;
  $('#route-description').textContent = route.description;
  $('#route-items').innerHTML = route.ids.map((id, index) => {
    const resource = byId.get(id);
    return `<article class="route-item"><div class="step-heading"><span class="step-num">0${index + 1}</span><span class="step-label">${route.steps[index]}</span></div><div class="route-resource">${avatar(resource)}<h4>${esc(resource.name)}</h4></div><p>${esc(route.reasons[index])}</p><div class="route-card-actions"><button class="text-button" data-detail="${id}" aria-label="查看 ${esc(resource.name)} 详情">查看详情</button><a class="route-link" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${esc(resource.name)}">打开资源 <span aria-hidden="true">↗</span></a></div></article>`;
  }).join('');
}
function renderLibrary() {
  let list = filterResources(state.query, state.category);
  if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  state.page = Math.min(state.page, pages);
  $('#category-title').textContent = categories[state.category];
  $('#result-count').textContent = `找到 ${list.length} 个资源`;
  $('#featured').hidden = state.category !== 'all' || Boolean(state.query.trim());
  $('#active-filter').hidden = state.category === 'all' && !state.query.trim();
  $('#filter-description').textContent = [state.category !== 'all' ? categories[state.category] : '', state.query.trim() ? `搜索“${state.query.trim()}”` : ''].filter(Boolean).join(' · ');
  $('#resources').innerHTML = list.slice((state.page - 1) * pageSize, state.page * pageSize).map(resource => {
    const selected = state.selected.includes(resource.id);
    const identity = resourceIdentity(resource);
    return `<article class="resource"><div class="resource-identity">${avatar(resource)}<div class="resource-title"><h3>${link(resource.url, resource.name)}</h3><span class="resource-origin" title="${esc(identity.origin)}">${esc(identity.origin)}</span></div></div><p>${esc(resource.description)}</p><div class="resource-meta"><span class="resource-category">${categories[resource.category]}</span></div><div class="resource-footer"><button class="text-button" data-detail="${resource.id}" aria-label="查看 ${esc(resource.name)} 详情">查看详情 ↗</button><button class="compare-button" data-compare="${resource.id}" aria-pressed="${selected}" aria-label="${selected ? '移除对比' : '加入对比'} ${esc(resource.name)}">${selected ? '✓ 已选' : '+ 对比'}</button></div></article>`;
  }).join('');
  $('#empty').hidden = list.length !== 0;
  $('.pagination').hidden = list.length === 0;
  $('#page-count').textContent = `${state.page} / ${pages}`;
  $('#previous').disabled = state.page === 1;
  $('#next').disabled = state.page === pages;
}
function resourceNote(resource) {
  return resource.note || (resource.id === 'r18' ? 'Reeoo 已被标记为停止维护，访问前请确认当前状态。' : '');
}
function showDetail(id) {
  const resource = byId.get(id);
  if (!resource) return;
  const note = resourceNote(resource);
  $('#detail-body').innerHTML = `<div class="detail-identity">${avatar(resource)}<div><span class="tag">${categories[resource.category]}</span><h2 id="detail-title">${esc(resource.name)}</h2></div></div><p class="detail-description">${esc(resource.description)}</p>${note ? `<section class="detail-section"><h3>使用前了解</h3><p>${esc(note)}</p></section>` : ''}<section class="detail-section"><h3>官方 / 作者入口</h3><div class="detail-links"><span class="detail-domain">${esc(new URL(resource.url).hostname.replace(/^www\./, ''))}</span>${resource.related.map(item => link(item.url, item.label)).join('')}</div></section><div class="detail-actions">${link(resource.url, '打开资源', 'primary-link')}<button class="copy-button" data-resource-copy="${id}">${icon('copy')}复制名称与链接</button></div>`;
  $('#detail').showModal();
}
function renderTray() {
  $('#compare-tray').hidden = state.selected.length === 0;
  $('#compare-count').textContent = `已选 ${state.selected.length} / 3`;
  $('#compare-open').disabled = state.selected.length < 2;
  $('#compare-open').title = state.selected.length < 2 ? '再选一个资源即可对比' : '';
  $('#compare-names').innerHTML = state.selected.map(id => `<button data-remove="${id}" aria-label="移除对比 ${esc(byId.get(id).name)}"><span>${esc(byId.get(id).name)}</span><span aria-hidden="true">×</span></button>`).join('');
}
async function copy(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    notify(message);
  } catch {
    $('#prompt-text').value = text;
    $('#prompt-fallback').showModal();
    $('#prompt-text').select();
  }
}
function resetFilters() {
  state.query = '';
  state.category = 'all';
  state.page = 1;
  $('#search').value = '';
  renderCategories();
  renderLibrary();
  syncUrl();
  $('#search').focus({ preventScroll: true });
}
function refreshSelection() {
  renderLibrary();
  renderTray();
}

// Broken assets reveal the existing monogram without another network request.
document.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement && event.target.hasAttribute('data-resource-icon')) event.target.remove();
}, true);
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const data = button.dataset;
  if (data.intent) {
    state.intent = data.intent;
    renderGuide();
    syncUrl();
  }
  if (data.project && projectTypes.some(item => item.id === data.project) && usesProjectType(state.intent)) {
    state.project = data.project;
    renderGuide();
    syncUrl();
  }
  if (data.category) {
    state.category = data.category;
    state.page = 1;
    for (const categoryButton of document.querySelectorAll('[data-category]')) categoryButton.setAttribute('aria-pressed', String(categoryButton.dataset.category === state.category));
    renderLibrary();
    syncUrl();
    $('#library').scrollIntoView({ block: 'start' });
  }
  if (data.detail) showDetail(data.detail);
  if (button.hasAttribute('data-close')) button.closest('dialog').close();
  if (data.resourceCopy) {
    const resource = byId.get(data.resourceCopy);
    void copy(`${resource.name}\n${resource.url}\n${resource.description}`, '已复制资源名称与链接。');
  }
  if (data.compare) {
    const id = data.compare;
    if (state.selected.includes(id)) state.selected = state.selected.filter(item => item !== id);
    else if (state.selected.length < 3) state.selected.push(id);
    else { notify('最多对比 3 个资源，请先移除一个。'); return; }
    refreshSelection();
    $(`#resources [data-compare="${id}"]`)?.focus({ preventScroll: true });
  }
  if (data.remove) {
    const index = state.selected.indexOf(data.remove);
    state.selected = state.selected.filter(id => id !== data.remove);
    refreshSelection();
    const next = state.selected[Math.min(index, state.selected.length - 1)];
    if (next) $(`[data-remove="${next}"]`).focus({ preventScroll: true });
    else $('#search').focus({ preventScroll: true });
  }
});
$('#search').addEventListener('input', event => { state.query = event.target.value; state.page = 1; renderLibrary(); syncUrl(); });
$('#sort').addEventListener('change', event => { state.sort = event.target.value; state.page = 1; renderLibrary(); });
$('#reset').addEventListener('click', resetFilters);
$('#clear-filter').addEventListener('click', resetFilters);
$('#copy-prompt').addEventListener('click', () => void copy(makePrompt(state.intent, state.project), '已复制使用提示，可以粘贴到 AI 对话中。'));
for (const [id, direction] of [['previous', -1], ['next', 1]]) {
  $(`#${id}`).addEventListener('click', () => {
    state.page += direction;
    renderLibrary();
    $('.library-heading').scrollIntoView({ block: 'start' });
    // The clicked paging control may become disabled on the first or last page.
    if ($(`#${id}`).disabled) $(`#${id === 'next' ? 'previous' : 'next'}`).focus({ preventScroll: true });
  });
}
$('#compare-clear').addEventListener('click', () => { state.selected = []; refreshSelection(); $('#search').focus({ preventScroll: true }); });
$('#compare-open').addEventListener('click', () => {
  $('#comparison-body').innerHTML = state.selected.map(id => {
    const resource = byId.get(id);
    const note = resourceNote(resource);
    return `<article class="comparison-item">${avatar(resource)}<h3>${esc(resource.name)}</h3><h4>适合做什么</h4><p>${esc(resource.description)}</p>${note ? `<h4>选择时注意</h4><p>${esc(note)}</p>` : ''}${link(resource.url, '查看资源', 'primary-link')}</article>`;
  }).join('');
  $('#comparison').showModal();
});
for (const dialog of document.querySelectorAll('dialog')) {
  let startedOutside = false;
  const outside = event => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener('pointerdown', event => { startedOutside = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => { if (startedOutside && event.target === dialog && outside(event)) dialog.close(); startedOutside = false; });
}
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.matches('input,textarea,select,[contenteditable="true"]') && !document.querySelector('dialog[open]')) {
    event.preventDefault();
    $('#search').focus();
  }
});
$('#search-open').addEventListener('click', () => {
  $('#library').scrollIntoView({ block: 'start' });
  $('#search').focus({ preventScroll: true });
});
for (const item of document.querySelectorAll('#site-menu a')) item.addEventListener('click', () => $('#site-menu').hidePopover());
// Highlight the section currently being read without intercepting anchor navigation.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      for (const item of document.querySelectorAll('.toolbar nav a')) item.classList.toggle('current', item.hash === `#${entry.target.id}`);
    }
  }, { rootMargin: '-100px 0px -50% 0px' });
  for (const section of document.querySelectorAll('#top, #featured, #library, #guide')) observer.observe(section);
}
$('#search').value = state.query;
$('#project-choices').innerHTML = projectTypes.map(item => `<button data-project="${item.id}" aria-pressed="${item.id === state.project}">${item.label}</button>`).join('');
$('#total-count').textContent = resources.length;
$('#intents').innerHTML = intents.map(item => `<button class="intent" data-intent="${item.id}" aria-pressed="${item.id === state.intent}" title="${esc(item.description)}">${icon(item.id)}<span>${shortIntent[item.id]}</span></button>`).join('');
$('[data-icon="copy"]').innerHTML = icon('copy');
renderCategories();
renderFeatured();
renderGuide();
renderLibrary();
renderTray();
if (params.has('project') && !usesProjectType(state.intent)) syncUrl();
