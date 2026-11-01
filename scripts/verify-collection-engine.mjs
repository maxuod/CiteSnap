// Real bundled Chromium + packaged collector, against intercepted synthetic pages only.
// No provider request, user account, personal profile or native UI interaction.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {runInNewContext} from 'node:vm';
import {strict as assert} from 'node:assert';
import {extractAll} from '@electron/asar';
import {root,browserInfo} from './prepare-browser.mjs';

const require=createRequire(import.meta.url),{chromium}=require('playwright-core');
const candidate=join(root,'out',JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version,'AnswerPouch-darwin-arm64/AnswerPouch.app');
const executablePath=browserInfo().executable;
const qa=mkdtempSync(join(tmpdir(),'answerpouch-engine-qa-')),appSource=join(qa,'packaged-source');
extractAll(join(candidate,'Contents/Resources/app.asar'),appSource);
const appRequire=createRequire(join(appSource,'lib/chrome-collector.cjs'));
const {LocalWorkspace,freezeQuestions,verifyLocalEvidence}=appRequire('./local-workspace.cjs');
const collectorSource=readFileSync(join(appSource,'lib/chrome-collector.cjs'),'utf8');
const submissions=[],launches=[],contextOptions=[],intervals=[],blockedRequests=[];
let workspace,contextSequence=0,profileSigninClicks=0;

function fixture(surface){
 const response=surface==='gemini'?'<model-response><message-content><div class="markdown" id="answer"></div></message-content><button aria-label="Copy response">Copy response</button></model-response>':'<article data-testid="assistant-message"><div class="prose" id="answer"></div><button aria-label="Copy response">Copy response</button></article>';
 const account=surface==='gemini'?'Google Account: Synthetic fixture':'Open profile menu';
 return `<!doctype html><meta charset="utf-8"><title>Synthetic ${surface} fixture</title><style>body{font:16px sans-serif}textarea{width:600px;height:80px}button{padding:10px}aside[hidden]{display:none}</style>
 <header><strong>Local synthetic fixture. Not a real provider response.</strong><button id="signin">Sign in</button><button id="account" aria-label="${account}" hidden>Fixture account</button></header>
 <main><textarea placeholder="Ask the synthetic fixture"></textarea><div id="reply"></div><button id="sources" aria-controls="source-panel" aria-expanded="false" hidden>Sources</button><aside id="source-panel" data-testid="sources-panel" aria-label="Sources" hidden><h2>Sources 1</h2><a href="https://evidence.example.test/guide?surface=${surface}">Synthetic cited guide</a></aside></main>
 <script>
 const surface=${JSON.stringify(surface)},signed=localStorage.getItem('fixture-signed-in')==='yes';
 document.getElementById('signin').hidden=signed;document.getElementById('account').hidden=!signed;
 document.getElementById('signin').onclick=async()=>{localStorage.setItem('fixture-signed-in','yes');await window.fixtureRecord({kind:'signin',surface});location.reload();};
 document.querySelector('textarea').addEventListener('keydown',async event=>{
  if(event.key!=='Enter'||event.shiftKey)return;event.preventDefault();
  const question=event.target.value;await window.fixtureRecord({kind:'submit',surface,question,locale:navigator.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone});
  if(question.includes('FIXTURE_RATE_LIMIT')){document.getElementById('reply').textContent='Too many requests. Synthetic rate limit fixture.';return;}
  document.getElementById('reply').innerHTML=${JSON.stringify(response)};
  const p=document.createElement('p');p.textContent='Synthetic original answer for '+surface+'. Exact question: '+question+'. This deterministic paragraph tests original evidence capture.';document.getElementById('answer').append(p);
  const a=document.createElement('a');a.href='https://evidence.example.test/guide?surface='+surface;a.textContent='Synthetic cited guide';document.getElementById('answer').append(a);document.getElementById('sources').hidden=false;
 });
 document.getElementById('sources').onclick=()=>{document.getElementById('source-panel').hidden=false;document.getElementById('sources').setAttribute('aria-expanded','true');};
 </script>`;
}
async function instrument(context){
 const id=++contextSequence;
 await context.exposeBinding('fixtureRecord',(_source,payload)=>{if(payload.kind==='signin')profileSigninClicks++;else submissions.push({...payload,contextId:id});});
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  const surface=url.hostname==='gemini.google.com'?'gemini':url.hostname==='www.perplexity.ai'?'perplexity':null;
  if(surface&&request.resourceType()==='document')return route.fulfill({status:200,contentType:'text/html',body:fixture(surface)});
  blockedRequests.push({kind:request.resourceType(),host:url.hostname});return route.abort();
 });
 return context;
}
const wrappedChromium={
 async launch(options){
  launches.push({mode:options.headless?'silent':'visible-requested',env:Object.keys(options.env).sort(),executableMatches:options.executablePath===executablePath});
  // Tests must also run while the Mac is locked; production visible-login requests are recorded.
  const browser=await chromium.launch({...options,headless:true});
  const original=browser.newContext.bind(browser);
  browser.newContext=async options=>{contextOptions.push(options);return instrument(await original(options));};return browser;
 },
 async launchPersistentContext(profile,options){
  launches.push({mode:'persistent-'+(options.headless?'silent':'visible-requested'),env:Object.keys(options.env).sort(),executableMatches:options.executablePath===executablePath});contextOptions.push(options);
  return instrument(await chromium.launchPersistentContext(profile,{...options,headless:true}));
 }
};
function collector(){
 const module={exports:{}};
 runInNewContext(collectorSource,{module,require:name=>name==='playwright-core'?{chromium:wrappedChromium}:appRequire(name),AbortController,Buffer,URL});
 return module.exports.createChromeCollector({executablePath,hostEnvironment:true,profileRoot:join(qa,'profiles')});
}
async function signIn(source){
 await workspace.login(source);
 const browserPage=contextsLastPage();
 if(await browserPage.locator('#signin').isVisible()){
  await browserPage.locator('#signin').click();await browserPage.locator('#account').waitFor({state:'visible'});
 }
 await workspace.checkLogin(source);
}
// Read pages only from contexts created by this isolated test.
const ownedContexts=[];
const attach=instrument;
instrument=async context=>{ownedContexts.push(context);return attach(context);};
function contextsLastPage(){const contexts=ownedContexts.filter(c=>c.pages().length);return contexts.at(-1).pages().at(-1);}

