const express = require("express");// подключение express
const WebSocketServer = new require('ws');
const fs = require("fs");
const cookieParser = require('cookie-parser');

const srn = require("./srNode");
//const cnst = require("./const");

//---------------------------------- Настройки текущего турнира -----------------------------------------
let settingFileName = 'tournamentSetting.json'
let setting = srn.uploadFromFile(settingFileName);
//console.log(setting)//---------------------------------------------checkOut-----------------------------------------------

if(setting == null){
	setting = {};
	setting['cnst'] = {};
	setting.cnst['Q_TARGET'] = 24;
	setting.cnst['Q_ARROW'] = 2;
	setting.cnst['ALL_READY'] = 'МОЖНО СТРЕЛЯТЬ'
	setting.cnst['GROUP_READY'] = 'НЕ ВСЕ ГОТОВЫ'
	setting.cnst['GROUP_NOT_READY'] = 'ГРУППА НЕ ГОТОВА'

	setting['data'] = 'data/';
	setting['tournament'] = 'test';
	let tournamentPath = setting['data'] + setting['tournament'];
	try {
	  if (!fs.existsSync(tournamentPath)){
		fs.mkdirSync(tournamentPath)
	  }
	} catch (err) {
	  console.error(err)
	}
	
	setting['qRounds'] = 4;
	setting['Round'] = []
	for(let i = 0; i < setting.qRounds; i++){
		setting['Round'][i] = tournamentPath + '/round' + (i+1);
		try {
		  if (!fs.existsSync(setting.Round[i])){
			fs.mkdirSync(setting.Round[i])
		  }
		} catch (err) {
		  console.error(err)
		}
	}

	setting['currRound'] = 0;
	setting['currRoundPath'] = setting.Round[0] + '/';
	
	srn.saveInFile(settingFileName, setting)
}

let constants = '';
for(let key in setting.cnst){
	if(isNaN(parseFloat(setting.cnst[key]))) constants += 'const ' + key + ' = "' + setting.cnst[key] + '"\n';
	else 									  constants += 'const ' + key + ' = ' + setting.cnst[key] + '\n';						 
}
fs.writeFileSync('constants.js', constants, 'utf8');
//---------------------------------------------------------------------------------------
for(let i = 0; i < setting.qRounds; i++){
	setting['currRoundPath'] = setting.Round[i] + '/';
	let archers = {}
	let archList = setting.currRoundPath + 'archList.txt'
	try{//Читаем список участников
		archers = JSON.parse(fs.readFileSync(archList, 'utf8'));
		//console.log(archers)//---------------------------------------------checkOut-----------------------------------------------
		for(let key in archers){
			let archerData = srn.uploadFromFile(setting.currRoundPath + key.trim()+'.pnt');
			if(archerData!=null){
				//console.log('archerData='+JSON.stringify(archerData));//---------------------------------------------checkOut-----------------------------------------------
				let summ = 0;
				for(let j = 0; j < archerData.arr.length; j++){
					summ += archerData.arr[j][0] + archerData.arr[j][1] + archerData.arr[j][2]
				}
				archerData['summ'] = summ;
				srn.saveInFile(setting.currRoundPath + key.trim()+'.pnt', archerData);
			}
		}
	}catch(err){
		console.log('Ошибка чтения списка участников',err);
		return;
	}
}
