// Developer-only native UI acceptance, using isolated synthetic data and no providers.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {strict as assert} from 'node:assert';
import {root} from './prepare-browser.mjs';
const require=createRequire(import.meta.url);
const {_electron}=require('playwright-core');
const {createBrowserEnvironment}=require('../lib/browser-environment.cjs');
const {LocalWorkspace}=require('../lib/local-workspace.cjs');
const qa=mkdtempSync(join(tmpdir(),'answerpouch-qa-')),review=join(root,'.impeccable/review');mkdirSync(review,{recursive:true});
let app,page;const errors=[],external=[];
async function open(){
 app=await _electron.launch({executablePath:require('electron'),args:[join(root,'desktop/main.cjs')],env:{...createBrowserEnvironment(),ANSWERPOUCH_QA_DATA_DIR:qa},timeout:30000});
 assert.equal(await app.evaluate(({app})=>app.getPath('userData')),qa);
 page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
 await page.locator('[data-action="language"]').waitFor();
 await page.emulateMedia({reducedMotion:'reduce'});
}
async function capture(name,width=1180,height=880){
 await page.setViewportSize({width,height});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:join(review,name+'.png'),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal document overflow');
}
try{
 await open();assert.equal(await page.locator('[data-action="start"]').isDisabled(),true);
 await capture('desktop-empty-en');
 await page.locator('[data-action="language"]').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('[data-action="language"]').evaluate(el=>el===document.activeElement),true);
 await page.locator('#set-name').fill('合成测试 · 冻结问题');
 await page.locator('#questions').fill('合成测试：Original C++ & C# question?\n合成测试：第二个问题？');
 const questionFile=join(qa,'research.questions.json');
 await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},questionFile);
 await page.locator('[data-action="freeze"]').click();await page.locator('[data-action="import-last"]').waitFor();
 assert.equal(JSON.parse(readFileSync(questionFile,'utf8')).questions[0].text,'合成测试：Original C++ & C# question?');
 await page.locator('[data-action="import-last"]').click();await page.locator('.import-box.ready').waitFor();
 await page.locator('#source-gemini').check();await page.locator('#risk-ack').check();await page.locator('#location-ack').check();
 assert.equal(await page.locator('[data-action="start"]').isDisabled(),true,'Unconfirmed accounts must not start');
 assert.equal(await page.locator('select').count(),0,'No location selector before any runs');
 const accountCheck=page.locator('[data-action="check-login"][data-source="gemini"]');
 await accountCheck.focus();await page.keyboard.press('Enter');await page.getByText('暂未确认账号。',{exact:false}).waitFor();
 assert.equal(await accountCheck.evaluate(el=>el===document.activeElement),true,'Account check retains keyboard focus');
 await page.evaluate(()=>{window.__nextRender=new Promise(resolve=>{const observer=new MutationObserver(()=>{observer.disconnect();resolve(true);});observer.observe(document.getElementById('app'),{childList:true});});});
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.send('answerpouch:changed'));
 await page.evaluate(()=>window.__nextRender);
 assert.equal(await accountCheck.evaluate(el=>el===document.activeElement),true,'Background state refresh retains focus');
 await page.locator('[data-action="dismiss"]').click();
 await capture('desktop-imported-zh');await capture('desktop-compact-zh',860,700);
 await app.close();app=null;
 // Saved fixture evidence lets the real renderer exercise long answers and citations.
 const collector={available:()=>({available:true}),ready:()=>true,close:async()=>{},collect:async(t,_signal,stage)=>{stage('submitting');return {slotId:t.slotId,prompt:t.prompt,status:'observed',reason:'Synthetic QA record · 合成测试记录',restriction:'none',observedAt:new Date().toISOString(),answer:'Synthetic original answer · 合成原始回答。\n<script>window.__injected=true</script>\n'+('Long evidence remains readable. 原始证据保持可读。 '.repeat(50)),citations:[{title:'Synthetic source · 合成来源',url:'https://example.test/original-source?exact=a%26b',placement:'answer_link'}],model:'synthetic-fixture',account:'logged_in',session:'active',privacy:{mode:'signed_in_independent',temporaryChat:'not_applicable',personalization:'unknown',newConversation:true},exitCountry:null,geo:'unverified',locale:'en',timezone:'UTC',device:'desktop',geolocation:'denied',searchMode:'natural',collectionMode:'fixture',retrievalUsed:null,artifact:{mime:'text/plain',base64:Buffer.from('Synthetic exact original artifact').toString('base64')}};}};
 const service=new LocalWorkspace({root:join(qa,'workspace'),collector,wait:async()=>{}}),frozen=service.selected();
 const run=service.start({sources:['gemini'],frozenHash:frozen.hash,riskAcknowledged:true,locationAcknowledged:true});await service.active.promise;await service.close();
 await open();await page.locator('[data-action="evidence"]').first().focus();await page.keyboard.press('Enter');await page.locator('.evidence').waitFor();
 assert.equal(await page.locator('#evidence-title').evaluate(el=>el===document.activeElement),true,'Evidence title receives focus');
 await page.keyboard.press('Tab');assert.equal(await page.locator('[data-action="close-evidence"]').evaluate(el=>el===document.activeElement),true);
 await page.keyboard.press('Enter');assert.equal(await page.locator('[data-action="evidence"]').first().evaluate(el=>el===document.activeElement),true,'Evidence close returns focus to its origin');
 await page.keyboard.press('Enter');await page.locator('.evidence').waitFor();
 assert.equal(await page.evaluate(()=>window.__injected),undefined,'Original answer must render as text');
 assert.equal(await page.locator('.evidence pre').textContent(),service.evidence(service.state.tasks[0].id).capture.answer);
 await capture('desktop-evidence-zh');await capture('desktop-evidence-compact-zh',860,700);
 await page.locator('[data-action="language"]').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('[data-action="language"]').evaluate(el=>el===document.activeElement),true);await capture('desktop-evidence-en');
 const exportFile=join(qa,'export.json');await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},exportFile);
 await page.locator('[data-action="export"]').click();await page.getByText('Evidence file saved',{exact:false}).waitFor();
 const exported=JSON.parse(readFileSync(exportFile,'utf8'));assert.equal(exported.run.id,run.runId);assert.equal(exported.tasks.length,2);assert.equal(exported.tasks[0].evidence.capture.citations[0].url,'https://example.test/original-source?exact=a%26b');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 writeFileSync(join(root,'docs/desktop-ui-check-'+JSON.parse(readFileSync(join(root,'package.json'))).version+'.json'),JSON.stringify({passed:true,nativeElectron:true,syntheticData:true,externalRendererRequests:external.length,realProviderRequests:0,checks:['fresh empty workspace','freeze original ordered questions','native file save and import','own-account start guard','no location selector','risk acknowledgements','English and Chinese','1180 and 860 pixel widths','long evidence and exact citation display','HTML text escaping','native evidence export','normal close'],screenshots:['desktop-empty-en','desktop-imported-zh','desktop-compact-zh','desktop-evidence-zh','desktop-evidence-compact-zh','desktop-evidence-en'].map(n=>'.impeccable/review/'+n+'.png')},null,2)+'\n');
 console.log('Native desktop acceptance passed; no real provider request.');
}finally{if(app)await app.close();rmSync(qa,{recursive:true,force:true});}
