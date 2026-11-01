'use strict';
const fs=require('node:fs');
const path=require('node:path');
const https=require('node:https');
const {createHash,randomUUID}=require('node:crypto');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const {createBrowserEnvironment}=require('./browser-environment.cjs');
const run=promisify(execFile);
const SPEC=Object.freeze({version:'153.0.8010.12',bytes:190970181,sha256:'930e2a2c15addbaca1fe9b07bfa520667bced556d7988707186819cb4279ef3b',url:'https://storage.googleapis.com/chrome-for-testing-public/153.0.8010.12/mac-arm64/chrome-mac-arm64.zip'});
const RELATIVE='chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
function code(value){return Object.assign(Error(value),{code:value});}
async function download(file,{signal,onProgress},spec=SPEC,get=https.get){
 await new Promise((resolve,reject)=>{
  let response,output,request,deadline,settled=false,received=0;
  const digest=createHash('sha256');
  const finish=error=>{if(settled)return;settled=true;clearTimeout(deadline);if(error){response?.destroy();output?.destroy();request?.destroy();reject(error);}else resolve();};
  deadline=setTimeout(()=>finish(code('browser_download_failed')),240000);
  request=get(spec.url,{signal,timeout:30000},res=>{
   response=res;
   if(res.statusCode!==200||Number(res.headers['content-length'])!==spec.bytes){res.resume();finish(code('browser_download_failed'));return;}
   output=fs.createWriteStream(file,{flags:'wx',mode:0o600});
   res.on('data',chunk=>{received+=chunk.length;if(received>spec.bytes){finish(code('browser_download_failed'));return;}digest.update(chunk);onProgress?.(received/spec.bytes);});
   res.on('error',finish);res.on('aborted',()=>finish(code('browser_download_failed')));output.on('error',finish);
   output.on('finish',()=>{if(received!==spec.bytes||digest.digest('hex')!==spec.sha256)finish(code('browser_integrity_failed'));else finish();});
   res.pipe(output);
  });
  request.on('timeout',()=>finish(code('browser_download_failed')));request.on('error',finish);
 });
}
function assertTree(root){
 const realRoot=fs.realpathSync(root);
 function walk(directory){for(const name of fs.readdirSync(directory)){const file=path.join(directory,name),s=fs.lstatSync(file);if(s.isSymbolicLink()){const real=fs.realpathSync(file);if(real!==realRoot&&!real.startsWith(realRoot+path.sep))throw code('browser_integrity_failed');}else if(s.isDirectory())walk(file);else if(!s.isFile())throw code('browser_integrity_failed');}}
 walk(root);
}
async function unpack(archive,directory,signal){
 const env=createBrowserEnvironment();
 await run('/usr/bin/ditto',['-x','-k',archive,directory],{env,signal,timeout:120000});
 assertTree(directory);
 // Google's pinned testing archive has an ad-hoc linker signature, not a
 // Developer ID resource seal. Verify the archive bytes and runtime version;
 // leave the vendor files, quarantine and all OS trust settings untouched.
 const executable=path.join(directory,RELATIVE);
 const {stdout}=await run(executable,['--version'],{env,signal,timeout:15000});
 if(!stdout.includes(SPEC.version))throw code('browser_integrity_failed');
}
class BrowserRuntime {
 constructor({root,onChange=()=>{},fetch=download,extract=unpack}){this.root=root;this.onChange=onChange;this.fetch=fetch;this.extract=extract;this.active=null;this.progress=0;this.closed=false;this.directory=path.join(root,'chrome-'+SPEC.version);this.executable=path.join(this.directory,RELATIVE);}
 ready(){
  try{const receipt=JSON.parse(fs.readFileSync(path.join(this.directory,'receipt.json'),'utf8'));return receipt.sha256===SPEC.sha256&&receipt.version===SPEC.version&&fs.lstatSync(this.directory).isDirectory()&&!fs.lstatSync(this.directory).isSymbolicLink()&&fs.statSync(this.executable).isFile()&&fs.realpathSync(this.executable).startsWith(fs.realpathSync(this.directory)+path.sep);}catch{return false;}
 }
 snapshot(){return {ready:this.ready(),preparing:!!this.active,progress:Math.floor(this.progress*100),downloadMegabytes:Math.ceil(SPEC.bytes/1048576),version:SPEC.version};}
 prepare(){
  if(this.closed)return Promise.reject(code('browser_download_failed'));
  if(this.active)return this.active.promise;
  if(this.ready())return Promise.resolve(this.snapshot());
  const controller=new AbortController(),active={controller,promise:null};this.active=active;
  active.promise=this.install(controller.signal).finally(()=>{if(this.active===active)this.active=null;this.onChange();});return active.promise;
 }
 async install(signal){
  fs.mkdirSync(this.root,{recursive:true,mode:0o700});
  if(fs.lstatSync(this.root).isSymbolicLink())throw code('browser_integrity_failed');
  const stage=path.join(this.root,'.download-'+randomUUID());fs.mkdirSync(stage,{mode:0o700});
  const archive=path.join(stage,'browser.zip'),tree=path.join(stage,'runtime');fs.mkdirSync(tree,{mode:0o700});
  try{
   this.progress=0;this.onChange();let last=0;
   await this.fetch(archive,{signal,onProgress:value=>{this.progress=value;if(Date.now()-last>400){last=Date.now();this.onChange();}}});
   signal.throwIfAborted();await this.extract(archive,tree,signal);signal.throwIfAborted();
   fs.writeFileSync(path.join(tree,'receipt.json'),JSON.stringify({version:SPEC.version,sha256:SPEC.sha256,source:SPEC.url})+'\n',{mode:0o600,flag:'wx'});
   // Never overwrite an existing runtime, profile, or unknown file.
   if(fs.existsSync(this.directory))throw code('browser_existing_runtime');
   fs.renameSync(tree,this.directory);return this.snapshot();
  }catch(error){if(['browser_integrity_failed','browser_existing_runtime'].includes(error.code))throw error;throw code('browser_download_failed');}
  finally{fs.rmSync(stage,{recursive:true,force:true});}
 }
 async close(){this.closed=true;this.active?.controller.abort();await this.active?.promise.catch(()=>{});}
}
module.exports={BrowserRuntime,SPEC,RELATIVE,download,assertTree};
