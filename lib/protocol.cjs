const {createHash}=require('node:crypto');
const {readFileSync}=require('node:fs');
const {z}=require('zod');
const {captureSchema}=require('./capture-schema.cjs');
const pkg=require('../package.json');
const surfaces=['google_aio','chatgpt_search','gemini','bing_copilot','perplexity','grok','duckduckgo_search_assist'];
const taskSchema=z.object({
  planId:z.string().min(1).max(120),slotId:z.string().min(1).max(120),
  prompt:z.string().min(1).max(10000),surface:z.enum(surfaces),
  config:z.object({country:z.string().regex(/^[A-Z]{2}$/),locale:z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/),
    timezone:z.string().min(1).max(80).refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true;}catch{return false;}}),
    device:z.literal('desktop'),accountMode:z.literal('signed_out'),guestPolicy:z.literal('no_login_v1'),egressPolicy:z.literal('unverified')}).strict(),
  timeoutSeconds:z.number().int().min(45).max(300),browserMode:z.enum(['silent','visible']),captureScreenshot:z.boolean(),
  verifiedCountry:z.null(),geoVerificationNote:z.string().max(500)
}).strict();
const copy=value=>JSON.parse(JSON.stringify(value));
function normalize(value){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number'&&Number.isFinite(value))return value;
  if(Array.isArray(value))return value.map(normalize);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,normalize(value[k])]));
  throw new Error('Invalid evidence JSON');
}
const canonical=value=>JSON.stringify(normalize(value));
const hash=value=>createHash('sha256').update(value).digest('hex');
const collectorSchema=z.object({name:z.literal('AnswerPouch'),version:z.string().min(1).max(80),sourceManifestSha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
const envelopeSchema=z.object({kind:z.literal('answerpouch.capture'),schemaVersion:z.literal(1),collector:collectorSchema,task:taskSchema,capture:captureSchema,hash:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
function validatePair(task,capture){if(capture.slotId!==task.slotId||capture.prompt!==task.prompt)throw new Error('Capture does not match the requested question');}
function createEvidence(task,capture){
  taskSchema.parse(task);captureSchema.parse(capture);validatePair(task,capture);
  const body={kind:'answerpouch.capture',schemaVersion:1,collector:{name:'AnswerPouch',version:pkg.version,sourceManifestSha256:hash(readFileSync(require.resolve('../source-provenance.json')))},task:copy(task),capture:copy(capture)};
  return {...body,hash:hash(canonical(body))};
}
function verifyEvidence(envelope){
  envelopeSchema.parse(envelope);validatePair(envelope.task,envelope.capture);
  const {hash:expected,...body}=envelope;
  if(hash(canonical(body))!==expected)throw new Error('Evidence hash mismatch');
  return {valid:true,schemaVersion:1,status:envelope.capture.status,restriction:envelope.capture.restriction};
}
module.exports={taskSchema,createEvidence,verifyEvidence};
