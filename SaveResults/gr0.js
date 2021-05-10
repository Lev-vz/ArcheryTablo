const express = require("express");// подключение express
const WebSocketServer = new require('ws');
const fs = require("fs");
const cookieParser = require('cookie-parser');

const srn = require("./srNode");
const tls = require("./toolsNode");

//---------------------------------- Настройки текущего турнира -----------------------------------------
let settingFileName = 'tournamentSetting.json'
let setting = tls.uploadFromFile(settingFileName);
if(setting == null){
	console.log('Не удалось прочитать файл настроек турника')'
	return;
}
//-----------------------------------------------------------------------------------------------------------------
let allRoundArchers = []
for(let i = 0; i < setting.qRounds; i++){
	allRoundArchers[i] = tls.uploadFromFile(setting['Round'][i] + '/archList.txt');
	for(let key in allRoundArchers[i]){
		let archerData = tls.uploadFromFile(setting.currRoundPath + key +'.pnt');
		if(archerData!=null){
			//console.log('archerData='+JSON.stringify(archerData));//---------------------------------------------checkOut-----------------------------------------------
			allRoundArchers[i][key]['summ'] = archerData.summ;
			allRoundArchers[i][key]['arr'] = archerData.arr;
		}else{
			archers[key]['summ'] = 0;
			archers[key]['arr'] = [];
			for(let i=0; i<setting.cnst.Q_TARGET; i++){
				archers[key]['arr'][i]=[];
				for(let j=0; j<setting.cnst.Q_ARROW; j++){
					archers[key]['arr'][i][j] = 0;
				}
			}
		}
	}
}
for(let i = 0; i < setting.qRounds; i++){
	allRoundArchers[i] = tls.uploadFromFile(setting['Round'][i] + '/archList.txt');
	for(let key in allRoundArchers[i]){
		for(let j = 0; j < setting.qRounds; j++){
			let summ = 0;
			if((key in allRoundArchers[j]) && ('summ' in allRoundArchers[j][key])){
				summ += allRoundArchers[j][key].summ;
			}
			allRoundArchers[i][key]['allRoundSumm'] = archerData.summ;
			allRoundArchers[i][key]['allRoundAverageArrow'] = archerData.summ / (setting.cnst.Q_TARGET * setting.cnst.Q_ARROW);
			
		}
	}
}
//-------------------------------------------------------------------------------------------------------------------
//--------------------------------------- Запуск обычного HTTP Server -----------------------------------------------
const exp = express();

exp.use(cookieParser('secret key'))

exp.get("/", function (request, response) {
	//console.log('Cookie/: ', request.cookies['userArcherTournamentId'])//---------------------------------------------checkOut-----------------------------------------------
    response.sendFile(__dirname + '/resultsList.html');
});

exp.get("/favicon.ico", function(request, response) {
});

exp.get("/*", function (request, response) {
	if(request.url.includes('admin')){
		response.sendFile(__dirname + '/wrongPass.html');
		return;
	}
	let arg = tls.checkPass(request.url, request.cookies['userArcherTournamentId'], groupInfo, fs, setting['currRoundPath']);
	//console.log('arg = ' + arg);//---------------------------------------------checkOut-----------------------------------------------
    response.sendFile(__dirname + arg);
});

exp.listen(3002);
//-------------------------------------------------------------------------------------------------------------------
//------------------------------------------- Запуск WebSoket Server ------------------------------------------------
const webSocketServer = new WebSocketServer.Server({port: 3003});

webSocketServer.on('connection', function(ws) {
	
	console.log("новое соединение:" + ws._socket.remoteAddress);
	ws.send('Hi, client!');
	
	ws.on('message', function(msg) {
		console.log('получено сообщение ' + msg);//---------------------------------------------checkOut-----------------------------------------------
		//console.log("msg.indexOf('Result saver') " + msg.indexOf('Result saver'))
		let obj = JSON.parse(msg);
		try{
			switch(obj.func){
				case 'getFullResult' :
				{
					ws.send(JSON.stringify(allRoundArchers));
				}
				break;
				case 'getRoundResult' :
				{
					ws.send(JSON.stringify(allRoundArchers[obj.data]));
				}
				break;
				case 'getShortResult' :
				{
					let resp = grn.getShortTable(allRoundArchers);
					if(resp != null) ws.send(JSON.stringify(resp));
				}
				break;
			}
			
			
		}catch(err){
			console.log(err);
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

console.log("Express in 3002, WebSocket in 3003");