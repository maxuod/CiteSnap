import {readFileSync,lstatSync} from 'node:fs';
import {isAbsolute} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {sign} from '@electron/osx-sign';

function privateFile(file,executable=false){
 const s=lstatSync(file);
 if(!s.isFile()||s.isSymbolicLink()||(s.mode&0o077)||s.uid!==process.getuid()||(executable&&!(s.mode&0o100)))throw Error('Signing configuration must be private and owned by the current user.');
}
export function signingConfig(argv){
 const flag=argv.indexOf('--local-signing-config');
 if(flag>=0){
  const file=argv[flag+1];if(!file||!isAbsolute(file))throw Error('Use an absolute private signing configuration path.');privateFile(file);
  const c=JSON.parse(readFileSync(file,'utf8'));
  if(c.schema!=='geo-local-build-signing-v1'||!/^[A-Fa-f0-9]{40}$/.test(c.identity)||![c.keychain,c.passwordFile,c.helper].every(p=>typeof p==='string'&&isAbsolute(p)))throw Error('Invalid local signing configuration.');
  privateFile(c.passwordFile);privateFile(c.helper,true);
  try{execFileSync(c.helper,['unlock',c.keychain,c.passwordFile],{stdio:'pipe',timeout:30000});}catch{throw Error('Local build signing keychain could not be unlocked.');}
  return {...c,kind:'local-certificate',publicDistribution:false};
 }
 const identity=process.env.CITESNAP_CODESIGN_IDENTITY||process.env.ANSWERPOUCH_CODESIGN_IDENTITY,keychain=process.env.CITESNAP_CODESIGN_KEYCHAIN||process.env.ANSWERPOUCH_CODESIGN_KEYCHAIN;
 if(!identity||identity==='-'||/[\r\n\0]/.test(identity)||keychain&&!isAbsolute(keychain))throw Error('Configure a signing identity, or pass --local-signing-config for a local candidate.');
 return {identity,keychain,kind:'certificate',publicDistribution:false};
}
export async function signApp(app,config){
 await sign({app,platform:'darwin',identity:config.identity,...(config.keychain?{keychain:config.keychain}:{}),identityValidation:config.kind!=='local-certificate',preAutoEntitlements:false,preEmbedProvisioningProfile:false,strictVerify:true,
  optionsForFile:()=>({entitlements:['com.apple.security.cs.allow-jit'],hardenedRuntime:config.kind!=='local-certificate',...(config.kind==='local-certificate'?{timestamp:'none'}:{})})});
 execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',app],{stdio:'pipe'});
 const inspected=spawnSync('/usr/bin/codesign',['-dr','-',app],{encoding:'utf8'});
 const requirement=inspected.stdout+inspected.stderr;
 if(inspected.status||!requirement.includes('identifier "com.maxuod.answerpouch"')||!/(certificate (leaf|root|\d+)|anchor (apple|H"))/.test(requirement))throw Error('Certificate-bound CiteSnap signing requirement was not established.');
 return {kind:config.kind,certificateBound:true,notarized:false,publicDistribution:false};
}
