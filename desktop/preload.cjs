const {contextBridge,ipcRenderer}=require('electron');
const invoke=(name,input)=>ipcRenderer.invoke('answerpouch:'+name,input);
contextBridge.exposeInMainWorld('answerpouch',{
 state:()=>invoke('state'),prepareBrowser:()=>invoke('prepare-browser'),freeze:input=>invoke('freeze',input),import:()=>invoke('import'),importLast:()=>invoke('import-last'),
 login:source=>invoke('login',source),checkLogin:source=>invoke('check-login',source),preview:sources=>invoke('preview',sources),
 start:input=>invoke('start',input),stop:()=>invoke('stop'),evidence:id=>invoke('evidence',id),export:id=>invoke('export',id),
 openSource:input=>invoke('open-source',input),onChange:callback=>{const listener=()=>callback();ipcRenderer.on('answerpouch:changed',listener);return()=>ipcRenderer.removeListener('answerpouch:changed',listener);}
});
