const express = require("express");// подключение express
const WebSocketServer = new require('ws');
const fs = require("fs");
const cookieParser = require('cookie-parser');

const srn = require("./srNode");
//const cnst = require("./const");

//---------------------------------- Настройки текущего турнира -----------------------------------------
let settingFileName = 'tournamentSetting.json'
let setting = srn.uploadFromFile(settingFileName);
if(setting == null){
	setting = {}
	setting['cnst'] = {};
	setting.cnst['Q_TARGET'] = 24;
	setting.cnst['Q_ARROW'] = 2;
	setting.cnst['ALL_READY'] = 'МОЖНО СТРЕЛЯТЬ'
	setting.cnst['GROUP_READY'] = 'НЕ ВСЕ ГОТОВЫ'
	setting.cnst['GROUP_NOT_READY'] = 'ГРУППА НЕ ГОТОВА'

	setting['data'] = 'data/';
	setting['tournament'] = 'F3D020521';
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

	setting['currRound'] = 3;
	setting['currRoundPath'] = setting.Round[0] + '/';
	
	srn.saveInFile(settingFileName, setting)
}

let constants = '';
for(let key in setting.cnst){
	if(isNaN(parseFloat(setting.cnst[key]))) constants += 'const ' + key + ' = "' + setting.cnst[key] + '"\n';
	else 									  constants += 'const ' + key + ' = ' + setting.cnst[key] + '\n';						 
}
fs.writeFileSync('constants.js', constants, 'utf8');
//-----------------------------------------------------------------------------------------------------------------
//-------------------------------------- Чтение данных об участниках ----------------------------------------------
let archers = {}
let archList = setting.currRoundPath + 'archList.txt'
try{//Читаем список участников
	archers = JSON.parse(fs.readFileSync(archList, 'utf8'));
	for(let key in archers){
		let archerData = srn.uploadFromFile(setting.currRoundPath + key.trim()+'.pnt');
		if(archerData!=null){
			//console.log('archerData='+JSON.stringify(archerData));//---------------------------------------------checkOut-----------------------------------------------
			archers[key]['summ'] = archerData.summ;
			archers[key]['otherRoundSumm'] = srn.getOtherRoundSumm(setting['currRound'], key, setting);
			archers[key]['arr'] = archerData.arr;
		}else{
			archers[key]['summ'] = 0;
			archers[key]['otherRoundSumm'] = srn.getOtherRoundSumm(setting['currRound'], key, setting);
			archers[key]['arr'] = [];
			for(let i=0; i<setting.cnst.Q_TARGET; i++){
				archers[key]['arr'][i]=[];
				for(let j=0; j<setting.cnst.Q_ARROW; j++){
					archers[key]['arr'][i][j] = 0;
				}
			}
		}
	}
}catch(err){
	console.log('Ошибка чтения списка участников',err);
	return;
}
//-------------------------------------------------------------------------------------------------------------------
//------------------------------------------ Чтение данных о группах ------------------------------------------------
let groupInfo = {};//Информация о группах

let grInfoPath = setting.currRoundPath + 'groupInfo.json'
try{//Пытаемся прочитать файл с информацией о группах,
	groupInfo = JSON.parse(fs.readFileSync(grInfoPath, 'utf8'));
}catch(err){
	let group = "";
	for(let key in archers){
		let thisGroup = archers[key]['group'];
		if(group  != thisGroup){
			group  = thisGroup;
			groupInfo[group] = {};
			groupInfo[group]["firstTarget"] = parseInt(group)
			groupInfo[group]["currTarget"] = parseInt(group)
			groupInfo[group]["lastTarget"] = parseInt(group)
			groupInfo[group]["clientId"] = '';
			groupInfo[group]["ready"] = false;
			//let pass = '' + Math.random();
			groupInfo[group]["pass"] = ('' + Math.random()).substring(2,6);
		}
	}
	srn.saveInFile(grInfoPath, groupInfo);
};

srn.saveGroupInfo(groupInfo, "", "", fs);
//-------------------------------------------------------------------------------------------------------------------
//--------------------------------------- Запуск обычного HTTP Server -----------------------------------------------
const exp = express();

exp.use(cookieParser('secret key'))

exp.get("/", function (request, response) {
	//console.log('Cookie/: ', request.cookies['userArcherTournamentId'])//---------------------------------------------checkOut-----------------------------------------------
    response.sendFile(__dirname + '/index.html');
});

exp.get("/org3344", function (request, response) {
	console.log('Cookie/admin: ', request.cookies['userArcherTournamentId'])//---------------------------------------------checkOut-----------------------------------------------
    response.sendFile(__dirname + '/adminka.html');
});

exp.get("/favicon.ico", function(request, response) {
});

exp.get("/*", function (request, response) {
	console.log('Cookie/*: ', request.cookies['userArcherTournamentId'])//---------------------------------------------checkOut-----------------------------------------------
	if(request.url.includes('admin')){
		response.sendFile(__dirname + '/wrongPass.html');
		return;
	}
	let arg = srn.checkPass(request.url, request.cookies['userArcherTournamentId'], groupInfo, fs, setting['currRoundPath']);
	//console.log('arg = ' + arg);//---------------------------------------------checkOut-----------------------------------------------
    response.sendFile(__dirname + arg);
});

exp.listen(3000);
//-------------------------------------------------------------------------------------------------------------------
//------------------------------------------- Запуск WebSoket Server ------------------------------------------------
const clients = {};// подключённые клиенты
const tables = {};// подключённые таблицы

const webSocketServer = new WebSocketServer.Server({port: 3001});

