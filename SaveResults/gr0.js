const express = require("express");// подключение express
const WebSocketServer = new require('ws');
const fs = require("fs");
const cookieParser = require('cookie-parser');

const grn = require("./grNode");
const tls = require("./toolsNode");

//---------------------------------- Настройки текущего турнира -----------------------------------------
let settingFileName = 'tournamentSetting.json'
let setting = tls.uploadFromFile(settingFileName);
if(setting == null){
	console.log('Не удалось прочитать файл настроек турнира')
	return;
}
//-----------------------------------------------------------------------------------------------------------------
let allRoundArchers = []
for(let i = 0; i < setting.qRounds; i++){
	allRoundArchers[i] = tls.uploadFromFile(setting['Round'][i] + '/archList.txt');
	for(let key in allRoundArchers[i]){
		let archerData = tls.uploadFromFile(setting['Round'][i] + '/' + key +'.pnt');
		if(archerData){
			allRoundArchers[i][key]['summ'] = archerData.summ;
			allRoundArchers[i][key]['arr'] = archerData.arr;
			//console.log('summ['+key+']['+i+']='+allRoundArchers[i][key]['summ']);//JSON.stringify());//---------------------------------------------checkOut-----------------------------------------------
		}else{
			allRoundArchers[i][key]['summ'] = 0;
			allRoundArchers[i][key]['arr'] = [];
			for(let k=0; k<setting.cnst.Q_TARGET; k++){
				allRoundArchers[i][key]['arr'][k]=[];
				for(let j=0; j<setting.cnst.Q_ARROW; j++){
					allRoundArchers[i][key]['arr'][k][j] = 0;
				}
			}
		}
	}
}
/*
for(let i = 0; i < setting.qRounds; i++){
	allRoundArchers[i] = tls.uploadFromFile(setting['Round'][i] + '/archList.txt');
	for(let key in allRoundArchers[i]){
		for(let j = 0; j < setting.qRounds; j++){
			let summ = 0;
			if((key in allRoundArchers[j]) && ('summ' in allRoundArchers[j][key])){
				summ += allRoundArchers[j][key].summ;
			}
			allRoundArchers[i][key]['allRoundSumm'] = summ;
			allRoundArchers[i][key]['allRoundAverageArrow'] = summ / (setting.cnst.Q_TARGET * setting.cnst.Q_ARROW);
			
		}
	}
}
*/
let shortTable = grn.getShortTable(allRoundArchers, setting.cnst.Q_TARGET * setting.cnst.Q_ARROW * setting.cnst.Q_ROUNDS);
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
	let arg = request.url;
	if(request.url.includes('admin')){
		response.sendFile(__dirname + '/wrongPass.html');
		return;
	}
	if(request.url.includes('groupControl')){
		response.sendFile(__dirname + '/wrongPass.html');
		return;
	}
	else if(!(arg.includes('.html') || arg.includes('.htm') || arg.includes('.js') || arg.includes('.css') ||
			arg.includes('.ico') || arg.includes('.jpg') || arg.includes('.png'))) return arg + ".html";

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
				/*
				case 'getFullResult' :
				{
					ws.send(JSON.stringify({'dataType':'allRound','data':allRoundArchers));
				}
				break;
				*/
				case 'getShortResult' :
				{
					ws.send(JSON.stringify({'dataType':'shortData','data':shortTable}));
				}
				break;
				case 'getRoundResult' :
				{
					ws.send(JSON.stringify({'dataType':obj.data,'data':allRoundArchers[obj.data]}));
				}
				break;
			}
			
			
		}catch(err){
			console.log(err);
		}
	});

	ws.on('close', function() {
	});

});
//---------------------------------------------------------------------------------------

console.log("Express in 3002, WebSocket in 3003");