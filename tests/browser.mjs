import { chromium } from 'playwright';
import { resources } from '../src/resources.js';
const totalPages = Math.ceil(resources.length / 12);
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

// Exercise the production build under a repository subpath, as GitHub Pages will serve it.
const root=resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(!pathname.startsWith('/awesome-ui-design/')){res.writeHead(404).end();return;}
  const relative=decodeURIComponent(pathname.slice('/awesome-ui-design/'.length))||'index.html';
  const file=resolve(root,relative);
  if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  try{const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'}).end(body);}
  catch{res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin=`http://127.0.0.1:${server.address().port}`;
const base=`${origin}/awesome-ui-design/`;
let browser;
try{
  browser=await chromium.launch({channel:process.env.PW_BROWSER==='chromium'?undefined:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1040},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base);await page.locator('.resource').first().waitFor();
  assert.equal(await page.locator('.resource').count(),12);
  assert.equal(await page.locator('a[href*="directions.html"], a[href*="resource-research.md"], a[href="#about"]').count(),0);
  assert.equal(await page.locator('#result-count').textContent(),`找到 ${resources.length} 个资源`);
  await mkdir('test-results',{recursive:true});
  await page.screenshot({path:'test-results/home-overview.png'});
  await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
  await page.locator('[data-intent="create"]').click();
  assert.match(await page.locator('#route-items').textContent(),/app-shell-ui/);
  await page.locator('#project').selectOption('marketing');
  assert.match(await page.locator('#route-items').textContent(),/frontend-design/);
  await page.locator('#copy-prompt').click();
  const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.match(copied,/品牌 \/ 落地页/);
  await page.reload();assert.equal(await page.locator('#project').inputValue(),'marketing');
  assert.equal(await page.locator('[data-intent="create"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-category="skills"]').click();
  assert.equal(await page.locator('#result-count').textContent(),`找到 ${resources.filter(r=>r.category==='skills').length} 个资源`);
  await page.locator('#search').fill('claude-design');assert.equal(await page.locator('.resource').count(),1);
  await page.locator('#resources [data-detail]').click();assert.equal(await page.locator('#detail').evaluate(e=>e.open),true);
  assert.equal(await page.locator('#detail a[href="https://github.com/jiji262/claude-design-skill"]').count(),1);
  assert.equal(await page.locator('#detail .source-list').count(),0);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#detail').evaluate(e=>e.open),false);
  await page.locator('#search').fill('zzzzzzzzzz');assert.equal(await page.locator('#empty').isVisible(),true);
  await page.locator('#reset').click();assert.equal(await page.locator('#result-count').textContent(),`找到 ${resources.length} 个资源`);
  await page.locator('#resources [data-compare="r1"]').click();
  await page.locator('#resources [data-compare="r2"]').click();
  await page.locator('#resources [data-compare="r3"]').click();
  await page.locator('#resources [data-compare="r4"]').click();assert.match(await page.locator('#notification').textContent(),/最多对比 3/);
  await page.locator('#compare-open').click();assert.equal(await page.locator('.comparison-item').count(),3);
  await page.keyboard.press('Escape');await page.locator('#compare-clear').click();
  assert.equal(await page.locator('#compare-tray').isVisible(),false);
  await page.locator('#next').click();assert.equal(await page.locator('#page-count').textContent(),`2 / ${totalPages}`);
  await page.locator('#sort').selectOption('name');assert.equal(await page.locator('#page-count').textContent(),`1 / ${totalPages}`);
  await page.locator('#sort').blur();await page.keyboard.press('/');assert.equal(await page.locator('#search').evaluate(e=>e===document.activeElement),true);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}}));
  await page.locator('#copy-prompt').click();assert.equal(await page.locator('#prompt-fallback').evaluate(e=>e.open),true);
  assert.match(await page.locator('#prompt-text').inputValue(),/建议路线/);await page.keyboard.press('Escape');
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:900});await page.goto(base);await page.locator('.resource').first().waitFor();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,`overflow ${width}`);
    if(width===390){
      await page.locator('[data-intent="motion"]').click();assert.match(await page.locator('#route-title').textContent(),/反馈/);
      await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
    }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: production subpath, data-driven counts, guided recommendations, clipboard + fallback, filters, details, compare limit, paging, keyboard, 390/768/1440 layouts. Console clean.');
}finally{if(browser)await browser.close();await new Promise(done=>server.close(done));}
