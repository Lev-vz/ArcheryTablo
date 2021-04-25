const express = require("express");// подключение express
const WebSocketServer = new require('ws');
const fs = require("fs");

const srn = require("./srNode");
const cnst = require("./const");

let setting = {};
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

setting['Round1'] = tournamentPath + '/round1';
try {
  if (!fs.existsSync(setting.Round1)){
    fs.mkdirSync(setting.Round1)
  }
} catch (err) {
  console.error(err)
}

setting['Round2'] = tournamentPath + '/round2';
try {
  if (!fs.existsSync(setting.Round2)){
    fs.mkdirSync(setting.Round2)
  }
} catch (err) {
  console.error(err)
}

setting['currRound'] = setting.Round1 + '/';

function saveInFile(fileName, obj){
	try{															//записываем новые данные в файл на случай краха
		fs.writeFileSync(fileName, JSON.stringify(obj), 'utf8');
		//console.log(groupInfo);
	}catch(err){
		console.log('Ошибка записи в файл ' + fileName,err);
	}
}

function uploadFromFile(fileName, obj){
	try{															//записываем новые данные в файл на случай краха
		obj['data'] = JSON.parse(fs.readFileSync(fileName, 'utf8'));
		return true;
		//console.log(groupInfo);
	}catch(err){
		return false;
	}
}
//---------------------------------------------------------------------------------------
let archers = {}
let archList = setting.currRound + 'archList.txt'
try{//Читаем список участников
	archers = JSON.parse(fs.readFileSync(archList, 'utf8'));
	for(let key in archers){
		let archerData = {};
		if(uploadFromFile(setting.currRound + key.trim()+'.pnt', archerData)){
			archers[key]['arr'] = archerData.data.arr;
			//console.log('archerData='+JSON.stringify(archerData.data.arr));//---------------------------------------------checkOut-----------------------------------------------
		}else{
			archers[key]['arr']=[]
			for(let i=0; i<cnst.Q_TARGET; i++){
				archers[key]['arr'][i]=[];
				for(let j=0; j<cnst.Q_ARROW; j++){
					archers[key]['arr'][i][j] = 0;
				}
			}
		}
	}
	fs.writeFileSync(archList, JSON.stringify(archers), 'utf8');
}catch(err){
	console.log('Ошибка чтения списка участников',err);
	return;
}

const clients = {};// подключённые клиенты

//let data = {};
let groupInfo = {};//Информация о группах

let grInfoPath = setting.currRound + 'groupInfo.txt'
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
			groupInfo[group]["clientId"] = "";
			groupInfo[group]["ready"] = false;
			let pass = "" + Math.random();
			groupInfo[group]["pass"] = pass.substring(2,6);
		}
	}
	saveInFile(grInfoPath, groupInfo);
};

srn.saveGroupInfo(groupInfo, "", "", fs);

//----------------------- Запуск обычного HTTP Server ------------------------------------
const exp = express();
let connInd = 1;
exp.get("/", function (request, response) {
	/*
	let ip = request.ip;
	let ips = request.ips;
	let str = "ip="+ip+", ips="+ips+"\n";
	let conn = request.connection;
	let head = request.headers;
	for(let key in head){
		try{															//записываем новые данные в файл на случай краха
			str += 'head['+key+'] = ' + head[key]+ '\n';//---------------------------------------------checkOut-----------------------------------------------
		}catch(err){
			str += 'key='+ key +'\n';
		}
	}
	for(let key in conn){
		try{															//записываем новые данные в файл на случай краха
			str += 'conn['+key+'] = ' + conn[key]+ '\n';//---------------------------------------------checkOut-----------------------------------------------
		}catch(err){
			str += 'key='+ key +'\n';
		}
	}
	fs.writeFileSync('conn'+connInd+'.txt', str, 'utf8');
	*/
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
			clients[clientIp] = ws;			//регистрируем его как получателя информации о смене времени и режима
			srn.getGroupInfo(groupInfo, archers, clientIp, targets, resp);
			ws.send(JSON.stringify(resp));
		}else{
			try{
				let obj = JSON.parse(msg);
				switch(obj.func){
					case 'setPoint2Cell':
						let archer = obj.data.name;
						let target = obj.data.target - 1;
						archers[archer].arr[target][obj.data.arrow - 1] = obj.data.points;
						srn.getPointsInfo(archers, archer, target, targets[target], obj.data.row, resp)
						ws.send(JSON.stringify(resp));
						saveInFile(setting.currRound + archer.trim() + '.pnt', archers[archer]);
						break;
					case 'sendReady':
						if(srn.isAllReady(groupInfo)){
							resp['ready'] = cnst.ALL_READY;
							for(let key in clients)clients[key].send(JSON.stringify(resp));
						}
						else{
							resp['ready'] = cnst.GROUP_READY;
							ws.send(JSON.stringify(resp));
						}
						fs.writeFileSync('groupInfo.txt', JSON.stringify(groupInfo), 'utf8');
						break;
					case cnst.NEXT_TARGET :
						{
							let gr = obj.data.group;
							if(groupInfo[gr].currTarget < targets.length) groupInfo[gr].currTarget++;
							else groupInfo[gr].currTarget = 1;
							srn.getGroupInfo(groupInfo, archers, clientIp, targets, resp);
							ws.send(JSON.stringify(resp));
						}
						break;
					case cnst.PREV_TARGET :
						{
							let gr = obj.data.group;
							if(groupInfo[gr].currTarget > 1) groupInfo[gr].currTarget--;
							else groupInfo[gr].currTarget = targets.length;
							srn.getGroupInfo(groupInfo, archers, clientIp, targets, resp);
							ws.send(JSON.stringify(resp));
						}
						break;
				}
				//console.log('resp='+JSON.stringify(resp));
				
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


//				1		2		3		4		5		6		7		8		9		10		11		12
let targets = ['3D',  '3D',    '3D',   '3D',   '3D',   '3D',   '3D',   '3D',   '3D',   '3D',   '3D',   '3D',
                'Field','Field','Field','Field','Field','Field','Field','Field','Field','Field','Field','Field']
//	"1":"3D","2":"3D","3":"3D","4":"3D","5":"3D","6":"3D","7":"3D","8":"3D","9":"3D","10":"3D","11":"3D","12":"3D",
//	"13":"Field","14":"Field","15":"Field","16":"Field","17":"Field","18":"Field","19":"Field","20":"Field","21":"Field","22":"Field","23":"Field","24":"Field",
//}
