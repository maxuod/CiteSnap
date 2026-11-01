import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const {createBrowserEnvironment}=createRequire(import.meta.url)('../lib/browser-environment.cjs');

export const root=fileURLToPath(new URL('../',import.meta.url));
export function browserInfo(){
 if(process.platform!=='darwin'||process.arch!=='arm64')throw Error('This candidate supports Apple Silicon macOS only.');
 const engine=JSON.parse(readFileSync(join(root,'node_modules/playwright-core/browsers.json'),'utf8')).browsers.find(b=>b.name==='chromium');
 const directory=join(root,'.browser-runtime','chromium-'+engine.revision);
 const executable=join(directory,'chrome-mac-arm64','Google Chrome for Testing.app','Contents/MacOS/Google Chrome for Testing');
 return {engine,directory,executable};
}
export function prepareBrowser(){
 const info=browserInfo();
 if(!existsSync(join(info.directory,'INSTALLATION_COMPLETE'))||!existsSync(info.executable)){
  execFileSync(process.execPath,[join(root,'node_modules/playwright-core/cli.js'),'install','chromium','--no-shell'],{cwd:root,stdio:'inherit',env:{...process.env,PLAYWRIGHT_BROWSERS_PATH:join(root,'.browser-runtime')}});
 }
 const version=execFileSync(info.executable,['--version'],{encoding:'utf8',timeout:15000,env:createBrowserEnvironment()}).trim();
 if(!version.includes(info.engine.browserVersion))throw Error('Bundled browser version does not match the pinned runtime.');
 const receipt={source:'Playwright official Chromium distribution',playwright:JSON.parse(readFileSync(join(root,'node_modules/playwright-core/package.json'))).version,revision:info.engine.revision,version:info.engine.browserVersion,sourceExecutableSha256:createHash('sha256').update(readFileSync(info.executable)).digest('hex'),vendorSignatureVerified:false,signingNote:'Upstream testing build has a linker ad-hoc signature. The packaged copy is separately signed and verified as part of the local application.'};
 writeFileSync(join(root,'.browser-runtime','provenance.json'),JSON.stringify(receipt,null,2)+'\n');
 return {...info,receipt};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const info=prepareBrowser();console.log(JSON.stringify(info.receipt));}
