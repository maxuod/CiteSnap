import {afterEach,expect,it} from 'vitest';
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync,readdirSync,symlinkSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {PassThrough} from 'node:stream';
import {EventEmitter} from 'node:events';
const require=createRequire(import.meta.url);
const {BrowserRuntime,RELATIVE,SPEC,download,assertTree}=require('../lib/browser-runtime.cjs');
const roots:string[]=[];
function root(){const r=mkdtempSync(join(tmpdir(),'answerpouch-runtime-'));roots.push(r);return r;}
afterEach(()=>roots.splice(0).forEach(r=>rmSync(r,{recursive:true,force:true})));
function fakeExtract(_archive:string,directory:string){mkdirSync(join(directory,RELATIVE,'..'),{recursive:true});writeFileSync(join(directory,RELATIVE),'synthetic executable');}
it('does nothing at startup; explicit prepare installs once and reopening reuses its receipt',async()=>{
 const directory=root();let requests=0;
 const runtime=new BrowserRuntime({root:directory,fetch:async()=>{requests++;},extract:fakeExtract});
 expect(runtime.snapshot()).toMatchObject({ready:false,preparing:false});expect(requests).toBe(0);
 const first=runtime.prepare(),second=runtime.prepare();expect(first).toBe(second);await first;
 expect(requests).toBe(1);expect(runtime.ready()).toBe(true);expect(JSON.parse(readFileSync(join(runtime.directory,'receipt.json'),'utf8')).sha256).toBe(SPEC.sha256);
 const reopened=new BrowserRuntime({root:directory,fetch:()=>{throw Error('unexpected request');}});await reopened.prepare();expect(reopened.ready()).toBe(true);
});
it('preserves existing runtime and sibling account/evidence bytes rather than overwriting them',async()=>{
 const directory=root();const runtime=new BrowserRuntime({root:directory,fetch:async()=>{},extract:fakeExtract});
 mkdirSync(runtime.directory);writeFileSync(join(runtime.directory,'owner-file'),'original');writeFileSync(join(directory,'profiles'),'preserved');
 await expect(runtime.prepare()).rejects.toThrow('browser_existing_runtime');
 expect(readFileSync(join(runtime.directory,'owner-file'),'utf8')).toBe('original');expect(readFileSync(join(directory,'profiles'),'utf8')).toBe('preserved');expect(readdirSync(directory).some(x=>x.startsWith('.download-'))).toBe(false);
});
it('cancellation drains the request and removes only its temporary stage without automatic retry',async()=>{
 let requests=0;const directory=root();
 const runtime=new BrowserRuntime({root:directory,fetch:async(_file:string,{signal}:any)=>{requests++;await new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true}));},extract:fakeExtract});
 const prepared=runtime.prepare();await runtime.close();await expect(prepared).rejects.toThrow('browser_download_failed');
 expect(requests).toBe(1);expect(readdirSync(directory)).toEqual([]);expect(runtime.ready()).toBe(false);
});
it('failed verification retains no installed browser and never automatically retries',async()=>{
 let requests=0;const runtime=new BrowserRuntime({root:root(),fetch:async()=>{requests++;throw Object.assign(Error('bad hash'),{code:'browser_integrity_failed'});},extract:fakeExtract});
 await expect(runtime.prepare()).rejects.toThrow('bad hash');expect(requests).toBe(1);expect(existsSync(runtime.directory)).toBe(false);
});
it('rejects symlinks outside the downloaded tree, while preserving relative framework links',()=>{
 const directory=root();mkdirSync(join(directory,'Versions/A'),{recursive:true});writeFileSync(join(directory,'Versions/A/file'),'fixture');symlinkSync('A',join(directory,'Versions/Current'));
 expect(()=>assertTree(directory)).not.toThrow();symlinkSync('/tmp',join(directory,'outside'));expect(()=>assertTree(directory)).toThrow('browser_integrity_failed');
});
function transport(status:number,body:Buffer,declared=body.length){return (_url:string,_options:any,callback:any)=>{
 const request:any=new EventEmitter();request.destroy=()=>{};
 queueMicrotask(()=>{const response:any=new PassThrough();response.statusCode=status;response.headers={'content-length':String(declared)};callback(response);response.end(body);});return request;
};}
it('accepts only the exact pinned bytes and SHA-256 before extraction',async()=>{
 const body=Buffer.from('official synthetic zip'),spec={url:SPEC.url,bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')},file=join(root(),'download');
 await download(file,{signal:new AbortController().signal},spec,transport(200,body));expect(readFileSync(file)).toEqual(body);
 await expect(download(join(root(),'wrong'),{signal:new AbortController().signal},{...spec,sha256:'0'.repeat(64)},transport(200,body))).rejects.toThrow('browser_integrity_failed');
});
it.each([302,404,500])('refuses HTTP %i without following redirects or installing any bytes',async status=>{
 const file=join(root(),'download');await expect(download(file,{signal:new AbortController().signal},SPEC,transport(status,Buffer.alloc(0)))).rejects.toThrow('browser_download_failed');expect(existsSync(file)).toBe(false);
});
it('refuses changed download size before writing the archive',async()=>{
 const file=join(root(),'download');await expect(download(file,{signal:new AbortController().signal},SPEC,transport(200,Buffer.from('unexpected')))).rejects.toThrow('browser_download_failed');expect(existsSync(file)).toBe(false);
});
