#!/usr/bin/env node
const {readFileSync,writeFileSync,statSync}=require('node:fs');
const {resolve}=require('node:path');
const {createCollector,createEvidence,verifyEvidence,taskSchema}=require('../index.cjs');
const help=`AnswerPouch — collect AI answers with their source evidence.

  answerpouch doctor
  answerpouch check-task TASK.json
  answerpouch verify EVIDENCE.json
  answerpouch collect --task TASK.json --output NEW.json --acknowledge-transfer

Collection opens dedicated Chrome sessions and sends the task to the selected
external platform. Each command collects one question at most once. The CLI
supports strict signed-out tasks; no saved profiles or paid API fallback.
Login, CAPTCHA, rate or regional restrictions stop collection. A reserved output
or receipt cannot be reused. Inspect an uncertain submission before a new task.
Library users can explicitly manage dedicated authenticated profiles separately.
`;
function readJson(file){if(statSync(file).size>16*1024*1024)throw new Error('Input exceeds 16 MiB');return JSON.parse(readFileSync(file,'utf8'));}
async function main(argv){
  if(!argv.length||argv[0]==='--help'||argv[0]==='-h'){console.log(help);return;}
  if(argv[0]==='doctor'&&argv.length===1){const c=createCollector();try{console.log(JSON.stringify(c.available()));}finally{await c.close();}return;}
  if(argv[0]==='check-task'&&argv.length===2){taskSchema.parse(readJson(argv[1]));console.log(JSON.stringify({valid:true,submitted:false}));return;}
  if(argv[0]==='verify'&&argv.length===2){console.log(JSON.stringify(verifyEvidence(readJson(argv[1]))));return;}
  if(argv[0]!=='collect')throw new Error('Unknown command. Use --help.');
  let taskFile,output,ack=false;
  for(let i=1;i<argv.length;i++){
    if(argv[i]==='--acknowledge-transfer'&&!ack){ack=true;continue;}
    if(argv[i]==='--task'&&!taskFile){taskFile=argv[++i];continue;}
    if(argv[i]==='--output'&&!output){output=argv[++i];continue;}
    throw new Error('Unknown or repeated collection option');
  }
  if(!ack||!taskFile||!output)throw new Error('Task, fresh output and explicit transfer acknowledgement are required');
  const task=taskSchema.parse(readJson(taskFile)),destination=resolve(output),receipt=destination+'.receipt.json';
  // Reserve before launching. No retry may reuse a submitted/uncertain output.
  writeFileSync(destination,JSON.stringify({kind:'answerpouch.pending',slotId:task.slotId,stage:'reserved'})+'\n',{flag:'wx',mode:0o600});
  writeFileSync(receipt,JSON.stringify({slotId:task.slotId,stage:'reserved',at:new Date().toISOString()})+'\n',{flag:'wx',mode:0o600});
  const controller=new AbortController();const cancel=()=>controller.abort();
  process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
  const collector=createCollector();
  try{
    const capture=await collector.collect(task,controller.signal,stage=>writeFileSync(receipt,JSON.stringify({slotId:task.slotId,stage,at:new Date().toISOString()})+'\n',{mode:0o600}));
    const evidence=createEvidence(task,capture);
    writeFileSync(destination,JSON.stringify(evidence,null,2)+'\n',{mode:0o600});
    writeFileSync(receipt,JSON.stringify({slotId:task.slotId,stage:'finished',status:capture.status,hash:evidence.hash,at:new Date().toISOString()})+'\n',{mode:0o600});
    console.log(JSON.stringify({output:destination,status:capture.status,restriction:capture.restriction}));
  }finally{process.removeListener('SIGINT',cancel);process.removeListener('SIGTERM',cancel);await collector.close();}
}
main(process.argv.slice(2)).catch(()=>{console.error('The command did not complete. Check the task and any reserved output/receipt; collection is never replayed automatically.');process.exitCode=1;});
