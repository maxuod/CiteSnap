#!/usr/bin/env node
// The desktop is the only live consumer entry: own-account and host-network gates apply.
const {readFileSync,lstatSync}=require('node:fs');
const {verifyEvidence,taskSchema}=require('../index.cjs');
const {verifyQuestions,verifyLocalEvidence}=require('../lib/local-workspace.cjs');
function read(file){const s=lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>16*1024*1024)throw Error('Invalid file');return JSON.parse(readFileSync(file,'utf8'));}
const help=`CiteSnap — local AI answer evidence.

Open the CiteSnap desktop application to freeze/import questions, sign in
with your own accounts and collect using this computer's network.

Offline tools (never open a browser or submit questions):
  citesnap check-task TASK.json
  citesnap verify EVIDENCE.json
  citesnap verify-questions FROZEN.json

The legacy signed-out CLI collect command is disabled in 0.2.
`;
try{
 const [command,file,...extra]=process.argv.slice(2);
 if(!command||command==='--help'||command==='-h')console.log(help);
 else if(extra.length||!file)throw Error('Use --help.');
 else if(command==='check-task'){taskSchema.parse(read(file));console.log(JSON.stringify({valid:true,submitted:false}));}
 else if(command==='verify-questions'){const q=verifyQuestions(read(file));console.log(JSON.stringify({valid:true,hash:q.hash,questions:q.questions.length}));}
 else if(command==='verify'){const e=read(file);console.log(JSON.stringify(e.kind==='answerpouch.local-capture'?verifyLocalEvidence(e):verifyEvidence(e)));}
 else throw Error('Use the desktop application for collection.');
}catch{console.error('No collection was started. Use --help or open the desktop application.');process.exitCode=1;}
