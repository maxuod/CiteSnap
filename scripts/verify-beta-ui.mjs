// Isolated packaged-app fixture checks. No user profiles or real provider requests.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {strict as assert} from 'node:assert';
import {createHash} from 'node:crypto';
import {root} from './prepare-browser.mjs';
import {copyPortableTree} from './package-files.mjs';
const require=createRequire(import.meta.url),{_electron}=require('playwright-core');
const {createBrowserEnvironment}=require('../lib/browser-environment.cjs');
const {SPEC}=require('../lib/browser-runtime.cjs');
const version=JSON.parse(readFileSync(join(root,'package.json'))).version;
const executablePath=join(root,'out',version,'CiteSnap-darwin-arm64/CiteSnap.app/Contents/MacOS/CiteSnap');
const qa=mkdtempSync(join(tmpdir(),'answerpouch-beta-ui-')),data=join(qa,'user-data');
const images=join(root,'docs/qa',version);mkdirSync(images,{recursive:true});
let app;
async function open(){app=await _electron.launch({executablePath,args:['--user-data-dir='+data],env:createBrowserEnvironment(),timeout:30000});const page=await app.firstWindow();await page.locator('[data-action="language"]').waitFor();return page;}
try{
 let page=await open();let state=(await page.evaluate(()=>window.answerpouch.state())).value;
 assert.equal(state.available.available,false);assert.equal(state.browserSetup.preparing,false);assert.equal(state.selected,null);assert.deepEqual(state.runs,[]);
 await page.locator('[data-action="prepare-browser"]').waitFor();
 await page.screenshot({path:join(images,'first-use-en.png'),fullPage:true});
 await page.locator('[data-action="language"]').click();await page.setViewportSize({width:860,height:700});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:join(images,'first-use-zh.png'),fullPage:true});
 // Refuse the download deterministically; no network is contacted by this fixture.
 await app.evaluate(()=>{
  global.__fixtureDownloads=0;
  process.getBuiltinModule('node:https').get=(url)=>{if(!String(url).startsWith('https://storage.googleapis.com/chrome-for-testing-public/'))throw Error('Unexpected host');global.__fixtureDownloads++;const req=new (process.getBuiltinModule('node:events').EventEmitter)();req.destroy=()=>{};queueMicrotask(()=>req.emit('error',Error('Synthetic offline fixture')));return req;};
 });
 await page.locator('[data-action="prepare-browser"]').click();await page.getByText('浏览器准备未完成',{exact:false}).waitFor();
 assert.equal(await app.evaluate(()=>global.__fixtureDownloads),1);
 assert.equal(await page.locator('[data-action="prepare-browser"]').isDisabled(),false);
 state=(await page.evaluate(()=>window.answerpouch.state())).value;assert.equal(state.browserSetup.preparing,false);assert.deepEqual(state.tasks,[]);assert.deepEqual(state.runs,[]);
 await page.locator('#set-name').fill('Synthetic beta question set');await page.locator('#questions').fill('Synthetic beta question?');
 await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},join(qa,'synthetic.questions.json'));
 await page.locator('[data-action="freeze"]').click();await page.locator('[data-action="import-last"]').waitFor();await page.locator('[data-action="import-last"]').click();await page.locator('.import-box.ready').waitFor();
 await app.close();app=null;
 // Reuse only the separately downloaded official test runtime, never user data.
 const source=join(root,'.private/official-runtime-acceptance','chrome-'+SPEC.version),destination=join(data,'runtime','chrome-'+SPEC.version);
 mkdirSync(join(data,'runtime'),{recursive:true});copyPortableTree(source,destination);
 const workspace=join(data,'workspace/workspace.json');
 const hash=()=>createHash('sha256').update(readFileSync(workspace)).digest('hex');const before=hash();
 page=await open();state=(await page.evaluate(()=>window.answerpouch.state())).value;
 assert.equal(state.browserSetup.ready,true);assert.equal(state.available.available,true);assert.equal(await page.locator('[data-action="prepare-browser"]').count(),0);assert.deepEqual(state.runs,[]);assert.deepEqual(state.tasks,[]);
 await app.close();app=null;assert.equal(hash(),before);
 const result={passed:true,packagedNativeUi:true,isolatedData:true,freshDownloadActionVisible:true,englishAndChinese:true,narrowWidth:860,noHorizontalOverflow:true,explicitDownloadFailureHandled:true,automaticRetries:0,existingOfficialRuntimeRecognized:true,workspaceBytesPreserved:true,realProviderRequests:0,cleanMachineAcceptance:false};
 writeFileSync(join(root,'docs/beta-ui-check-'+version+'.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await app?.close();rmSync(qa,{recursive:true,force:true});}
