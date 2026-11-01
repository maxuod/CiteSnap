const {app,BrowserWindow,ipcMain,dialog,protocol,shell}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const {createChromeCollector}=require('../lib/chrome-collector.cjs');
const {LocalWorkspace,freezeQuestions,readJson}=require('../lib/local-workspace.cjs');
const {BrowserRuntime}=require('../lib/browser-runtime.cjs');
const {configureIdentity}=require('./identity.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'answerpouch',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
// Test data stays in a fresh, explicitly selected developer-only workspace.
let qaDataPath;
if(!app.isPackaged&&(process.env.CITESNAP_QA_DATA_DIR||process.env.ANSWERPOUCH_QA_DATA_DIR)){
 const qa=process.env.CITESNAP_QA_DATA_DIR||process.env.ANSWERPOUCH_QA_DATA_DIR,stat=fs.lstatSync(qa);
 if(!path.isAbsolute(qa)||!['citesnap-qa-','answerpouch-qa-'].some(prefix=>path.basename(qa).startsWith(prefix))||!stat.isDirectory()||stat.isSymbolicLink()||stat.uid!==process.getuid())throw Error('Invalid QA directory.');
 qaDataPath=qa;
}
configureIdentity(app,{qaDataPath});
let window,workspace,runtime,lastFrozenFile,quitting=false;
const origin='answerpouch://desktop';
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css','/assets/getaudit-app.png':'assets/getaudit-app.png','/assets/bricolage-800.ttf':'assets/bricolage-800.ttf'};
const csp="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'";
function browserPath(){
 if(app.isPackaged)return runtime.executable;
 const own=path.join(__dirname,'..','.browser-runtime');
 if(fs.existsSync(own)){for(const name of fs.readdirSync(own))if(name.startsWith('chromium-')){const p=path.join(own,name,'chrome-mac-arm64','Google Chrome for Testing.app','Contents','MacOS','Google Chrome for Testing');if(fs.existsSync(p))return p;}}
 return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}
function validSender(event){if(!window||event.sender!==window.webContents||event.senderFrame!==window.webContents.mainFrame||!event.senderFrame.url.startsWith(origin+'/'))throw Error('invalid_sender');}
function bind(name,action){ipcMain.handle('answerpouch:'+name,async(event,input)=>{try{validSender(event);return {ok:true,value:await action(input)};}catch(error){const code=typeof error.code==='string'?error.code:'operation_failed';return {ok:false,code};}});}
function privateWrite(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600,flush:true});}
function safeId(value){if(typeof value!=='string'||!/^[a-f0-9-]{36}$/.test(value))throw Error('invalid_id');return value;}
async function setup(){
 protocol.handle('answerpouch',request=>{
  const url=new URL(request.url),relative=url.host==='desktop'?files[url.pathname]:null;
  if(!relative)return new Response('Not found',{status:404});
  const type=relative.endsWith('.html')?'text/html':relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':relative.endsWith('.ttf')?'font/ttf':'image/png';
  return new Response(fs.readFileSync(path.join(__dirname,relative)),{headers:{'Content-Type':type,'Content-Security-Policy':csp,'X-Content-Type-Options':'nosniff'}});
 });
 const root=path.join(app.getPath('userData'),'workspace');
 const send=()=>{if(window&&!window.isDestroyed())window.webContents.send('answerpouch:changed');};
 runtime=new BrowserRuntime({root:path.join(app.getPath('userData'),'runtime'),onChange:send});
 const collector=createChromeCollector({executablePath:browserPath(),hostEnvironment:true,profileRoot:path.join(app.getPath('userData'),'profiles','chrome-for-testing')});
 workspace=new LocalWorkspace({root,collector});
 workspace.on('change',send);
 bind('state',()=>({...workspace.snapshot(),browserSetup:{...runtime.snapshot(),ready:collector.available().available}}));
 bind('prepare-browser',()=>{workspace.ensureIdle();return runtime.prepare();});
 bind('freeze',async input=>{
  const frozen=freezeQuestions(input||{});
  const result=await dialog.showSaveDialog(window,{title:'Freeze questions / 冻结问题',defaultPath:frozen.name.replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,80)+'.questions.json',filters:[{name:'Frozen questions',extensions:['json']}]});
  if(result.canceled)return null;privateWrite(result.filePath,frozen);lastFrozenFile=result.filePath;
  return {name:frozen.name,hash:frozen.hash,count:frozen.questions.length,filename:path.basename(result.filePath)};
 });
 bind('import',async()=>{const result=await dialog.showOpenDialog(window,{title:'Import frozen questions / 导入冻结问题',properties:['openFile'],filters:[{name:'Frozen questions',extensions:['json']}]});if(result.canceled)return null;return workspace.importQuestions(readJson(result.filePaths[0],2*1024*1024));});
 bind('import-last',async()=>{if(!lastFrozenFile)throw Object.assign(Error(),{code:'import_questions_first'});return workspace.importQuestions(readJson(lastFrozenFile,2*1024*1024));});
 function browserReady(){if(app.isPackaged&&!runtime.ready())throw Object.assign(Error(),{code:'browser_unavailable'});}
 bind('login',source=>{browserReady();return workspace.login(source);});bind('check-login',source=>{browserReady();return workspace.checkLogin(source);});
 bind('preview',sources=>workspace.preview(Array.isArray(sources)?sources:[]));
 bind('start',request=>{browserReady();return workspace.start(request);});bind('stop',()=>workspace.stop());
 bind('evidence',id=>workspace.evidence(safeId(id)));
 bind('export',async id=>{const report=workspace.exportRun(safeId(id));const result=await dialog.showSaveDialog(window,{title:'Export evidence / 导出证据',defaultPath:'CiteSnap-'+report.run.createdAt.slice(0,10)+'-'+id.slice(0,8)+'.json',filters:[{name:'Evidence JSON',extensions:['json']}]});if(result.canceled)return null;privateWrite(result.filePath,report);return {filename:path.basename(result.filePath)};});
 bind('open-source',async input=>{const evidence=workspace.evidence(safeId(input?.taskId));if(typeof input.url!=='string'||!evidence.capture.citations.some(c=>c.url===input.url)||!/^https?:\/\//.test(input.url))throw Error('invalid_source');await shell.openExternal(input.url);return true;});
 window=new BrowserWindow({width:1180,height:880,minWidth:860,minHeight:650,backgroundColor:'#fffaf6',title:'CiteSnap',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 window.webContents.session.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',event=>event.preventDefault());
 window.on('focus',()=>{void workspace.verifyOnFocus();});
 window.on('closed',()=>{window=null;app.quit();});
 await window.loadURL(origin+'/');
}
if(!app.requestSingleInstanceLock())app.quit();else{
 app.whenReady().then(setup).catch(()=>{if(quitting)return;dialog.showErrorBox('CiteSnap','The local workspace could not open. Your saved files have not been deleted. / 无法打开本地工作区，已有文件未删除。');app.quit();});
 app.on('second-instance',()=>{window?.show();window?.focus();});
 app.on('before-quit',event=>{if(quitting||!workspace)return;event.preventDefault();quitting=true;void Promise.allSettled([runtime.close(),workspace.close()]).finally(()=>app.quit());});
 app.on('window-all-closed',()=>app.quit());
}
