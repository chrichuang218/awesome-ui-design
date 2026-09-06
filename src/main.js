import { resources } from './resources.js';
import { categories, intents, getRoute, filterResources, makePrompt } from './catalog.js';

const $ = s => document.querySelector(s);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const anchor = (url, label, className='') => `<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>`;
const params = new URLSearchParams(location.search);
let intent = intents.some(i=>i.id===params.get('intent')) ? params.get('intent') : 'inspire';
let project = ['product','marketing','portfolio'].includes(params.get('project')) ? params.get('project') : 'product';
let category = Object.hasOwn(categories, params.get('category')) ? params.get('category') : 'all';
let page = 1;
let selected = [];
let notificationTimer;
$('#search').value = params.get('q') || '';
$('#project').value = project;

function syncUrl() {
  const url = new URL(location.href);
  for (const [key,value] of Object.entries({intent,project,category,q:$('#search').value})) {
    if(value) url.searchParams.set(key,value); else url.searchParams.delete(key);
  }
  history.replaceState(null,'',url);
}
function notify(message) {
  clearTimeout(notificationTimer); $('#notification').textContent = message; $('#notification').hidden = false;
  notificationTimer = setTimeout(()=>{$('#notification').hidden=true;},3500);
}
function renderGuide() {
  $('#intents').innerHTML = intents.map((item,i)=>`<button class="intent" data-intent="${item.id}" aria-pressed="${item.id===intent}"><span class="intent-top"><span>0${i+1}</span><span aria-hidden="true">↗</span></span><strong>${item.title}</strong><span class="intent-description">${item.description}</span><span class="intent-short">${item.short}</span></button>`).join('');
  const route = getRoute(intent,project);
  $('#route-title').textContent = route.title; $('#route-description').textContent = route.description;
  $('#route-items').innerHTML = route.ids.map((id,i)=>{
    const r = resources.find(item=>item.id===id);
    return `<article class="route-item"><span class="step-num">0${i+1}</span><div><span class="step-label">${route.steps[i]}</span><h4>${esc(r.name)}</h4><p>${esc(route.reasons[i])}</p><button class="text-button" data-detail="${id}">为什么选它 / 查看详情 →</button></div>${anchor(r.url,'打开','route-link')}</article>`;
  }).join('');
}
function renderLibrary() {
  $('#categories').innerHTML = Object.entries(categories).map(([key,label])=>`<button data-category="${key}" aria-pressed="${key===category}">${label}<span>${key==='all'?resources.length:resources.filter(r=>r.category===key).length}</span></button>`).join('');
  let list = filterResources($('#search').value,category);
  if($('#sort').value==='name') list = [...list].sort((a,b)=>a.name.localeCompare(b.name));
  const pages = Math.max(1,Math.ceil(list.length/12));page = Math.min(page,pages);
  $('#result-count').textContent = `找到 ${list.length} 个资源`;
  $('#resources').innerHTML = list.slice((page-1)*12,page*12).map(r=>`<article class="resource"><div class="resource-meta"><span>${categories[r.category]}</span><button data-compare="${r.id}" aria-pressed="${selected.includes(r.id)}" aria-label="${selected.includes(r.id)?'移除对比':'加入对比'} ${esc(r.name)}">${selected.includes(r.id)?'✓ 已选':'+ 对比'}</button></div><h3>${anchor(r.url,r.name)}</h3><p>${esc(r.description)}</p><div class="resource-footer"><span>${esc(new URL(r.url).hostname.replace(/^www\./,''))}</span><button class="text-button" data-detail="${r.id}">详情 →</button></div></article>`).join('');
  $('#empty').hidden = list.length!==0;
  $('.pagination').hidden = list.length===0;
  $('#page-count').textContent = `${page} / ${pages}`;
  $('#previous').disabled = page===1;$('#next').disabled=page===pages;
}
function detail(id) {
  const r = resources.find(r=>r.id===id);if(!r)return;
  $('#detail-body').innerHTML = `<span class="tag">${categories[r.category]}</span><h2>${esc(r.name)}</h2><p class="detail-description">${esc(r.description)}</p><h3>使用前了解</h3><p>${esc(r.note || (r.id==='r18'?'Reeoo 已被标记为停止维护，访问前请确认当前状态。': '此条目沿用 2026-08-31 资源整理。先确认原站当前功能、收费与内容授权，再用于你的项目。'))}</p><h3>官方 / 作者入口</h3><p>${anchor(r.url,r.name)} ${r.related.map(l=>anchor(l.url,l.label)).join(' · ')}</p><button class="copy-button" data-resource-copy="${r.id}">复制资源名称与链接</button>`;
  $('#detail').showModal();
}
function renderTray() {
  $('#compare-tray').hidden = selected.length===0;
  $('#compare-count').textContent = `已选 ${selected.length} / 3`;
  $('#compare-open').disabled=selected.length<2;
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text);notify('已复制，可以粘贴到你的 AI 对话中。'); }
  catch { $('#prompt-text').value=text;$('#prompt-fallback').showModal();$('#prompt-text').select(); }
}
document.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.dataset.intent){intent=target.dataset.intent;renderGuide();syncUrl();}
  if(target.dataset.category){category=target.dataset.category;page=1;renderLibrary();syncUrl();}
  if(target.dataset.detail)detail(target.dataset.detail);
  if(target.hasAttribute('data-close'))target.closest('dialog').close();
  if(target.dataset.resourceCopy){const r=resources.find(r=>r.id===target.dataset.resourceCopy);void copy(`${r.name}\n${r.url}\n${r.description}`);}
  if(target.dataset.compare){
    const id=target.dataset.compare;
    if(selected.includes(id))selected=selected.filter(item=>item!==id);
    else if(selected.length<3)selected.push(id);
    else {notify('最多对比 3 个资源，请先移除一个。');return;}
    renderLibrary();renderTray();
  }
});
$('#project').addEventListener('change',event=>{project=event.target.value;renderGuide();syncUrl();});
$('#search').addEventListener('input',()=>{page=1;renderLibrary();syncUrl();});
$('#sort').addEventListener('change',()=>{page=1;renderLibrary();});
$('#reset').addEventListener('click',()=>{$('#search').value='';category='all';page=1;renderLibrary();syncUrl();});
$('#copy-prompt').addEventListener('click',()=>void copy(makePrompt(intent,project)));
$('#previous').addEventListener('click',()=>{page--;renderLibrary();});
$('#next').addEventListener('click',()=>{page++;renderLibrary();});
$('#compare-clear').addEventListener('click',()=>{selected=[];renderTray();renderLibrary();});
$('#compare-open').addEventListener('click',()=>{
  $('#comparison-body').innerHTML=selected.map(id=>{
    const r=resources.find(r=>r.id===id);
    return `<article class="comparison-item"><span class="tag">${categories[r.category]}</span><h3>${esc(r.name)}</h3><h4>适合做什么</h4><p>${esc(r.description)}</p><h4>选择时注意</h4><p>${esc(r.note || '按页面目的选择；功能和价格请以原站为准。')}</p>${anchor(r.url,'查看资源','primary-link')}</article>`;
  }).join('');$('#comparison').showModal();
});
document.addEventListener('keydown',event=>{
  if(event.key==='/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.matches('input,textarea,select,[contenteditable="true"]') && !document.querySelector('dialog[open]')){event.preventDefault();$('#search').focus();}
});
renderGuide();renderLibrary();
