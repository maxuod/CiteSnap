import {cpSync,lstatSync,readdirSync,readlinkSync,realpathSync} from 'node:fs';
import {join,resolve,relative,isAbsolute} from 'node:path';

export function assertPortableTree(root){
 const base=realpathSync(root);
 function inside(file){const rel=relative(base,file);return rel===''||!rel.startsWith('..')&&!isAbsolute(rel);}
 function walk(dir){for(const name of readdirSync(dir)){const file=join(dir,name),s=lstatSync(file);if(s.isSymbolicLink()){
  const target=readlinkSync(file);
  if(isAbsolute(target)||!inside(resolve(dir,target))||!inside(realpathSync(file)))throw Error('A packaged symlink escapes its application.');
 }else if(s.isDirectory())walk(file);}}
 walk(base);
}
export function copyPortableTree(source,target){
 assertPortableTree(source);
 cpSync(source,target,{recursive:true,dereference:false,verbatimSymlinks:true});
 assertPortableTree(target);
}