webSocketServer.on('connection', function(ws) {
	
	console.log("новое соединение:" + ws._socket.remoteAddress);
	ws.send('Hi, client!');
	let tabId = 'x';
	let clientID = 'y';
	
	ws.on('message', function(msg) {
		console.log('получено сообщение ' + msg);//---------------------------------------------checkOut-----------------------------------------------
		//console.log("msg.indexOf('Result saver') " + msg.indexOf('Result saver'))
		let resp = {};
		let obj = JSON.parse(msg);
		if(obj.func == 'Result saver'){//если в полученном сообщении есть слово 'Result saver'
			clientID = obj.userId;
			clients[clientID] = ws;			//регистрируем его как получателя информации о начале стрельбы
			srn.getGroupInfo(groupInfo, archers, obj.userId, targets, settings, resp);
			ws.send(JSON.stringify(resp));
			console.log('Подключен клиент ' + clientID);
		}else if(obj.func == 'Result table'){//если в полученном сообщении есть слово 'Result table'
			let time = new Date()
			tabId = 'tab'+time.getMilliseconds()+time.getSeconds()+time.getMinutes()+time.getHours()+time.getDate()+Math.random();
			tables[tabId] = ws;			//регистрируем его как получателя табличной информации
			//srn.getGroupInfo(groupInfo, archers, obj.userId, targets, resp);
			//ws.send(JSON.stringify(resp));
			console.log('Подключена таблица ' + tabId);
		}else{
			try{
				switch(obj.func){
					case 'setPoint2Cell':
						let archer = obj.data.name;
						let target = obj.data.target - 1;
						archers[archer].arr[target][obj.data.arrow - 1] = obj.data.points;
						srn.getPointsInfo(archers, archer, target, targets[target], obj.data.row, resp)
						ws.send(JSON.stringify(resp));
						srn.saveInFile(setting.currRoundPath + archer.trim() + '.pnt', archers[archer]);
					break;
					case 'sendReady':
						if(srn.isAllReady(groupInfo, obj.userId, true)){
							resp['ready'] = cnst.ALL_READY;
							for(let key in clients) clients[key].send(JSON.stringify(resp));
						}
						else{
							resp['ready'] = cnst.GROUP_READY;
							ws.send(JSON.stringify(resp));
						}
						//console.log('groupInfo='+JSON.stringify(groupInfo));
						srn.saveInFile(setting.currRoundPath + 'groupInfo.json', groupInfo);
					break;
					case 'nextTarget' :
					{
						let gr = obj.data.group;
						if(groupInfo[gr].currTarget < targets.length) groupInfo[gr].currTarget++;
						else groupInfo[gr].currTarget = 1;
						srn.saveInFile(setting.currRoundPath + 'groupInfo.json', groupInfo);
						srn.getGroupInfo(groupInfo, archers, obj.userId, targets, settings, resp);
						ws.send(JSON.stringify(resp));
						//----- Пересчитать таблицу и разослать всем зарегистрированным просмолтрищикам таблиц ------------
						resp = {};
						srn.getTable(groupInfo, archers, resp);
						for(let key in tables) tables[key].send(JSON.stringify(resp));
					}
					break;
					case 'prevTarget' :
					{
						let gr = obj.data.group;
						if(groupInfo[gr].currTarget > 1) groupInfo[gr].currTarget--;
						else groupInfo[gr].currTarget = targets.length;
						srn.saveInFile(setting.currRoundPath + 'groupInfo.json', groupInfo);
						srn.getGroupInfo(groupInfo, archers, obj.userId, targets, settings, resp);
						ws.send(JSON.stringify(resp));
					}
					break;
					case 'getTable' :
					{
						if('name' in obj.data && 'ruond' in obj.data && name == 'resalts'){
							srn.getResalts(groupInfo, obj.data.round, archers, setting, resp);
						}
						ws.send(JSON.stringify(resp));
					}
					break;
					case 'adminControl' :
					{
						if(obj.data == 'groupControl')	srn.getGroupTable(groupInfo, resp);
						else 							srn.getTable(groupInfo, archers, resp);
						ws.send(JSON.stringify(resp));
					}
					break;
					case 'setReady' :
					{
						groupInfo[obj.data].ready = !groupInfo[obj.data].ready;
						srn.getGroupTable(groupInfo, resp);
						ws.send(JSON.stringify(resp));
					}
					break;
					case 'setGroup' :
					{
						archers[obj.data.name].group = obj.data.val;
						srn.getTable(groupInfo, archers, resp);
						ws.send(JSON.stringify(resp));
					}
					break;
					case 'setIndex' :
					{
						archers[obj.data.name].index = obj.data.val;
						srn.getTable(groupInfo, archers, resp);
						ws.send(JSON.stringify(resp));
					}
					break;
				}
				
				
			}catch(err){
				console.log(err)
			};
		}
	});

	ws.on('close', function() {
		if(clientID in clients){
			delete clients[clientID];
			console.log('3акрыто соединение c клиентом ' + clientID);
		}
		if(tabId in tables){
			delete tables[tabId];
			console.log('3акрыто соединение c таблицей ' + tabId);
		}
		
	});

});
//---------------------------------------------------------------------------------------

console.log("Express in 3000, WebSocket in 3001");


//				1		2		3		4		5		6		7		8		9		10		11		12
let targets = ['3D',  '3D',    '3D',   '3D',   '3D',   '3D',   '3D',   '3D',   '3D',   '3D',   '3D',   '3D']
//let targets = ['Field','Field','Field','Field','Field','Field','Field','Field','Field','Field','Field','Field']
//	"1":"3D","2":"3D","3":"3D","4":"3D","5":"3D","6":"3D","7":"3D","8":"3D","9":"3D","10":"3D","11":"3D","12":"3D",
//	"13":"Field","14":"Field","15":"Field","16":"Field","17":"Field","18":"Field","19":"Field","20":"Field","21":"Field","22":"Field","23":"Field","24":"Field",
//}
