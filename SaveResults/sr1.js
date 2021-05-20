const express = require("express");// подключение express
const WebSocketServer = new require('ws');
const fs = require("fs");
const cookieParser = require('cookie-parser');

const srn = require("./srNode");
const tls = require("./toolsNode");


//---------------------------------- Настройки текущего турнира -----------------------------------------
let settingFileName = 'tournamentSetting.json';
let setting = tls.uploadFromFile(settingFileName);
if(setting == null){
	setting = {}
	setting['cnst'] = {};
	setting.cnst['Q_TARGET'] = 24;
	setting.cnst['Q_ARROW'] = 2;
	setting.cnst['Q_ROUNDS'] = 2;
	setting.cnst['ALL_READY'] = 'МОЖНО СТРЕЛЯТЬ'
	setting.cnst['GROUP_READY'] = 'НЕ ВСЕ ГОТОВЫ'
	setting.cnst['GROUP_NOT_READY'] = 'ГРУППА НЕ ГОТОВА'

	setting['data'] = 'data/';
	setting['TournamentName'] = 'test';
	setting['targetsType'] = '3D';
	setting['currRound'] = 0;
	
	setDependendSetting();
	
	tls.saveInFile(settingFileName, setting);
}

function setDependendSetting(){
	setting['Round'] = []
	for(let i = 0; i < setting.cnst.Q_ROUNDS; i++){
		setting['Round'][i] = setting['data'] + setting['TournamentName'] + '/' + 'round' + (i+1);
		try {
		  if (!fs.existsSync(setting.Round[i])){
			fs.mkdirSync(setting.Round[i])
		  }
		} catch (err) {
		  console.error(err)
		}
	}
	setting['currRoundPath'] = setting.Round[setting['currRound']] + '/';
	let constants = '';
	for(let key in setting.cnst){
		if(isNaN(parseFloat(setting.cnst[key]))) constants += 'const ' + key + ' = "' + setting.cnst[key] + '"\n';
		else 									  constants += 'const ' + key + ' = ' + setting.cnst[key] + '\n';						 
	}
	fs.writeFileSync('constants.js', constants, 'utf8');
}
	
//-----------------------------------------------------------------------------------------------------------------
//-------------------------------------- Чтение данных об участниках ----------------------------------------------
let archJson = 'archList.json';
let archers = {};
if(!getArchList()) return;

function getArchList(){//Читаем список участников
	archJson = setting.currRoundPath + 'archList.json';
	archers = tls.uploadFromFile(archJson);
	if(archers==null) archers = tls.uploadFromFile(setting['data'] + setting['TournamentName'] + '/' + 'archList.txt');
	if(archers==null){
		console.log('Ошибка чтения списка участников');
		return false;
	}
	for(let key in archers){
		let archerData = tls.uploadFromFile(setting.currRoundPath + key.trim()+'.pnt');
		if(archerData!=null){
			//console.log('archerData='+JSON.stringify(archerData));//---------------------------------------------checkOut-----------------------------------------------
			archers[key]['summ'] = archerData.summ;
			archers[key]['otherRoundSumm'] = srn.getOtherRoundSumm(setting['currRound'], key, setting);
			archers[key]['arr'] = archerData.arr;
		}else{
			setArcherFilds(key);
		}
	}
	tls.saveInFile(archJson, archers);
	return true;
}

function setArcherFilds(key){
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
//-------------------------------------------------------------------------------------------------------------------
//------------------------------------------ Чтение данных о группах ------------------------------------------------
let groupInfo;//Информация о группах
let grInfoPath;// = 'groupInfo.json';
setGroupInfo();

function setGroupInfo(){
	grInfoPath = setting.currRoundPath + 'groupInfo.json';
	//Пытаемся прочитать файл с информацией о группах,
	groupInfo = tls.uploadFromFile(grInfoPath);
	if(groupInfo != null) return;
	groupInfo = {};
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
	tls.saveInFile(grInfoPath, groupInfo);
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
	//console.log('Cookie/admin: ', request.cookies['userArcherTournamentId'])//---------------------------------------------checkOut-----------------------------------------------
    response.sendFile(__dirname + '/adminka.html');
});

exp.get("/favicon.ico", function(request, response) {
});

