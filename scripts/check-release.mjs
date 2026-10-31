// Read-only distribution gate. Does not upload, sign, modify trust or disable security.
import {execFileSync,spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {root} from './prepare-browser.mjs';
const app=join(root,'out/AnswerPouch-darwin-arm64/AnswerPouch.app');
function fail(reason){console.log(JSON.stringify({ready:false,reason}));process.exit(1);}
try{execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',app],{stdio:'pipe'});}catch{fail('signature_invalid_or_missing');}
const signature=spawnSync('/usr/bin/codesign',['-dv','--verbose=4',app],{encoding:'utf8'});
const text=signature.stdout+signature.stderr;
if(signature.status||!text.includes('Authority=Developer ID Application:')||!text.includes('(runtime)'))fail('developer_id_and_hardened_runtime_required');
try{execFileSync('/usr/bin/xcrun',['stapler','validate',app],{stdio:'pipe',timeout:30000});}catch{fail('accepted_stapled_notarization_required');}
try{execFileSync('/usr/sbin/spctl',['--assess','--type','execute',app],{stdio:'pipe',timeout:30000});}catch{fail('gatekeeper_assessment_failed');}
console.log(JSON.stringify({ready:true,scope:'local signature, stapled notarization and Gatekeeper checks only',cleanMachineAcceptance:false,realPlatformAcceptance:false}));
