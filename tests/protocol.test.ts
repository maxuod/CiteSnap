import {afterEach,describe,expect,it} from 'vitest';
import {createRequire} from 'node:module';
import {readFileSync,mkdtempSync,rmSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {createEvidence,verifyEvidence,taskSchema}=require('../index.cjs');
const task=JSON.parse(readFileSync(new URL('../examples/guest-task.json',import.meta.url),'utf8'));
const capture=()=>({slotId:task.slotId,prompt:task.prompt,status:'observed',reason:'',restriction:'none',observedAt:new Date().toISOString(),answer:'Synthetic original answer.',citations:[{url:'https://example.test/source',title:'Source',placement:'answer_link'}],model:'synthetic',account:'logged_out',session:'fresh',exitCountry:null,geo:'unverified',locale:'en-CA',timezone:'America/Halifax',device:'desktop',geolocation:'denied',searchMode:'natural',collectionMode:'fixture',retrievalUsed:null,artifact:{mime:'text/plain',base64:Buffer.from('Synthetic exact artifact').toString('base64')}});
const roots:string[]=[];afterEach(()=>roots.splice(0).forEach(p=>rmSync(p,{recursive:true,force:true})));
describe('independent evidence interchange',()=>{
 it('retains exact capture and source artifact, verifies after JSON roundtrip and does not mutate input',()=>{
  const c=capture(),before=JSON.stringify({task,c});const e=createEvidence(task,c);
  expect(verifyEvidence(JSON.parse(JSON.stringify(e)))).toEqual({valid:true,schemaVersion:1,status:'observed',restriction:'none'});
  expect(e.capture).toEqual(c);expect(e.capture).not.toBe(c);expect(JSON.stringify({task,c})).toBe(before);
  expect(Buffer.from(e.capture.artifact.base64,'base64').toString()).toBe('Synthetic exact artifact');
  expect(e.collector.name).toBe('CiteSnap');
 });
 it('still verifies legacy AnswerPouch evidence without relabeling its saved bytes',()=>{
  const old=createEvidence(task,capture());old.collector.name='AnswerPouch';
  const {hash:ignored,...body}=old;
  const canonical=(value:any):any=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
  old.hash=createHash('sha256').update(JSON.stringify(canonical(body))).digest('hex');const bytes=JSON.stringify(old);
  expect(verifyEvidence(old)).toMatchObject({valid:true});expect(JSON.stringify(old)).toBe(bytes);
 });
 it('detects changes to the original answer, source URL, question and artifact',()=>{
  const original=createEvidence(task,capture());
  for(const alter of [(e:any)=>e.capture.answer+='changed',(e:any)=>e.capture.citations[0].url='https://other.test/',(e:any)=>e.task.prompt+='changed',(e:any)=>e.capture.artifact.base64='Y2hhbmdlZA==']){
   const e=structuredClone(original);alter(e);expect(()=>verifyEvidence(e)).toThrow();
  }
 });
 it('preserves a restricted stop without converting it into a complete answer',()=>{
  const c={...capture(),status:'unavailable',reason:'Access requires login',restriction:'login',answer:'',citations:[]};
  expect(verifyEvidence(createEvidence(task,c))).toMatchObject({status:'unavailable',restriction:'login'});
  expect(()=>createEvidence(task,{...c,answer:'Invented answer'})).toThrow();
 });
 it('rejects unsupported protocol, mismatched task and undisclosed credentials/configuration',()=>{
  expect(()=>verifyEvidence({...createEvidence(task,capture()),schemaVersion:2})).toThrow();
  expect(()=>createEvidence(task,{...capture(),slotId:'another-question'})).toThrow();
  expect(()=>taskSchema.parse({...task,apiKey:'synthetic-secret'})).toThrow();
  expect(()=>taskSchema.parse({...task,config:{...task.config,accountMode:'isolated'}})).toThrow();
 });
 it('has no package runtime dependency on Electron, getaudit, GSC or its database',()=>{
  const pkg=require('../package.json');expect(Object.keys(pkg.dependencies).sort()).toEqual(['playwright-core','zod']);
  const manifest=require('../source-provenance.json');
  for(const entry of manifest.runtimeRevision?.modules||manifest.modules){const bytes=readFileSync(new URL('../'+entry.target,import.meta.url));expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256);}
 });
});
describe('offline CLI safeguards',()=>{
 const bin=fileURLToPath(new URL('../bin/answerpouch.cjs',import.meta.url));
 function run(args:string[]){return spawnSync(process.execPath,[bin,...args],{encoding:'utf8',env:{HOME:tmpdir(),PATH:process.env.PATH,TMPDIR:tmpdir(),LANG:'en_CA.UTF-8'}});}
 it('shows help and validates a task without browser submission',()=>{
  expect(run(['--help']).status).toBe(0);
  const result=run(['check-task',fileURLToPath(new URL('../examples/guest-task.json',import.meta.url))]);
  expect(result.status).toBe(0);expect(JSON.parse(result.stdout)).toEqual({valid:true,submitted:false});
 });
 it('requires explicit transfer acknowledgement before reserving output or opening a browser',()=>{
  const root=mkdtempSync(join(tmpdir(),'answerpouch-cli-'));roots.push(root);const output=join(root,'capture.json');
  const result=run(['collect','--task',fileURLToPath(new URL('../examples/guest-task.json',import.meta.url)),'--output',output]);
  expect(result.status).toBe(1);expect(existsSync(output)).toBe(false);expect(existsSync(output+'.receipt.json')).toBe(false);
 });
 it('refuses existing output even with acknowledgement, preserving any prior uncertain receipt',()=>{
  const root=mkdtempSync(join(tmpdir(),'answerpouch-cli-'));roots.push(root);const output=join(root,'capture.json');
  writeFileSync(output,'prior evidence');writeFileSync(output+'.receipt.json','prior submitted checkpoint');
  const result=run(['collect','--task',fileURLToPath(new URL('../examples/guest-task.json',import.meta.url)),'--output',output,'--acknowledge-transfer']);
  expect(result.status).toBe(1);expect(readFileSync(output,'utf8')).toBe('prior evidence');expect(readFileSync(output+'.receipt.json','utf8')).toBe('prior submitted checkpoint');
 });
});
