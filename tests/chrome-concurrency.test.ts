import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const require=createRequire(import.meta.url);
const source=readFileSync(new URL('../lib/chrome-collector.cjs',import.meta.url),'utf8');
function fixture(withProfiles=false,options:any={}){
  let launches=0;const contexts:any[]=[],launchOptions:any[]=[],otherBrowsers:any[]=[];let release!:()=>void,launchError:Error|undefined;
  const launched=new Promise<void>(r=>{release=r;});
  const browser={closed:false,isConnected:()=>!browser.closed,version:()=> 'synthetic',close:async()=>{browser.closed=true;},newContext:async(options?:unknown)=>{
    const ctx:any={options,closed:false,storageOptions:null,grantPermissions:async()=>{},close:async()=>{ctx.closed=true;ctx.page.closed=true;},storageState:async(options:unknown)=>{ctx.storageOptions=options;return {cookies:[{name:'synthetic',value:'SYNTHETIC TOKEN'}],origins:[]};}};
    ctx.page={closed:false,destination:'',goto:async(url:string)=>{ctx.page.destination=url;},isClosed:()=>ctx.page.closed,
      fronts:0,close:async()=>{ctx.page.closed=true;},url:()=>ctx.page.destination,bringToFront:async()=>{ctx.page.fronts++;},
      snapshot:{body:'Verify you are human',controls:[],answer:'',citations:[],signedOut:true,model:'synthetic'},
      evaluate:async(_fn:unknown,args:unknown)=>args?ctx.page.snapshot:'denied'};
    ctx.newPage=async()=>{ctx.page.closed=false;return ctx.page;};contexts.push(ctx);return ctx;
  }};
  const remembered=new Set<string>();let activeProfile:any;
  const profiles={has:(surface:string)=>remembered.has(surface),markVerified:(surface:string)=>remembered.add(surface),
    update:async(_surface:string,_context:any)=>{},
    open:async(_surface:string,_config:unknown,mode:string)=>{
      if(!activeProfile||activeProfile.closed)activeProfile=await browser.newContext();
      const context=activeProfile;return {context,mode,alive:()=>!context.closed};
    },close:async()=>{await activeProfile?.close();},forget:async(surface:string)=>{remembered.delete(surface);await activeProfile?.close();}};
  const module={exports:{} as any};
  runInNewContext(source,{module,require:(name:string)=>{
    if(name==='playwright-core')return {chromium:{launch:async(options:unknown)=>{launches++;launchOptions.push(options);await launched;if(launchError)throw launchError;if(launches===1)return browser;const b={...browser,closed:false,isConnected:()=>!b.closed,close:async()=>{b.closed=true;}};otherBrowsers.push(b);return b;}}};
    if(name==='node:timers/promises')return {setTimeout:async()=>{await Promise.resolve();}};
    if(name.startsWith('./'))return require('../lib/'+name.slice(2));
    return require(name);
  },AbortController,Buffer,URL});
  const newCollector=()=>module.exports.createChromeCollector({...options,...(withProfiles?{profiles}:{})});
  return {collector:newCollector(),newCollector,profiles,remembered,contexts,browser,otherBrowsers,launchOptions,release,failLaunch:()=>{launchError=new Error('Synthetic launch failed');},launches:()=>launches};
}
const task=(surface:string)=>({planId:'synthetic-plan',slotId:'slot-'+surface,prompt:'Synthetic question for '+surface,surface,config:{accountMode:'signed_out',locale:'en-CA',timezone:'UTC'},timeoutSeconds:45,captureScreenshot:false,verifiedCountry:null,geoVerificationNote:''});
describe('Chrome parallel session isolation with a synthetic browser',()=>{
  it('uses the bundled executable with host defaults and no location, timezone or proxy override',async()=>{
    const f=fixture(false,{hostEnvironment:true,executablePath:'/synthetic/bundled/browser'});f.release();
    await f.collector.collect(task('gemini'),new AbortController().signal,()=>{});
    expect(f.launchOptions[0].executablePath).toBe('/synthetic/bundled/browser');
    expect(f.launchOptions[0]).not.toHaveProperty('proxy');
    expect(Object.keys(f.launchOptions[0].env).every(k=>['HOME','PATH','TMPDIR','LANG'].includes(k))).toBe(true);
    expect(f.contexts[0].options).not.toHaveProperty('timezoneId');expect(f.contexts[0].options).not.toHaveProperty('locale');
    expect(f.contexts[0].options).not.toHaveProperty('geolocation');expect(f.contexts[0].options.permissions).toEqual([]);
    await f.collector.close();
  });

  it('keeps confirmed account preparation after closing its page and reopens the same context',async()=>{
    const f=fixture(true);f.release();const signed={...task('chatgpt_search'),config:{...task('chatgpt_search').config,accountMode:'isolated'}};
    await f.collector.prepareSession(signed);const login=f.contexts[0];login.page.snapshot={body:'',signedIn:true};
    await f.collector.verifySession(signed.planId,signed.surface);await login.page.close();
    expect(f.collector.ready(signed.planId,[signed.surface])).toBe(true);expect(f.collector.savedSession(signed.surface)).toBe(true);
    await f.collector.prepareSession(signed);expect(f.contexts).toHaveLength(1);expect(login.closed).toBe(false);
    await f.collector.close();
  });
  it('retains the saved profile at batch close and restores it after a collector restart without a login window',async()=>{
    const f=fixture(true);f.release();const signed={...task('chatgpt_search'),config:{...task('chatgpt_search').config,accountMode:'isolated'},browserMode:'silent'};
    await f.collector.prepareSession(signed);f.contexts[0].page.snapshot={body:'',signedIn:true};await f.collector.verifySession(signed.planId,signed.surface);
    await f.collector.close();const next=f.newCollector();
    expect(next.ready(signed.planId,[signed.surface])).toBe(false);expect(next.canRestore(signed.planId,[signed.surface])).toBe(true);
    const result=await next.collect(signed,new AbortController().signal,()=>{});
    expect(f.launchOptions.map(options=>options.headless)).toEqual([true]);expect(f.contexts[2].options.storageState.cookies[0].value).toBe('SYNTHETIC TOKEN');
    expect(JSON.stringify(result)).not.toContain('SYNTHETIC TOKEN');expect(next.savedSession(signed.surface)).toBe(true);await next.close();
  });
  it.each(['isolated','signed_in_private'])('stops expired saved %s accounts before submitting instead of opening a login window',async accountMode=>{
    const f=fixture(true);f.release();f.remembered.add('chatgpt_search');
    let submitted=0;const create=f.browser.newContext;
    f.browser.newContext=async options=>{const ctx=await create(options);ctx.page.snapshot={body:'',signedIn:false,signedOut:true,controls:[],answer:'',citations:[],model:'synthetic'};
      const empty={all:async()=>[],or(){return this;}};ctx.page.getByRole=()=>empty;
      ctx.page.locator=()=>({all:async()=>[{isVisible:async()=>true,fill:async()=>{submitted++;},press:async()=>{submitted++;}}]});return ctx;};
    const result=await f.collector.collect({...task('chatgpt_search'),config:{...task('chatgpt_search').config,accountMode},browserMode:'silent'},new AbortController().signal,()=>{});
    expect(result).toMatchObject({status:'unavailable',restriction:'login'});expect(submitted).toBe(0);expect(f.launchOptions.every(option=>option.headless)).toBe(true);await f.collector.close();
  });
  it('never reads saved profiles during a strict guest sample',async()=>{
    const f=fixture(true);f.release();f.profiles.has=()=>{throw new Error('Guest read saved account');};f.profiles.open=async()=>{throw new Error('Guest opened saved account');};
    await expect(f.collector.collect(task('gemini'),new AbortController().signal,()=>{})).resolves.toMatchObject({account:'logged_out'});
    expect(f.contexts).toHaveLength(1);expect(f.contexts[0].options.storageState).toBeUndefined();await f.collector.close();
  });
  it('forgets only the requested saved platform on explicit action',async()=>{
    const f=fixture(true);f.remembered.add('chatgpt_search');f.remembered.add('gemini');
    expect(await f.collector.forgetSession('chatgpt_search')).toEqual({forgotten:true});
    expect(f.collector.savedSession('chatgpt_search')).toBe(false);expect(f.collector.savedSession('gemini')).toBe(true);await f.collector.close();
  });
  it('writes rotated authentication back before closing each question context',async()=>{
    const f=fixture(true);f.release();const signed={...task('chatgpt_search'),config:{...task('chatgpt_search').config,accountMode:'isolated'},browserMode:'silent'};
    await f.collector.prepareSession(signed);const login=f.contexts[0];login.page.snapshot={body:'',signedIn:true};await f.collector.verifySession(signed.planId,signed.surface);
    let token='SYNTHETIC INITIAL';login.storageState=async()=>({cookies:[{name:'synthetic',value:token}],origins:[]});
    let updates=0;f.profiles.update=async(surface,context)=>{expect(surface).toBe(signed.surface);expect(context.closed).toBe(false);updates++;token='SYNTHETIC ROTATED';};
    const create=f.browser.newContext;f.browser.newContext=async options=>{const ctx=await create(options);ctx.page.snapshot={...ctx.page.snapshot,signedIn:true,signedOut:false};return ctx;};
    await f.collector.collect(signed,new AbortController().signal,()=>{});await f.collector.collect(signed,new AbortController().signal,()=>{});
    expect(updates).toBe(2);expect(f.contexts[1].options.storageState.cookies[0].value).toBe('SYNTHETIC INITIAL');expect(f.contexts[2].options.storageState.cookies[0].value).toBe('SYNTHETIC ROTATED');
    expect(f.contexts.slice(1).every(context=>context.closed)).toBe(true);await f.collector.close();
  });
  it('closes sampling browsers even when the persistent profile fails to close',async()=>{
    const f=fixture(true);f.release();await f.collector.collect(task('gemini'),new AbortController().signal,()=>{});
    f.profiles.close=async()=>{throw new Error('Synthetic close failure');};
    await expect(f.collector.close()).rejects.toThrow('A browser session could not close.');expect(f.browser.closed).toBe(true);
  });
  it('runs silent lanes in one headless browser, preserves mode in evidence and never raises a window',async()=>{
    const f=fixture();f.release();const signal=new AbortController().signal;
    const results=await Promise.all(['chatgpt_search','gemini'].map(surface=>f.collector.collect({...task(surface),browserMode:'silent'},signal,()=>{})));
    expect(f.launchOptions).toHaveLength(1);expect(f.launchOptions[0]).toMatchObject({headless:true});
    expect(f.contexts.every(c=>c.page.fronts===0&&c.closed)).toBe(true);
    for(const result of results){expect(result.browser.mode).toBe('silent');expect(JSON.parse(Buffer.from(result.artifact.base64,'base64').toString()).browserMode).toBe('silent');}
    await f.collector.close();expect(f.browser.closed).toBe(true);
  });
  it('defaults missing task mode to silent and preserves explicitly dispatched visible mode',async()=>{
    const f=fixture();f.release();const signal=new AbortController().signal;
    const defaultMode=await f.collector.collect(task('gemini'),signal,()=>{});
    // BrowserJobs resolves historical frozen batches to explicit visible mode
    // before dispatch. A missing collector task mode is always background-only.
    const visible=await f.collector.collect({...task('gemini'),browserMode:'visible'},signal,()=>{});
    expect(f.launchOptions.map(options=>options.headless)).toEqual([true,false]);expect(defaultMode.browser.mode).toBe('silent');expect(visible.browser.mode).toBe('visible');await f.collector.close();
  });
  it('restores only a verified dedicated login into an isolated silent context without closing login preparation',async()=>{
    const f=fixture();f.release();const signed={...task('chatgpt_search'),config:{...task('chatgpt_search').config,accountMode:'signed_in_private'},browserMode:'silent'};
    await f.collector.prepareSession(signed);const login=f.contexts[0];
    login.page.snapshot={body:'',signedIn:true};await f.collector.verifySession(signed.planId,signed.surface);
    const result=await f.collector.collect(signed,new AbortController().signal,()=>{});
    expect(f.launchOptions.map(o=>o.headless)).toEqual([false,true]);expect(login.storageOptions).toEqual({indexedDB:true});
    expect(f.contexts[1].options.storageState.cookies[0].value).toBe('SYNTHETIC TOKEN');expect(f.contexts[1].closed).toBe(true);expect(login.closed).toBe(false);
    expect(f.collector.ready(signed.planId,[signed.surface])).toBe(true);expect(JSON.stringify(result)).not.toContain('SYNTHETIC TOKEN');
    await f.collector.close();expect(f.browser.closed).toBe(true);expect(f.otherBrowsers.every(b=>b.closed)).toBe(true);
  });
  it('rejects silent signed-in sampling before launching when login is unverified',async()=>{
    const f=fixture();f.release();const signed={...task('chatgpt_search'),config:{...task('chatgpt_search').config,accountMode:'signed_in_private'},browserMode:'silent'};
    await expect(f.collector.collect(signed,new AbortController().signal,()=>{})).rejects.toThrow(/重新登录/);expect(f.launchOptions).toHaveLength(0);expect(f.contexts).toHaveLength(0);await f.collector.close();
  });
  it('stops before submitting when restored login is missing, with no automatic visible fallback',async()=>{
    const f=fixture();f.release();const signed={...task('chatgpt_search'),config:{...task('chatgpt_search').config,accountMode:'signed_in_private'},browserMode:'silent'};
    await f.collector.prepareSession(signed);f.contexts[0].page.snapshot={body:'',signedIn:true};await f.collector.verifySession(signed.planId,signed.surface);
    let submitted=0;const create=f.browser.newContext;
    f.browser.newContext=async options=>{const ctx=await create(options);ctx.page.snapshot={body:'',signedIn:false,signedOut:true,controls:[],answer:'',citations:[],model:'synthetic'};ctx.page.locator=()=>({all:async()=>[{isVisible:async()=>true,fill:async()=>{submitted++;},press:async()=>{submitted++;}}]});return ctx;};
    const result=await f.collector.collect(signed,new AbortController().signal,()=>{});
    expect(result).toMatchObject({status:'unavailable',restriction:'login',browser:{mode:'silent'}});expect(submitted).toBe(0);expect(f.launchOptions.map(o=>o.headless)).toEqual([false,true]);expect(f.contexts[1].closed).toBe(true);expect(f.contexts[0].closed).toBe(false);await f.collector.close();
  });
  it('retains a headless launch failure without switching to visible sampling',async()=>{
    const f=fixture();f.failLaunch();f.release();
    await expect(f.collector.collect({...task('gemini'),browserMode:'silent'},new AbortController().signal,()=>{})).rejects.toThrow(/launch failed/);
    expect(f.launchOptions).toHaveLength(1);expect(f.launchOptions[0].headless).toBe(true);expect(f.contexts).toHaveLength(0);await f.collector.close();
  });
  it('does not open an interactive window when show is requested during silent sampling',async()=>{
    const f=fixture();f.release();let started!:()=>void,release!:()=>void;const opening=new Promise<void>(r=>{started=r;}),gate=new Promise<void>(r=>{release=r;});
    const create=f.browser.newContext;f.browser.newContext=async options=>{const ctx=await create(options);const goto=ctx.page.goto;ctx.page.goto=async(url:string)=>{started();await gate;await goto(url);};return ctx;};
    const pending=f.collector.collect({...task('gemini'),browserMode:'silent'},new AbortController().signal,()=>{});await opening;
    await expect(f.collector.show()).rejects.toThrow(/静默采样/);expect(f.contexts[0].page.fronts).toBe(0);release();await pending;await f.collector.close();
  });
  it('shares one pending launch and captures provider-specific pages and artifacts',async()=>{
    const f=fixture(),signal=new AbortController().signal;
    const first=f.collector.collect(task('chatgpt_search'),signal,()=>{});
    const second=f.collector.collect(task('gemini'),signal,()=>{});
    expect(f.launches()).toBe(1);f.release();const results=await Promise.all([first,second]);
    expect(f.contexts).toHaveLength(2);expect(new Set(f.contexts.map(c=>c.page)).size).toBe(2);
    expect(results.map(r=>r.sourceUrl)).toEqual(['https://chatgpt.com','https://gemini.google.com']);
    for(const [i,surface] of ['chatgpt_search','gemini'].entries()){
      expect(results[i].slotId).toBe('slot-'+surface);
      const raw=JSON.parse(Buffer.from(results[i].artifact.base64,'base64').toString());
      expect(raw.surface).toBe(surface);expect(raw.question).toBe('Synthetic question for '+surface);
    }
    expect(f.contexts.every(c=>c.closed)).toBe(true);await f.collector.close();
  });
  it('rejects overlap within one provider and releases its guard after completion',async()=>{
    const f=fixture(),signal=new AbortController().signal;
    const first=f.collector.collect(task('gemini'),signal,()=>{});
    await expect(f.collector.collect(task('gemini'),signal,()=>{})).rejects.toThrow(/同一入口/);
    f.release();await first;await f.collector.collect(task('gemini'),signal,()=>{});
    expect(f.launches()).toBe(1);expect(f.contexts).toHaveLength(2);await f.collector.close();
  });
  it('cleans up failed setup without closing another provider context',async()=>{
    const f=fixture(),signal=new AbortController().signal;f.release();
    const create=f.browser.newContext;let created=0;
    f.browser.newContext=async()=>{const ctx=await create();if(++created===1)ctx.newPage=async()=>{throw new Error('Synthetic page creation failure');};return ctx;};
    const results=await Promise.allSettled(['chatgpt_search','gemini'].map(s=>f.collector.collect(task(s),signal,()=>{})));
    expect(results[0].status).toBe('rejected');expect(results[1].status).toBe('fulfilled');expect(f.contexts.every(c=>c.closed)).toBe(true);
    await f.collector.collect(task('chatgpt_search'),signal,()=>{});expect(f.contexts).toHaveLength(3);await f.collector.close();
  });
  it('honors a stop requested during launch before creating any page',async()=>{
    const f=fixture(),controller=new AbortController();
    const pending=f.collector.collect(task('gemini'),controller.signal,()=>{});controller.abort();f.release();
    await expect(pending).rejects.toThrow(/已停止/);expect(f.contexts).toHaveLength(0);
    await f.collector.collect(task('gemini'),new AbortController().signal,()=>{});expect(f.contexts).toHaveLength(1);await f.collector.close();
  });
});
