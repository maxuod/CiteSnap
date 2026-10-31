import {it,expect} from 'vitest';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,readlinkSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {copyPortableTree,assertPortableTree} from '../scripts/package-files.mjs';

it('keeps framework links portable after moving and refuses absolute/outside links before signing',()=>{
 const root=mkdtempSync(join(tmpdir(),'answerpouch-package-'));
 try{
  const source=join(root,'source'),target=join(root,'target');mkdirSync(join(source,'Versions','A'),{recursive:true});writeFileSync(join(source,'Versions/A/Framework'),'synthetic binary');
  symlinkSync('A',join(source,'Versions/Current'));symlinkSync('Versions/Current/Framework',join(source,'Framework'));
  copyPortableTree(source,target);expect(readlinkSync(join(target,'Framework'))).toBe('Versions/Current/Framework');
  rmSync(source,{recursive:true});expect(()=>assertPortableTree(target)).not.toThrow();
  symlinkSync(join(root,'target/Framework'),join(target,'absolute'));expect(()=>assertPortableTree(target)).toThrow();
  rmSync(join(target,'absolute'));writeFileSync(join(root,'outside'),'not bundled');symlinkSync('../outside',join(target,'escape'));expect(()=>assertPortableTree(target)).toThrow();
 }finally{rmSync(root,{recursive:true,force:true});}
});
