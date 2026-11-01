// Cross-version native acceptance with synthetic data; never uses owner profiles.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,readdirSync,lstatSync} from 'node:fs';
import {join,relative} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {strict as assert} from 'node:assert';
import {extractAll} from '@electron/asar';
import {root} from './prepare-browser.mjs';
const require=createRequire(import.meta.url),{_electron}=require('playwright-core');
const {createBrowserEnvironment}=require('../lib/browser-environment.cjs');
const version=JSON.parse(readFileSync(join(root,'package.json'))).version;
const legacy=join(root,'out/0.2.3/AnswerPouch-darwin-arm64/AnswerPouch.app');
const current=join(root,'out',version,'CiteSnap-darwin-arm64/CiteSnap.app');
const qa=mkdtempSync(join(tmpdir(),'citesnap-upgrade-qa-')),data=join(qa,'data'),oldSource=join(qa,'old-source');
extractAll(join(legacy,'Contents/Resources/app.asar'),oldSource);
const oldRequire=createRequire(join(oldSource,'lib/local-workspace.cjs'));
const {LocalWorkspace,freezeQuestions}=oldRequire('./local-workspace.cjs');
let app;
async function open(bundle,executable){app=await _electron.launch({executablePath:join(bundle,'Contents/MacOS',executable),args:['--user-data-dir='+data],env:createBrowserEnvironment(),timeout:30000});const page=await app.firstWindow();await page.locator('[data-action="language"]').waitFor();return page;}
function hashes(directory){const records={};function walk(p){for(const name of readdirSync(p)){const file=join(p,name);if(lstatSync(file).isDirectory())walk(file);else records[relative(directory,file)]=createHash('sha256').update(readFileSync(file)).digest('hex');}}walk(directory);return records;}
try{
 const collector={available:()=>({available:true}),ready:()=>true,close:async()=>{},collect:async(task,_signal,stage)=>{stage('submitting');return {slotId:task.slotId,prompt:task.prompt,status:'observed',reason:'Synthetic legacy upgrade fixture',restriction:'none',observedAt:new Date().toISOString(),answer:'Synthetic saved legacy answer. Preserve these exact bytes.',citations:[{url:'https://example.test/legacy-source',title:'Synthetic old citation',placement:'answer_link'}],model:'synthetic-fixture',account:'logged_in',session:'active',privacy:{mode:'signed_in_independent',temporaryChat:'not_applicable',personalization:'unknown',newConversation:true},exitCountry:null,geo:'unverified',locale:'en',timezone:'UTC',device:'desktop',geolocation:'denied',searchMode:'natural',collectionMode:'fixture',retrievalUsed:null,artifact:{mime:'text/plain',base64:Buffer.from('Synthetic original artifact').toString('base64')}};}};
 const service=new LocalWorkspace({root:join(data,'workspace'),collector,wait:async()=>{}}),frozen=freezeQuestions({name:'Synthetic legacy question set',text:'Synthetic saved question?'});
 await service.importQuestions(frozen);const run=service.start({sources:['gemini'],frozenHash:frozen.hash,riskAcknowledged:true,locationAcknowledged:true});await service.active.promise;const expected=service.exportRun(run.runId);await service.close();
 assert.equal(expected.tasks[0].evidence.collector.name,'AnswerPouch');assert.equal(expected.tasks[0].evidence.collector.version,'0.2.3');
 const profiles=join(data,'profiles/chrome-for-testing');mkdirSync(profiles,{recursive:true});const sentinel=join(profiles,'synthetic-retained-marker');writeFileSync(sentinel,'Synthetic profile fixture; not a provider login.');
 let page=await open(legacy,'AnswerPouch');assert.equal(await app.evaluate(({app})=>app.getName()),'AnswerPouch');await page.locator('[data-action="language"]').click();assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');await app.close();app=null;
 const before=hashes(join(data,'workspace')),marker=readFileSync(sentinel);
 page=await open(current,'CiteSnap');assert.equal(await app.evaluate(({app})=>app.getName()),'CiteSnap');assert.equal(await app.evaluate(({app})=>app.getPath('userData')),data);assert.equal(await app.evaluate(({app})=>app.getPath('sessionData')),data);assert.equal(await page.title(),'CiteSnap');assert.equal(await page.locator('.brand').innerText().then(x=>x.includes('CiteSnap')),true);assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
 const state=(await page.evaluate(()=>window.answerpouch.state())).value;assert.equal(state.selected.hash,frozen.hash);assert.equal(state.runs.length,1);assert.equal(state.tasks.length,1);assert.equal(state.active,false);
 await page.locator('[data-action="evidence"]').click();await page.locator('.evidence').waitFor();assert.equal(await page.locator('.evidence pre').textContent(),expected.tasks[0].evidence.capture.answer);assert.ok(await page.locator('.citations').textContent().then(x=>x.includes('https://example.test/legacy-source')));
 const exported=join(qa,'current-export.json');await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async(_window,options)=>{if(!options.defaultPath.startsWith('CiteSnap-'))throw Error('Old export filename');return {canceled:false,filePath:file};};},exported);
 await page.locator('[data-action="export"]').click();await page.getByText('证据文件已保存',{exact:false}).waitFor();assert.deepEqual(JSON.parse(readFileSync(exported,'utf8')),expected);
 const capture=join(root,'docs/qa',version);mkdirSync(capture,{recursive:true});await page.screenshot({path:join(capture,'legacy-evidence-upgrade-zh.png'),fullPage:true});
 await app.close();app=null;assert.deepEqual(hashes(join(data,'workspace')),before);assert.deepEqual(readFileSync(sentinel),marker);
 const receipt={passed:true,legacyVersion:'0.2.3',currentVersion:version,nativeDisplayName:'CiteSnap',sameDataAndSessionPath:true,languagePreserved:true,frozenQuestionHashPreserved:true,workspaceAndEvidenceBytesPreserved:true,legacyExportDeepEqual:true,newExportFilename:true,syntheticProfileMarkerPreserved:true,realLoginRestorationTested:false,noReplay:true,realProviderRequests:0,syntheticOnly:true};
 writeFileSync(join(root,'docs/rename-upgrade-check-'+version+'.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}finally{await app?.close();rmSync(qa,{recursive:true,force:true});}
