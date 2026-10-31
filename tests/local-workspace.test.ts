import {afterEach,describe,expect,it} from 'vitest';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,rmSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const require=createRequire(import.meta.url);
const {LocalWorkspace,freezeQuestions,verifyQuestions,verifyLocalEvidence}=require('../lib/local-workspace.cjs');
const roots:string[]=[];afterEach(()=>roots.splice(0).forEach(r=>rmSync(r,{recursive:true,force:true})));
function fixture(options:any={}){
 const root=mkdtempSync(join(tmpdir(),'answerpouch-workspace-'));roots.push(root);
 let confirmed=options.confirmed!==false;const calls:any[]=[],waits:number[]=[],logins:any[]=[];
 const collector={available:()=>({available:true,message:'Synthetic fixture'}),savedSession:()=>true,ready:()=>confirmed,
  close:async()=>{},closePlanSessions:async()=>{},prepareSession:async(t:any)=>{logins.push(t);},verifySession:async()=>{confirmed=true;},
  collect:async(task:any,signal:AbortSignal,stage:(s:string)=>void)=>{
   calls.push(task);stage('opening');stage('preparing');stage('submitting');
   if(options.collect)return options.collect(task,signal,stage);
   stage('waiting');stage('capturing');return capture(task,options.restricted);
  }};
 const context={policy:'host-network-only',locale:'en-CA',timezone:'America/Halifax',platform:'darwin',networkCountry:null,physicalLocationVerified:false,locationOverrides:false};
 const workspace=new LocalWorkspace({root,collector,host:()=>context,wait:async(ms:number,signal:AbortSignal)=>{waits.push(ms);if(signal.aborted)throw Error('Aborted');},...options.service});
 const frozen=freezeQuestions({name:'Frozen local questions',text:'Original C++ & C# question?\nSecond original question?'});
 const request=()=>({sources:['gemini','perplexity'],frozenHash:frozen.hash,riskAcknowledged:true,locationAcknowledged:true});
 return {workspace,collector,frozen,request,calls,waits,logins,root};
}
function capture(task:any,restriction?:string){return {slotId:task.slotId,prompt:task.prompt,status:restriction?'unavailable':'observed',reason:restriction?'Fixture access stop':'',restriction:restriction||'none',observedAt:new Date().toISOString(),answer:restriction?'':'Original synthetic answer.',citations:restriction?[]:[{url:'https://example.test/source',title:'Original source',placement:'source_panel'}],model:'synthetic',account:'logged_in',session:'active',privacy:{mode:'signed_in_independent',temporaryChat:'not_applicable',personalization:'unknown',newConversation:true},exitCountry:null,geo:'unverified',locale:'en-CA',timezone:'America/Halifax',device:'desktop',geolocation:'denied',searchMode:'natural',collectionMode:'fixture',retrievalUsed:null,artifact:{mime:'text/plain',base64:Buffer.from('Exact raw fixture').toString('base64')}};}
describe('freeze, import and own-account automatic collection',()=>{
 it('freezes exact ordered wording, detects tampering, and rejects duplicate questions or injected location fields',()=>{
  const f=freezeQuestions({name:'Research',text:' Original C++? \n\n第二个问题？'});expect(f.questions.map((q:any)=>q.text)).toEqual([' Original C++? ','第二个问题？']);expect(verifyQuestions(JSON.parse(JSON.stringify(f)))).toEqual(f);
  expect(()=>verifyQuestions({...f,questions:[{...f.questions[0],text:'Changed'}]})).toThrow();
  expect(()=>verifyQuestions({...f,country:'US'})).toThrow();expect(()=>freezeQuestions({name:'Duplicates',text:'Same\nSame'})).toThrow();
 });
 it('import alone sends no request and startup does not launch or restore saved logins',async()=>{
  const f=fixture({confirmed:false});await f.workspace.importQuestions(f.frozen);f.workspace.snapshot();
  expect(f.calls).toEqual([]);expect(f.logins).toEqual([]);expect(f.workspace.snapshot().sources[0]).toMatchObject({confirmed:false,saved:true});
  const reopened=new LocalWorkspace({root:f.root,collector:f.collector});expect(reopened.snapshot().selected.hash).toBe(f.frozen.hash);expect(f.calls).toEqual([]);
 });
 it('requires importing the frozen set, current login and both acknowledgements',async()=>{
  const f=fixture({confirmed:false});expect(()=>f.workspace.start(f.request())).toThrow();await f.workspace.importQuestions(f.frozen);
  expect(()=>f.workspace.start({...f.request(),riskAcknowledged:false})).toThrow();expect(()=>f.workspace.start({...f.request(),locationAcknowledged:false})).toThrow();
  expect(()=>f.workspace.start(f.request())).toThrow('login_required');expect(f.calls).toEqual([]);
  await f.workspace.login('gemini');expect(f.logins[0].config).toMatchObject({country:'ZZ',locale:'en-CA',timezone:'America/Halifax',accountMode:'isolated',egressPolicy:'unverified'});
  await f.workspace.checkLogin('gemini');
 });
 it('rejects all requested country, location, timezone, proxy and IP overrides at the start interface',async()=>{
  const f=fixture();await f.workspace.importQuestions(f.frozen);
  for(const prop of ['country','timezone','proxy','ip','location','latitude','longitude'])expect(()=>f.workspace.start({...f.request(),[prop]:'override'})).toThrow();
  expect(f.calls).toEqual([]);
 });
 it('automatically collects every imported question only from selected sources, sequentially with actual stages',async()=>{
  const f=fixture();await f.workspace.importQuestions(f.frozen);const started=f.workspace.start(f.request());await f.workspace.active.promise;
  expect(f.calls.map(t=>[t.surface,t.prompt])).toEqual(f.request().sources.flatMap(surface=>f.frozen.questions.map((q:any)=>[surface,q.text])));
  expect(f.waits).toEqual([45000,45000,45000]);expect(f.workspace.snapshot().runs[0]).toMatchObject({id:started.runId,status:'complete',riskNoticeVersion:1});
  for(const t of f.calls){expect(t.config).toMatchObject({accountMode:'isolated',egressPolicy:'unverified',country:'ZZ'});expect(t.verifiedCountry).toBeNull();expect(t.config).not.toHaveProperty('proxy');}
  const exported=f.workspace.exportRun(started.runId);expect(exported.questionSet).toEqual(f.frozen);expect(exported.tasks).toHaveLength(4);
  for(const task of exported.tasks){expect(verifyLocalEvidence(task.evidence).valid).toBe(true);expect(task.evidence.capture.answer).toBe('Original synthetic answer.');expect(Buffer.from(task.evidence.capture.artifact.base64,'base64').toString()).toBe('Exact raw fixture');expect(task.evidence.host.physicalLocationVerified).toBe(false);}
  expect(statSync(join(f.root,'workspace.json')).mode&0o777).toBe(0o600);
 });
 it('stops the whole batch at a rate or account restriction, preserving evidence and held tasks without retries',async()=>{
  const f=fixture({restricted:'rate_limit'});await f.workspace.importQuestions(f.frozen);const r=f.workspace.start(f.request());await f.workspace.active.promise;
  expect(f.calls).toHaveLength(1);expect(f.workspace.snapshot().runs[0].status).toBe('restricted');const e=f.workspace.exportRun(r.runId);expect(e.tasks[0].evidence.capture).toMatchObject({status:'unavailable',restriction:'rate_limit',answer:'',citations:[]});expect(e.tasks.slice(1).every((t:any)=>t.status==='held')).toBe(true);
 });
 it('requires extra explicit acknowledgement before a new repeat observation',async()=>{
  const f=fixture();await f.workspace.importQuestions(f.frozen);f.workspace.start(f.request());await f.workspace.active.promise;
  expect(f.workspace.preview(f.request().sources).repeats).toBe(4);expect(()=>f.workspace.start(f.request())).toThrow('repeat_confirmation_required');expect(f.calls).toHaveLength(4);
 });
 it('enforces a persistent daily guard without claiming it is a platform-safe request count',async()=>{
  const f=fixture({service:{dailyLimit:2}});await f.workspace.importQuestions(f.frozen);f.workspace.start(f.request());await f.workspace.active.promise;
  expect(()=>f.workspace.start({...f.request(),repeatAcknowledged:true})).toThrow('daily_limit');
  const reopened=new LocalWorkspace({root:f.root,collector:f.collector,dailyLimit:2});expect(()=>reopened.start({...f.request(),repeatAcknowledged:true})).toThrow('daily_limit');
 });
 it('marks a stopped submitted question uncertain and does not replay it after reopening',async()=>{
  let entered:()=>void=()=>{};const checkpoint=new Promise<void>(r=>{entered=r;});
  const f=fixture({collect:(_t:any,signal:AbortSignal)=>new Promise((_r,reject)=>{entered();signal.addEventListener('abort',()=>reject(Error('Stopped')),{once:true});})});
  await f.workspace.importQuestions(f.frozen);f.workspace.start(f.request());await checkpoint;await f.workspace.stop();
  expect(f.workspace.snapshot().tasks[0].status).toBe('uncertain');expect(f.calls).toHaveLength(1);
  new LocalWorkspace({root:f.root,collector:f.collector}).snapshot();expect(f.calls).toHaveLength(1);expect(JSON.parse(readFileSync(join(f.root,'workspace.json'),'utf8')).runs[0].status).toBe('cancelled');
 });
 it('rejects an observed capture without current signed-in proof and blocks set changes during a run',async()=>{
  let release:(v:any)=>void=()=>{};const f=fixture({collect:()=>new Promise(r=>{release=r;})});await f.workspace.importQuestions(f.frozen);f.workspace.start(f.request());
  await expect(f.workspace.importQuestions(freezeQuestions({name:'Other',text:'Other?'}))).rejects.toThrow('collection_in_progress');
  release({...capture(f.calls[0]),account:'unknown'});await f.workspace.active.promise;expect(f.workspace.snapshot().tasks[0].status).toBe('attention');expect(f.calls).toHaveLength(1);
  const saved=f.workspace.evidence(f.workspace.snapshot().tasks[0].id);expect(saved.accountVerified).toBe(false);expect(saved.capture.answer).toBe('Original synthetic answer.');
 });
});
