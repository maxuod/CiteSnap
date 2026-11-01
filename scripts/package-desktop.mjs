import {mkdirSync,cpSync,readFileSync,writeFileSync,existsSync,rmSync,lstatSync,readdirSync,readlinkSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {packager} from '@electron/packager';
import {prepareBrowser,root} from './prepare-browser.mjs';
import {signingConfig,signApp} from './mac-signing.mjs';
import {copyPortableTree,assertPortableTree} from './package-files.mjs';

const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
const out=join(root,'out',pkg.version),stage=join(out,'.desktop-stage'),target=join(out,'CiteSnap-darwin-arm64');
const signing=signingConfig(process.argv.slice(2));
mkdirSync(out,{recursive:true});
if(existsSync(target))throw Error('An existing candidate is present. Validate it before replacing or removing it.');
if(existsSync(stage))throw Error('A packaging stage already exists. Inspect it before continuing.');
mkdirSync(stage,{mode:0o700});
try{
 const appSource=join(stage,'source');mkdirSync(appSource);
 const allow=['desktop','lib','index.cjs','index.d.ts','licenses','LICENSE','NOTICE.md','source-provenance.json'];
 for(const item of allow)cpSync(join(root,item),join(appSource,item),{recursive:true,dereference:false,verbatimSymlinks:true});
 mkdirSync(join(appSource,'node_modules'));
 for(const dependency of Object.keys(pkg.dependencies))copyPortableTree(join(root,'node_modules',dependency),join(appSource,'node_modules',dependency));
 writeFileSync(join(appSource,'package.json'),JSON.stringify({name:'citesnap',productName:'CiteSnap',version:pkg.version,private:true,main:'desktop/main.cjs',dependencies:pkg.dependencies},null,2)+'\n');
 const electronVersion=pkg.devDependencies.electron;
 const apps=await packager({dir:appSource,out,name:'CiteSnap',appBundleId:'com.maxuod.answerpouch',appVersion:pkg.version,buildVersion:pkg.version,platform:'darwin',arch:'arm64',electronVersion,icon:join(root,'desktop/assets/answerpouch.icns'),asar:true,prune:false,overwrite:false,extendInfo:{NSHumanReadableCopyright:'CiteSnap · MAXUOD',NSAppTransportSecurity:{NSAllowsArbitraryLoads:false}}});
 const app=join(apps[0],'CiteSnap.app');
 assertPortableTree(app);const signed=await signApp(app,signing);
 const manifest=[];
 function walk(directory){for(const name of readdirSync(directory)){const file=join(directory,name),s=lstatSync(file);if(s.isDirectory())walk(file);else if(s.isFile())manifest.push({path:relative(app,file),bytes:s.size,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});else if(s.isSymbolicLink())manifest.push({path:relative(app,file),type:'symlink',target:readlinkSync(file)});}}
 walk(app);
 const receipt={product:'CiteSnap',version:pkg.version,target:'macOS Apple Silicon',electronVersion,browser:{bundled:false,preparation:"explicit official download on first use"},signing:signed,files:manifest};
 writeFileSync(join(out,'CiteSnap-'+pkg.version+'-build.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({app,version:pkg.version,signing:signed,browserBundled:false,fileCount:manifest.length}));
}finally{rmSync(stage,{recursive:true,force:true});}
