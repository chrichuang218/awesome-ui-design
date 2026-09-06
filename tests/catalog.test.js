import test from 'node:test';
import assert from 'node:assert/strict';
import { resources } from '../src/resources.js';
import { categories, filterResources, getRoute, makePrompt, intents, usesProjectType } from '../src/catalog.js';
test('目录 ID 唯一、分类有效，且来源可追溯',()=>{
  assert.ok(resources.length > 0);
  assert.equal(new Set(resources.map(r=>r.id)).size,resources.length);
  for(const r of resources){assert.ok(categories[r.category]);assert.ok(r.name && r.description);assert.match(r.url,/^https?:\/\//);assert.ok(r.sources.length);for(const s of r.sources)assert.equal(new URL(s.url).hostname,'linux.do');}
});

test('可见的项目选择会改变路线，隐藏的选择不影响提示词',()=>{
  for(const intent of ['inspire','create']) {
    assert.equal(usesProjectType(intent),true);
    const routes=['product','marketing','portfolio'].map(project=>getRoute(intent,project));
    assert.equal(new Set(routes.map(route=>route.ids.join(','))).size,3);
    assert.equal(new Set(routes.map(route=>route.title)).size,3);
    assert.match(makePrompt(intent,'marketing'),/品牌 \/ 落地页/);
    assert.match(makePrompt(intent,'portfolio'),/博客 \/ 作品集/);
  }
  for(const intent of ['improve','motion']) {
    assert.equal(usesProjectType(intent),false);
    assert.equal(makePrompt(intent,'marketing'),makePrompt(intent,'product'));
    assert.equal(makePrompt(intent,'portfolio'),makePrompt(intent,'product'));
    assert.doesNotMatch(makePrompt(intent,'portfolio'),/项目类型是/);
  }
  assert.deepEqual(getRoute('create','invalid'),getRoute('create','product'));
});
test('搜索支持多个条件、分类、大小写与空结果',()=>{
  assert.ok(filterResources('react','assets').some(r=>r.name==='React Bits'));
  assert.deepEqual(filterResources('REACT','assets'),filterResources('react','assets'));
  assert.ok(filterResources('配色 字体','skills').some(r=>r.id==='r54'));
  assert.equal(filterResources('zzzzzzzzzz','all').length,0);
});
test('推荐按照任务和项目类型变化，所有推荐指向已收录资源',()=>{
  for(const i of intents)for(const project of ['product','marketing','portfolio']){
    const route=getRoute(i.id,project);assert.equal(route.ids.length,3);
    route.ids.forEach(id=>assert.ok(resources.find(r=>r.id===id)));
    assert.ok(makePrompt(i.id,project).includes(route.steps[0]));
  }
  assert.ok(getRoute('create','product').ids.includes('r66'));
  assert.ok(getRoute('create','marketing').ids.includes('r53'));
});
