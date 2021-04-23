const express = require("express");// подключение express
const WebSocketServer = new require('ws');
const fs = require("fs");

const srn = require("./srNode");


//---------------------------------------------------------------------------------------
let archers = {}
try{//Читаем список участников
	archers = JSON.parse(fs.readFileSync('arhers.txt', 'utf8'));
}catch(err){
	console.log('Ошибка чтения списка участников',err);
	return;
}

const clients = {};// подключённые клиенты

//let data = {};
let groupInfo = {};//Информация о группах

try{//Пытаемся прочитать файл с информацией о группах,
	groupInfo = JSON.parse(fs.readFileSync('groupInfo.txt', 'utf8'));
}catch(err){
	let group = "";
	for(let key in archers){
		let thisGroup = archers[key]['group'];
		if(group  != thisGroup){
			group  = thisGroup;
			groupInfo[group] = {};
			groupInfo[group]["firstTarget"] = parseInt(group)
			groupInfo[group]["currTarget"] = parseInt(group)
			groupInfo[group]["clientId"] = "";
			groupInfo[group]["ready"] = false;
			let pass = "" + Math.random();
			groupInfo[group]["pass"] = pass.substring(2,6);
		}
	}
	try{															//записываем новые данные в файл на случай краха
		fs.writeFileSync('groupInfo.txt', JSON.stringify(groupInfo), 'utf8');
		//console.log(groupInfo);
	}catch(err){
		console.log('Ошибка записи в файл',err);
	}
};

srn.saveGroupInfo(groupInfo, "", "", fs);

//----------------------- Запуск обычного HTTP Server ------------------------------------
const exp = express();

exp.get("/", function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

exp.get("/favicon.ico", function(request, response) {
});

exp.get("/*", function (request, response) {
	let arg = srn.checkPass(request.url, request.connection.remoteAddress, groupInfo, fs);
	console.log('arg = ' + arg);//---------------------------------------------checkOut-----------------------------------------------
    response.sendFile(__dirname + arg);
});

exp.listen(3000);
//----------------------- Запуск WebSoket Server ------------------------------------

const webSocketServer = new WebSocketServer.Server({port: 3001});

webSocketServer.on('connection', function(ws) {
	
	console.log("новое соединение:" + ws._socket.remoteAddress);
	ws.send('Hi, client!');

	ws.on('message', function(msg) {
		clientIp = ws._socket.remoteAddress;
		console.log('получено сообщение ' + msg);//---------------------------------------------checkOut-----------------------------------------------
		//console.log("msg.indexOf('Result saver') " + msg.indexOf('Result saver'))
		let resp = {};
		if(msg.indexOf('Result saver')==0){//если в полученном сообщении есть слово 'Result saver'
			clients[clientIp]= ws;			//регистрируем его как получателя информации о смене времени и режима
			for(let k in groupInfo){
				if(groupInfo[k]["clientId"] == clientIp){
					resp['group'] = k;
					resp['target'] = groupInfo[k]["currTarget"];
					if(groupInfo[k]["ready"]) resp['ready'] = 'ГРУППА ГОТОВА';
					else resp['ready'] = 'ГРУППА НЕ ГОТОВА';
					resp['targetType'] = targets[groupInfo[k]["currTarget"]];
					break;
				}
			}
			ws.send(JSON.stringify(resp));
		}else{
			try{
				let obj = JSON.parse(msg);
				switch(obj.func){
					case 'setPoint2Cell':
						//console.log('obj.data.archer + obj.data.arrow = ' + obj.data.archer + "" + obj.data.arrow)
						resp[obj.data.archer + "" + obj.data.arrow] = obj.data.points;
						break;
					case 'sendReady':
						let ready = true;
						for(let k in groupInfo){
							if(groupInfo[k]["clientId"] == clientIp) groupInfo[k]["ready"] = true;
							ready &= groupInfo[k]["ready"];
						}
						if(ready) resp['ready'] = 'ВСЕ ГРУППЫ ГОТОВЫ';
						resp['ready'] = 'ГРУППА ГОТОВА';
						break;
				}
				//console.log('resp='+JSON.stringify(resp));
				ws.send(JSON.stringify(resp));
			}catch(err){
				console.log(err)
			};
		}
	});

	ws.on('close', function() {
		console.log('3акрыто соединение ' + ws._socket.remoteAddress);
		delete clients[ws._socket.remoteAddress];
	});

});
//---------------------------------------------------------------------------------------

console.log("Express in 3000, WebSocket in 3001");



let targets = {
	"1":"3D","2":"3D","3":"3D","4":"3D","5":"3D","6":"3D","7":"3D","8":"3D","9":"3D","10":"3D","11":"3D","12":"3D",
	"13":"Field","14":"Field","15":"Field","16":"Field","17":"Field","18":"Field","19":"Field","20":"Field","21":"Field","22":"Field","23":"Field","24":"Field",
}