exp.get("/*", function (request, response) {
	//console.log('Cookie/*: ', request.cookies['userArcherTournamentId'])//---------------------------------------------checkOut-----------------------------------------------
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
			srn.getGroupInfo(groupInfo, archers, obj.userId, settings, resp);
			ws.send(JSON.stringify(resp));
			console.log('Подключен клиент ' + clientID);
		}else if(obj.func == 'Result table'){//если в полученном сообщении есть слово 'Result table'
			let time = new Date()
			tabId = 'tab'+time.getMilliseconds()+time.getSeconds()+time.getMinutes()+time.getHours()+time.getDate()+Math.random();
			tables[tabId] = ws;			//регистрируем его как получателя табличной информации
			console.log('Подключена таблица ' + tabId);
		}else{
			try{
				switch(obj.func){
					case 'setPoint2Cell':
						let archer = obj.data.name;
						let target = obj.data.target - 1;
						archers[archer].arr[target][obj.data.arrow - 1] = obj.data.points;
						srn.getPointsInfo(archers, archer, target, setting['targetType'], obj.data.row, resp)
						ws.send(JSON.stringify(resp));
						tls.saveInFile(setting.currRoundPath + archer.trim() + '.pnt', archers[archer]);
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
						
						tls.saveInFile(setting.currRoundPath + 'groupInfo.json', groupInfo);
					break;
					case 'nextTarget' :
					{
						let gr = obj.data.group;
						if(groupInfo[gr].currTarget < setting.cnst['Q_TARGET']) groupInfo[gr].currTarget++;
						else groupInfo[gr].currTarget = 1;
						tls.saveInFile(setting.currRoundPath + 'groupInfo.json', groupInfo);
						srn.getGroupInfo(groupInfo, archers, obj.userId, settings, resp);
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
						else groupInfo[gr].currTarget = setting.cnst['Q_TARGET'];
						tls.saveInFile(setting.currRoundPath + 'groupInfo.json', groupInfo);
						srn.getGroupInfo(groupInfo, archers, obj.userId, settings, resp);
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
						else 							resp = {'data':archers};
						ws.send(JSON.stringify(resp));
					}
					break;
					case 'setReady' :
					{
						groupInfo[obj.data].ready = !groupInfo[obj.data].ready;
						tls.saveInFile(grInfoPath, groupInfo);
						srn.getGroupTable(groupInfo, resp);
						ws.send(JSON.stringify(resp));
					}
					break;
					case 'setGroup' :
					{
						archers[obj.data.name].group = obj.data.val;
						tls.saveInFile(archJson, archers);
						//srn.getTable(groupInfo, archers, resp);
						ws.send(JSON.stringify({'data':archers}));
					}
					break;
					case 'setIndex' :
					{
						archers[obj.data.name].index = obj.data.val;
						tls.saveInFile(archJson, archers);
						ws.send(JSON.stringify({'data':archers}));
					}
					break;
					case 'addGroup' :
					{
						groupInfo[obj.data] = {};
						let groupNumb = parseInt(obj.data);
						if(isNaN(groupNumb)) break;
						groupInfo[obj.data]["firstTarget"] = groupNumb;
						groupInfo[obj.data]["currTarget"] = groupNumb;
						groupInfo[obj.data]["lastTarget"] = groupNumb;
						groupInfo[obj.data]["clientId"] = '';
						groupInfo[obj.data]["ready"] = false;
						groupInfo[obj.data]["pass"] = ('' + Math.random()).substring(2,6);
						tls.saveInFile(grInfoPath, groupInfo);
						srn.getGroupTable(groupInfo, resp);
						ws.send(JSON.stringify(resp));
					}
					case 'addArcher' :
					{
						archers[obj.data.name] = {};
						let groupNumb = parseInt(obj.data.group);
						if(isNaN(groupNumb)) break;
						archers[obj.data.name]['group'] = obj.data.group;
						archers[obj.data.name]['index'] = obj.data.index;
						archers[obj.data.name]['class'] = obj.data.class;
						archers[obj.data.name]['club'] = obj.data.club;
						setArcherFilds(obj.data.name)
						tls.saveInFile(archJson, archers);
						ws.send(JSON.stringify({'data':archers}));
					}
					break;
					case 'delArcher' :
					{
						delete archers[obj.data];
						tls.saveInFile(archJson, archers);
						ws.send(JSON.stringify({'data':archers}));
					}
					break;
					case 'getCurrSetting' :
					{
						//console.log('setting='+JSON.stringify(setting));
						ws.send(JSON.stringify(setting));
					}
					break;
					case 'setSettingVar' :
					{
						let nVal = parseInt(obj.data.val);
						if(isNaN(nVal)) nVal = obj.data.val;
						
						if(obj.data.name.includes('cnst.')){
							setting.cnst[obj.data.name.substring(5)] = nVal;
						}else{
							setting[obj.data.name] = nVal;
						}
						tls.saveInFile(settingFileName, setting)
						setDependendSetting();
						getArchList();
						setGroupInfo();
						ws.send(JSON.stringify(setting));
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