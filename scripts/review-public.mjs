// Local source boundaries; a real secrets scanner is a separate release check.
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const forbidden=/(^|\/)(node_modules|out|\.private|profiles|artifacts|\.browser-runtime)\/|(^|\/)\.env($|\.)|\.(db|sqlite|enc|dmg|p12|pfx|key|pem|questions\.json)$/i;
const failures=files.filter(f=>forbidden.test(f));
for(const file of files){if(!/\.(?:[cm]?js|ts|json|ya?ml|md|txt)$/.test(file)||!existsSync(file))continue;const body=readFileSync(file,'utf8');if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(body))failures.push(file+': private key');}
const pkg=JSON.parse(readFileSync('package.json','utf8'));
if(pkg.private!==true||pkg.license!=='MIT')failures.push('package metadata');
for(const required of ['LICENSE','NOTICE.md','PRIVACY.md','SECURITY.md','CONTRIBUTING.md','docs/INSTALL.md'])if(!existsSync(required))failures.push(required);
if(failures.length){console.error(JSON.stringify({passed:false,failures}));process.exit(1);}
console.log(JSON.stringify({passed:true,trackedFiles:files.length,scope:'file boundaries, metadata and private-key markers; not a full secrets audit'}));
