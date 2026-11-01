'use strict';
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const DISPLAY_NAME='CiteSnap';
const LEGACY_DATA_DIRECTORY='AnswerPouch';

function configureIdentity(app,{qaDataPath}={}){
 app.setName(DISPLAY_NAME);
 // Keep sessions, localStorage, questions and dedicated AI profiles in place.
 const supplied=app.commandLine.getSwitchValue('user-data-dir');
 const directory=qaDataPath||supplied||path.join(app.getPath('appData'),LEGACY_DATA_DIRECTORY);
 if(!path.isAbsolute(directory)||directory===path.parse(directory).root||directory===os.homedir())throw Error('Invalid application data directory.');
 fs.mkdirSync(directory,{recursive:true,mode:0o700});
 const stat=fs.lstatSync(directory);
 if(!stat.isDirectory()||stat.isSymbolicLink()||stat.uid!==process.getuid())throw Error('Application data directory must be owned and separate.');
 app.setPath('userData',directory);
 app.setPath('sessionData',directory);
 return directory;
}
module.exports={DISPLAY_NAME,LEGACY_DATA_DIRECTORY,configureIdentity};
