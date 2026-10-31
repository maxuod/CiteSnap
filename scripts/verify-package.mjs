import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,readlinkSync,rmSync,readdirSync,lstatSync,writeFileSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import {strict as assert} from 'node:assert';
import {extractAll} from '@electron/asar';
import {root} from './prepare-browser.mjs';
import {assertPortableTree} from './package-files.mjs';
const require=createRequire(import.meta.url),{_electron,chromium}=require('playwright-core');
const {createBrowserEnvironment}=require('../lib/browser-environment.cjs');
const candidate=join(root,'out/AnswerPouch-darwin-arm64/AnswerPouch.app');
const receipt=JSON.parse(readFileSync(join(root,'out/AnswerPouch-0.2.0-build.json'),'utf8'));
const artifactsOnly=process.argv.includes('--artifacts-only');
const qa=mkdtempSync(join(tmpdir(),'answerpouch-package-qa-'));let app,context,server;let parity=0;
try{
 assertPortableTree(candidate);execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',candidate],{stdio:'pipe'});
 for(const entry of receipt.files){const file=join(candidate,entry.path);if(entry.type==='symlink')assert.equal(readlinkSync(file),entry.target);else assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),entry.sha256,entry.path);}
 const extracted=join(qa,'source');extractAll(join(candidate,'Contents/Resources/app.asar'),extracted);
 function compare(directory){for(const name of readdirSync(join(root,directory))){const item=join(directory,name);if(lstatSync(join(root,item)).isDirectory())compare(item);else{assert.deepEqual(readFileSync(join(extracted,item)),readFileSync(join(root,item)),item);parity++;}}}
 compare('desktop');compare('lib');for(const item of ['index.cjs','index.d.ts','source-provenance.json','NOTICE.md']){assert.deepEqual(readFileSync(join(extracted,item)),readFileSync(join(root,item)),item);parity++;}
 if(!artifactsOnly){const data=join(qa,'user-data');
 app=await _electron.launch({executablePath:join(candidate,'Contents/MacOS/AnswerPouch'),args:['--user-data-dir='+data],env:createBrowserEnvironment(),timeout:30000});
 assert.equal(realpathSync(await app.evaluate(({app})=>app.getPath('userData'))),realpathSync(data),'Packaged QA must use isolated data');
 const page=await app.firstWindow();await page.locator('[data-action="language"]').waitFor();
 const state=await page.evaluate(()=>window.answerpouch.state());assert.equal(state.ok,true);assert.equal(state.value.available.available,true);assert.equal(state.value.selected,null);assert.deepEqual(state.value.runs,[]);
 await app.close();app=null;}
 server=createServer((_req,res)=>{res.setHeader('content-type','text/html');res.end('<title>AnswerPouch localhost fixture</title><p>Synthetic local browser acceptance</p>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const executablePath=join(candidate,'Contents/Resources/browser/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
 const profile=join(qa,'browser-profile');const options={executablePath,headless:true,env:createBrowserEnvironment(),permissions:[],serviceWorkers:'block',chromiumSandbox:true};
 const observed=[];
 for(let i=0;i<2;i++){
  context=await chromium.launchPersistentContext(profile,options);
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const p=await context.newPage();await p.goto(origin);
  if(!i)await p.evaluate(()=>{localStorage.setItem('answerpouch-fixture','synthetic');document.cookie='fixture=synthetic; Max-Age=86400; SameSite=Lax';});
  const result=await p.evaluate(()=>({local:localStorage.getItem('answerpouch-fixture'),cookie:document.cookie,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,locale:navigator.language}));
  assert.equal(result.local,'synthetic');assert.ok(result.cookie.includes('fixture=synthetic'));observed.push({timezone:result.timezone,locale:result.locale});
  await context.close();context=null;
 }
 const result={passed:true,manifestEntries:receipt.files.length,sourceFilesMatch:parity,packagedElectronLaunch:!artifactsOnly,bundledBrowserLaunches:2,localhostPersistence:true,browserHostDefaults:observed,minimalEnvironmentKeys:Object.keys(options.env).sort(),syntheticData:true,realProviderRequests:0,cleanMachineAcceptance:false,notarized:false};
 writeFileSync(join(root,'docs/packaged-check.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{if(app)await app.close();if(context)await context.close();if(server)await new Promise(resolve=>server.close(resolve));rmSync(qa,{recursive:true,force:true});}