const timeout=setTimeout(()=>{void workspace?.stop();},90000);
try{
 const create=()=>new LocalWorkspace({root:join(qa,'workspace'),collector:collector(),wait:async ms=>{intervals.push(ms);}});
 workspace=create();const frozen=freezeQuestions({name:'Synthetic full-engine check',text:'Exact C++ & C# question?\n第二个合成问题，保持原文？'});
 await workspace.importQuestions(frozen);assert.equal(launches.length,0);assert.equal(submissions.length,0);
 const request={sources:['gemini','perplexity'],frozenHash:frozen.hash,riskAcknowledged:true,locationAcknowledged:true};
 assert.throws(()=>workspace.start(request),/login_required/);
 for(const source of request.sources)await signIn(source);
 assert.equal(profileSigninClicks,2);
 const started=workspace.start(request);await workspace.active.promise;
 const result=workspace.exportRun(started.runId);assert.equal(result.run.status,'complete',JSON.stringify(result.tasks.map(t=>({status:t.status,reason:t.reason,message:t.message}))));assert.equal(result.tasks.length,4);
 assert.deepEqual(submissions.map(x=>[x.surface,x.question]),request.sources.flatMap(s=>frozen.questions.map(q=>[s,q.text])));
 assert.equal(new Set(submissions.map(x=>x.contextId)).size,4,'Every question uses a fresh browser context');
 for(const task of result.tasks){assert.equal(task.status,'observed');assert.equal(task.evidence.accountVerified,true);assert.equal(verifyLocalEvidence(task.evidence).valid,true);assert.ok(task.evidence.capture.answer.includes(task.prompt));assert.ok(task.evidence.capture.citations.some(c=>c.url==='https://evidence.example.test/guide?surface='+task.surface));assert.equal(task.evidence.capture.privacy.newConversation,true);assert.equal(task.evidence.host.locationOverrides,false);}
 assert.throws(()=>workspace.start({...request,country:'US'}));assert.throws(()=>workspace.start(request),/repeat_confirmation_required/);
 const firstSigninClicks=profileSigninClicks;await workspace.close();workspace=create();
 assert.equal(submissions.length,4,'Restart never replays submitted questions');
 const next=freezeQuestions({name:'Synthetic restriction check',text:'FIXTURE_RATE_LIMIT\nThis question must remain unsubmitted.'});await workspace.importQuestions(next);
 await signIn('gemini');assert.equal(profileSigninClicks,firstSigninClicks,'Persistent synthetic session survives normal close');
 const stopped=workspace.start({...request,sources:['gemini'],frozenHash:next.hash});await workspace.active.promise;
 const stoppedRun=workspace.exportRun(stopped.runId);assert.equal(stoppedRun.run.status,'restricted');assert.equal(stoppedRun.tasks[0].restriction,'rate_limit');assert.equal(stoppedRun.tasks[1].status,'held');assert.equal(submissions.length,5);
 for(const options of contextOptions)for(const key of ['locale','timezoneId','proxy','geolocation'])assert.equal(Object.hasOwn(options,key),false,key+' must remain host default');
 assert.ok(launches.every(x=>x.executableMatches&&JSON.stringify(x.env)===JSON.stringify(['HOME','LANG','PATH','TMPDIR'])));
 assert.ok(intervals.every(ms=>ms===45000));
 const receipt={passed:true,packagedCollector:true,bundledBrowser:false,developerBrowser:true,sources:['gemini','perplexity'],syntheticPagesOnly:true,realProviderRequests:0,submissions:5,successfulCaptures:4,restrictionCaptures:1,heldAfterRestriction:1,freshQuestionContexts:4,syntheticSigninActions:profileSigninClicks,persistentSyntheticSessionRestored:true,exactQuestionOrder:true,originalAnswersAndCitationsRetained:true,overrideInputsRejected:true,hostBrowserOptions:true,launches:launches.length,blockedNonFixtureRequests:blockedRequests.length,cadenceValues:intervals,productionCadenceWaitSkippedForTest:true,visibleLoginRequestsRanHeadlessForLockedMacTest:true,realAccountAcceptance:false};
 writeFileSync(join(root,'docs/collection-engine-check-0.2.3.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}finally{clearTimeout(timeout);await workspace?.close();rmSync(qa,{recursive:true,force:true});}
