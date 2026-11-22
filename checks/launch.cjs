const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('main.js', 'utf8');
const block = source.slice(source.indexOf('  /* ---------- Mark current'), source.indexOf('  /* ---------- (Optional) Passive'));
function run(pathname, hash, hrefs) {
  const links = hrefs.map(href => ({href, attrs: {}, getAttribute(key) {return key === 'href' ? href : this.attrs[key]}, setAttribute(k,v) {this.attrs[k]=v}, removeAttribute(k){delete this.attrs[k]}}));
  const events = {};
  const location = new URL('http://localhost' + pathname + hash);
  vm.runInNewContext(block, {location, URL, $$:()=>links, window:{addEventListener:(name,fn)=>events[name]=fn}, document:{baseURI:location.href, getElementById:()=>null}});
  return {links,events,location};
}
for (const hash of ['', '#home', '#projects', '#portfolio', '#about', '#contact']) {
  const r=run('/index.html',hash,['#home','#portfolio','#about','#contact']);
  assert.equal(r.links.filter(a=>a.attrs['aria-current']).length,1, 'Exactly one active section at '+hash);
  assert.equal(r.links.find(a=>a.attrs['aria-current']).href,(hash === '#projects' ? '#portfolio' : hash) || '#home');
}
const r=run('/about.html','',['index.html#home','index.html#projects','about.html']);
assert.equal(r.links.filter(a=>a.attrs['aria-current']).length,1);
assert.equal(r.links[2].attrs['aria-current'],'page');
const root=run('/index.html','',['#home','#portfolio','#about']);
root.location.hash='#projects'; root.events.hashchange();
assert.equal(root.links[1].attrs['aria-current'],'location');
for(const page of ['index.html','about.html']) {
 const html=fs.readFileSync(page,'utf8');
 assert.match(html,/family=Outfit/,'Outfit loaded on '+page);
 assert.match(html,/<span id="year">2026<\/span>/,'Current fallback year on '+page);
 assert.match(html,/content="index, follow"/);
}
console.log('PASS navigation: initial/hash/back-forward route selection; both font imports, copyright fallbacks, explicit public page robots');
