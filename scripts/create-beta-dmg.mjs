import {existsSync,mkdirSync,symlinkSync,cpSync,writeFileSync,readFileSync,statSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {root} from './prepare-browser.mjs';
import {copyPortableTree,assertPortableTree} from './package-files.mjs';
const version=JSON.parse(readFileSync(join(root,'package.json'))).version;
const out=join(root,'out'),app=join(out,version,'AnswerPouch-darwin-arm64/AnswerPouch.app');
const stage=join(out,'.beta-dmg-'+version),filename=`AnswerPouch-${version}-mac-arm64-beta.dmg`,image=join(out,filename);
if(existsSync(stage)||existsSync(image))throw Error('Existing beta stage/image: inspect it; never overwrite a published artifact.');
assertPortableTree(app);execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',app],{stdio:'pipe'});
if(existsSync(join(app,'Contents/Resources/browser')))throw Error('Do not redistribute the external testing browser.');
mkdirSync(stage,{mode:0o700});
try{
 copyPortableTree(app,join(stage,'AnswerPouch.app'));symlinkSync('/Applications',join(stage,'Applications'));
 cpSync(join(root,'docs/INSTALL.md'),join(stage,'Read First - Install and sign in.txt'));
 cpSync(join(root,'LICENSE'),join(stage,'LICENSE.txt'));cpSync(join(root,'NOTICE.md'),join(stage,'Third-party notices.txt'));
 cpSync(join(root,'licenses'),join(stage,'licenses'),{recursive:true});
 execFileSync('/usr/bin/hdiutil',['create','-volname','AnswerPouch Beta','-srcfolder',stage,'-format','UDZO',image],{stdio:'inherit',timeout:120000});
 execFileSync('/usr/bin/hdiutil',['verify',image],{stdio:'pipe',timeout:120000});
 const sha256=createHash('sha256').update(readFileSync(image)).digest('hex');
 writeFileSync(join(out,'SHA256SUMS.txt'),`${sha256}  ${filename}\n`);
 cpSync(join(root,'docs/INSTALL.md'),join(out,'AnswerPouch-Install.md'));
 const receipt={version,tag:`v${version}-beta.1`,filename,bytes:statSync(image).size,sha256,preRelease:true,notarized:false,developerId:false,browserBundled:false,cleanMachineAcceptance:false};
 writeFileSync(join(out,'beta-release.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}finally{rmSync(stage,{recursive:true,force:true});}
