const {createChromeCollector}=require('./lib/chrome-collector.cjs');
const {createEvidence,verifyEvidence,taskSchema}=require('./lib/protocol.cjs');

// Creation never opens a browser. Each operation remains explicit.
module.exports={createCollector:createChromeCollector,createChromeCollector,createEvidence,verifyEvidence,taskSchema};
