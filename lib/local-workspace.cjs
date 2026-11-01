const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {randomUUID,createHash}=require('node:crypto');
const {setTimeout:delay}=require('node:timers/promises');
const {EventEmitter}=require('node:events');
const {z}=require('zod');
const {captureSchema}=require('./capture-schema.cjs');
const SOURCES=Object.freeze([
 {id:'chatgpt_search',name:'ChatGPT'},{id:'gemini',name:'Gemini'},
 {id:'bing_copilot',name:'Copilot'},{id:'perplexity',name:'Perplexity'},
 {id:'grok',name:'Grok'},{id:'google_aio',name:'Google AI Overview'}
]);
const sourceIds=SOURCES.map(s=>s.id);
const CODE=code=>Object.assign(new Error(code),{code});
const canonical=value=>JSON.stringify(sort(value));
function sort(v){if(Array.isArray(v))return v.map(sort);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,sort(v[k])]));return v;}
const hash=v=>createHash('sha256').update(typeof v==='string'?v:canonical(v)).digest('hex');
const clone=v=>JSON.parse(JSON.stringify(v));
const questionSchema=z.object({id:z.uuid(),text:z.string().min(1).max(10000).refine(s=>!!s.trim())}).strict();
const frozenBodySchema=z.object({kind:z.literal('answerpouch.questions'),version:z.literal(1),id:z.uuid(),name:z.string().min(1).max(120),createdAt:z.iso.datetime(),questions:z.array(questionSchema).min(1).max(100)}).strict();
const frozenSchema=frozenBodySchema.extend({hash:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
function freezeQuestions({name,text},now=new Date()){
 if(typeof text!=='string'||text.length>1000000)throw CODE('invalid_questions');
 const lines=text.replace(/\r\n/g,'\n').split('\n').filter(s=>s.trim());
 if(lines.length>100)throw CODE('too_many_questions');
 if(new Set(lines).size!==lines.length)throw CODE('duplicate_questions');
 const body=frozenBodySchema.parse({kind:'answerpouch.questions',version:1,id:randomUUID(),name,createdAt:now.toISOString(),questions:lines.map(text=>({id:randomUUID(),text}))});
 return {...body,hash:hash(body)};
}
function verifyQuestions(input){
 const value=frozenSchema.parse(input),{hash:expected,...body}=value;
 if(hash(body)!==expected||new Set(value.questions.map(q=>q.id)).size!==value.questions.length||new Set(value.questions.map(q=>q.text)).size!==value.questions.length)throw CODE('question_hash_mismatch');
 return value;
}
function hostContext(){
 const options=new Intl.DateTimeFormat().resolvedOptions();
 return {policy:'host-network-only',locale:options.locale||'en',timezone:options.timeZone||'UTC',platform:os.platform(),networkCountry:null,physicalLocationVerified:false,locationOverrides:false};
}
function directory(p){if(!fs.existsSync(p))fs.mkdirSync(p,{recursive:true,mode:0o700});const s=fs.lstatSync(p);if(!s.isDirectory()||s.isSymbolicLink())throw CODE('workspace_unavailable');fs.chmodSync(p,0o700);}
function readJson(file,max=16*1024*1024){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw CODE('invalid_file');return JSON.parse(fs.readFileSync(file,'utf8'));}
function atomic(file,value){
 if(fs.existsSync(file)&&(!fs.lstatSync(file).isFile()||fs.lstatSync(file).isSymbolicLink()))throw CODE('invalid_file');
 const temporary=file+'.'+randomUUID()+'.tmp';
 try{fs.writeFileSync(temporary,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600,flush:true});fs.renameSync(temporary,file);}finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
}
const startSchema=z.object({sources:z.array(z.enum(sourceIds)).min(1).max(SOURCES.length),frozenHash:z.string().regex(/^[a-f0-9]{64}$/),riskAcknowledged:z.literal(true),locationAcknowledged:z.literal(true),repeatAcknowledged:z.boolean().optional()}).strict();
function verifyLocalEvidence(value){
 if(!value||value.kind!=='answerpouch.local-capture'||value.version!==2||!value.capture||typeof value.hash!=='string')throw CODE('invalid_evidence');
 const {hash:expected,...body}=value;captureSchema.parse(body.capture);
 const accountVerified=body.capture.account==='logged_in'&&body.capture.privacy?.mode==='signed_in_independent';
 const exclusion=body.capture.status==='observed'&&!accountVerified?'account_unverified':null;
 if(hash(body)!==expected||body.capture.slotId!==body.task.id||body.capture.prompt!==body.question.text||body.host.policy!=='host-network-only'||body.host.locationOverrides!==false||body.accountVerified!==accountVerified||body.exclusion!==exclusion)throw CODE('invalid_evidence');
 return {valid:true,version:2,status:body.capture.status};
}
class LocalWorkspace extends EventEmitter{
 constructor({root,collector,now=()=>new Date(),host=hostContext,wait=(ms,signal)=>delay(ms,undefined,{signal}),intervalMs=45000,dailyLimit=50}){
  super();if(!path.isAbsolute(root)||root===path.parse(root).root||root===os.homedir())throw CODE('invalid_workspace');
  this.root=root;this.collector=collector;this.now=now;this.host=host;this.wait=wait;this.intervalMs=intervalMs;this.dailyLimit=dailyLimit;this.active=null;this.pendingLogin=null;this.checkingLogin=false;this.preparingLogin=false;
  directory(root);directory(path.join(root,'questions'));directory(path.join(root,'evidence'));
  this.file=path.join(root,'workspace.json');
  this.state=fs.existsSync(this.file)?readJson(this.file):{version:1,questionSets:[],selectedHash:null,runs:[],tasks:[]};
  if(this.state.version!==1||!Array.isArray(this.state.runs)||!Array.isArray(this.state.tasks)||!Array.isArray(this.state.questionSets))throw CODE('workspace_unavailable');
  let changed=false;
  for(const run of this.state.runs)if(['running','queued'].includes(run.status)){run.status='interrupted';run.finishedAt=this.now().toISOString();changed=true;}
  for(const task of this.state.tasks)if(['running','queued'].includes(task.status)){task.status=task.submittedAt?'uncertain':'interrupted';task.message='interrupted';changed=true;}
  if(changed)this.save();
 }
 save(){atomic(this.file,this.state);this.emit('change');}
 selected(){const hash=this.state.selectedHash;if(!hash)return null;return verifyQuestions(readJson(path.join(this.root,'questions',hash+'.json'),2*1024*1024));}
 ensureIdle(){if(this.active||this.preparingLogin||this.checkingLogin)throw CODE('collection_in_progress');}
 async importQuestions(input){
  this.ensureIdle();const frozen=verifyQuestions(input),old=this.selected();
  if(old&&old.hash!==frozen.hash)await this.collector.closePlanSessions?.(old.id);
  const target=path.join(this.root,'questions',frozen.hash+'.json');
  if(!fs.existsSync(target))atomic(target,frozen);else if(canonical(readJson(target))!==canonical(frozen))throw CODE('question_hash_mismatch');
  if(!this.state.questionSets.some(x=>x.hash===frozen.hash))this.state.questionSets.push({id:frozen.id,name:frozen.name,hash:frozen.hash,count:frozen.questions.length,createdAt:frozen.createdAt});
  this.state.selectedHash=frozen.hash;this.pendingLogin=null;this.save();return this.snapshot();
 }
 config(){const context=this.host();return {country:'ZZ',locale:context.locale,timezone:context.timezone,device:'desktop',accountMode:'isolated',egressPolicy:'unverified'};}
 async login(source){
  this.ensureIdle();const frozen=this.selected();if(!frozen)throw CODE('import_questions_first');if(!sourceIds.includes(source))throw CODE('invalid_source');
  this.preparingLogin=true;
  try{await this.collector.prepareSession({planId:frozen.id,surface:source,config:this.config()});this.pendingLogin={source,planId:frozen.id};return this.snapshot();}finally{this.preparingLogin=false;this.emit('change');}
 }
 async checkLogin(source){
  this.ensureIdle();const frozen=this.selected();if(!frozen||!sourceIds.includes(source))throw CODE('import_questions_first');
  if(this.checkingLogin)throw CODE('login_check_running');this.checkingLogin=true;this.emit('change');
  try{await this.collector.verifySession(frozen.id,source);if(this.pendingLogin?.source===source)this.pendingLogin=null;return this.snapshot();}finally{this.checkingLogin=false;this.emit('change');}
 }
 async verifyOnFocus(){if(this.active||this.checkingLogin||!this.pendingLogin)return;const current=this.pendingLogin;try{await this.checkLogin(current.source);}catch{this.emit('change');}}
 usage(source){const cutoff=this.now().getTime()-86400000;return this.state.tasks.filter(t=>t.surface===source&&t.startedAt&&Date.parse(t.startedAt)>cutoff).length;}
 preview(sources){
  const frozen=this.selected();if(!frozen)return {total:0,repeats:0,highFrequency:false};
  const unique=[...new Set(sources.filter(s=>sourceIds.includes(s)))];
  const repeats=this.state.tasks.filter(t=>t.frozenHash===frozen.hash&&unique.includes(t.surface)&&t.submittedAt).length;
  return {total:frozen.questions.length*unique.length,repeats,highFrequency:frozen.questions.length*unique.length>20||unique.some(s=>this.usage(s)>=20),usage:Object.fromEntries(unique.map(s=>[s,this.usage(s)])),limit:this.dailyLimit};
 }
 snapshot(){
  const selected=this.selected();
  return {version:1,host:this.host(),available:this.collector.available(),selected,questionSets:clone(this.state.questionSets),
   sources:SOURCES.map(s=>({...s,confirmed:!!selected&&this.collector.ready(selected.id,[s.id]),saved:!!this.collector.savedSession?.(s.id),checking:this.checkingLogin&&this.pendingLogin?.source===s.id,usedToday:this.usage(s.id)})),
   runs:clone(this.state.runs.slice(-20).reverse()),tasks:clone(this.state.tasks.slice(-600).map(({evidenceFile,...t})=>t)),active:!!this.active,intervalSeconds:this.intervalMs/1000,dailyLimit:this.dailyLimit};
 }
 start(input){
  this.ensureIdle();if(!this.collector.available().available)throw CODE('browser_unavailable');let request;try{request=startSchema.parse(input);}catch{throw CODE('confirm_risk_and_location');}
  if(new Set(request.sources).size!==request.sources.length)throw CODE('invalid_source');
  const frozen=this.selected();if(!frozen||frozen.hash!==request.frozenHash)throw CODE('question_hash_mismatch');
  const preview=this.preview(request.sources);if(preview.repeats&&!request.repeatAcknowledged)throw CODE('repeat_confirmation_required');
  if(!this.collector.ready(frozen.id,request.sources))throw CODE('login_required');
  if(request.sources.some(s=>this.usage(s)+frozen.questions.length>this.dailyLimit))throw CODE('daily_limit');
  const run={id:randomUUID(),frozenHash:frozen.hash,frozenId:frozen.id,questionCount:frozen.questions.length,sources:request.sources,createdAt:this.now().toISOString(),status:'running',host:this.host(),riskAcknowledgedAt:this.now().toISOString(),riskNoticeVersion:1,locationAcknowledged:true,repeatAcknowledged:!!request.repeatAcknowledged};
  const tasks=request.sources.flatMap(surface=>frozen.questions.map(q=>({id:randomUUID(),runId:run.id,frozenHash:frozen.hash,questionId:q.id,prompt:q.text,surface,status:'queued',stage:'queued'})));
  this.state.runs.push(run);this.state.tasks.push(...tasks);
  const controller=new AbortController();this.active={controller,promise:null,runId:run.id};this.save();
  this.active.promise=this.work(run,tasks,frozen,controller.signal).finally(()=>{this.active=null;this.save();});
  return {runId:run.id,total:tasks.length};
 }
 async work(run,tasks,frozen,signal){
  try{
   for(let i=0;i<tasks.length;i++){
    const task=tasks[i];if(signal.aborted)break;
    if(i){task.stage='waiting_interval';this.save();await this.wait(this.intervalMs,signal);}
    if(signal.aborted)break;
    task.status='running';task.stage='opening';task.startedAt=this.now().toISOString();this.save();
    try{
     const capture=await this.collector.collect({planId:frozen.id,slotId:task.id,prompt:task.prompt,surface:task.surface,config:this.config(),timeoutSeconds:150,browserMode:'silent',captureScreenshot:false,verifiedCountry:null,geoVerificationNote:'Host network only. No country, timezone, location or proxy overrides. Physical location and network country are unverified.'},signal,stage=>{
      if(!['opening','preparing','submitting','waiting','capturing'].includes(stage))throw CODE('invalid_stage');
      task.stage=stage;if(stage==='submitting'&&!task.submittedAt)task.submittedAt=this.now().toISOString();this.save();
     });
     captureSchema.parse(capture);if(capture.slotId!==task.id||capture.prompt!==task.prompt)throw CODE('capture_mismatch');
     const accountVerified=capture.account==='logged_in'&&capture.privacy?.mode==='signed_in_independent';
     const exclusion=capture.status==='observed'&&!accountVerified?'account_unverified':null;
     const question=frozen.questions.find(q=>q.id===task.questionId);
     const body={kind:'answerpouch.local-capture',version:2,collector:{name:'CiteSnap',version:require('../package.json').version},runId:run.id,frozenHash:frozen.hash,question,accountVerified,exclusion,task:{id:task.id,surface:task.surface,submittedAt:task.submittedAt||null},host:run.host,capture};
     const evidence={...body,hash:hash(body)};verifyLocalEvidence(evidence);
     const filename=task.id+'.json';atomic(path.join(this.root,'evidence',filename),evidence);
     task.evidenceFile=filename;task.evidenceHash=evidence.hash;task.status=exclusion?'attention':capture.status;task.stage='finished';task.reason=capture.reason;task.restriction=capture.restriction;task.finishedAt=this.now().toISOString();
     if(exclusion){run.status='attention';this.save();break;}
     if(capture.restriction!=='none'){run.status='restricted';this.save();break;}
     if(capture.status==='error'){run.status='attention';this.save();break;}
    }catch(error){task.status=task.submittedAt?'uncertain':signal.aborted?'cancelled':'error';task.stage='stopped';task.message=signal.aborted?'cancelled':'capture_failed';run.status=signal.aborted?'cancelled':'attention';this.save();break;}
    this.save();
   }
  }catch{run.status=signal.aborted?'cancelled':'attention';}
  finally{
   for(const t of tasks)if(['queued','running'].includes(t.status)){t.status=t.submittedAt?'uncertain':signal.aborted?'cancelled':'held';t.stage='stopped';}
   if(run.status==='running')run.status=signal.aborted?'cancelled':'complete';run.finishedAt=this.now().toISOString();this.save();
  }
 }
 async stop(){if(this.active){const running=this.active;running.controller.abort();await running.promise;}return this.snapshot();}
 evidence(id){const task=this.state.tasks.find(t=>t.id===id);if(!task?.evidenceFile)throw CODE('evidence_unavailable');const e=readJson(path.join(this.root,'evidence',task.evidenceFile));verifyLocalEvidence(e);return e;}
 exportRun(id){const run=this.state.runs.find(r=>r.id===id);if(!run)throw CODE('run_not_found');const tasks=this.state.tasks.filter(t=>t.runId===id),questionSet=verifyQuestions(readJson(path.join(this.root,'questions',run.frozenHash+'.json')));const body={kind:'answerpouch.run',version:1,run:clone(run),questionSet,tasks:tasks.map(t=>({...clone(t),evidence:t.evidenceFile?this.evidence(t.id):null}))};return {...body,hash:hash(body)};}
 async close(){await this.stop();await this.collector.close();}
}
module.exports={LocalWorkspace,freezeQuestions,verifyQuestions,verifyLocalEvidence,hostContext,SOURCES,canonical,hash,readJson};
