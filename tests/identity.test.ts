import {afterEach,expect,it} from 'vitest';
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,symlinkSync,existsSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const require=createRequire(import.meta.url);
const {configureIdentity}=require('../desktop/identity.cjs');
const roots:string[]=[];
function fixture(switchValue=''){
 const root=mkdtempSync(join(tmpdir(),'citesnap-identity-'));roots.push(root);
 const paths:any={appData:root,userData:join(root,'CiteSnap'),sessionData:join(root,'CiteSnap')};let name='';
 const app={commandLine:{getSwitchValue:()=>switchValue},getPath:(key:string)=>paths[key],setPath:(key:string,value:string)=>{paths[key]=value;},setName:(value:string)=>{name=value;}};
 return {root,paths,app,name:()=>name};
}
afterEach(()=>roots.splice(0).forEach(root=>rmSync(root,{recursive:true,force:true})));
it('changes the display name while keeping the default legacy data and session path',()=>{
 const f=fixture(),legacy=join(f.root,'AnswerPouch');mkdirSync(legacy);writeFileSync(join(legacy,'saved-record'),'synthetic prior bytes');
 expect(configureIdentity(f.app)).toBe(legacy);expect(f.name()).toBe('CiteSnap');expect(f.paths.userData).toBe(legacy);expect(f.paths.sessionData).toBe(legacy);
 expect(readFileSync(join(legacy,'saved-record'),'utf8')).toBe('synthetic prior bytes');expect(existsSync(join(f.root,'CiteSnap'))).toBe(false);
});
it('uses an explicit user-data directory for isolated packaged runs without touching default data',()=>{
 const f=fixture();const explicit=join(f.root,'isolated');f.app.commandLine.getSwitchValue=()=>explicit;
 configureIdentity(f.app);expect(f.paths.userData).toBe(explicit);expect(f.paths.sessionData).toBe(explicit);expect(existsSync(join(f.root,'AnswerPouch'))).toBe(false);
});
it('honors a validated developer fixture before resolving the default directory',()=>{
 const f=fixture(),qa=join(f.root,'citesnap-qa-fixture');configureIdentity(f.app,{qaDataPath:qa});
 expect(f.paths.userData).toBe(qa);expect(existsSync(join(f.root,'AnswerPouch'))).toBe(false);
});
it('refuses a linked application-data root instead of opening it under the renamed app',()=>{
 const f=fixture(),target=join(f.root,'other-data');mkdirSync(target);writeFileSync(join(target,'owner-record'),'unchanged');symlinkSync(target,join(f.root,'AnswerPouch'));
 expect(()=>configureIdentity(f.app)).toThrow('Application data directory');expect(readFileSync(join(target,'owner-record'),'utf8')).toBe('unchanged');
});
it('refuses a relative directory instead of treating it as an alternate user profile',()=>{
 const f=fixture('relative-data');expect(()=>configureIdentity(f.app)).toThrow('Invalid application data');expect(existsSync(join(f.root,'AnswerPouch'))).toBe(false);
});
