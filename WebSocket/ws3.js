const express = require("express");// подключение express
const WebSocketServer = new require('ws');
const fs = require("fs");

const player = require('node-wav-player');
function gudok(n){
	let soundFile = 'gudok1.wav';
	switch(n){
		case 2: soundFile = 'gudok2.wav'; break;
		case 3: soundFile = 'gudok3.wav'; break;
	}
	
	player.play({ path: soundFile,}).then(() => {
		console.log('The wav file started to be played successfully.');
		}).catch((error) => { console.error(error);}
	);
}
const atn = require("./ArcherTabloNode");
gudok(2);
/*
const os = require('os');
let netIFs = os.networkInterfaces();
console.log('netIFs :===========================================');
console.log(netIFs);
console.log('==============================================================');

for(key in netIFs){
	netIFs[key].forEach(function(item, index, array) {
		console.log('netIFs :-----------------------');
		console.log(item);
		console.log('-------------------------------');
	});
	//break;
}
*/
//----------------------- Запуск обычного HTTP Server ------------------------------------
const exp = express();
exp.get("/", function (request, response) {
    response.sendFile(__dirname + '/index.html');
	gudok(3);
});
exp.listen(8080);// начинаем прослушивать подключения на 3000 порту

exp.get("/*", function (request, response) {
	let arg = request.url;
	if(!(arg.includes('.html') || arg.includes('.htm') || arg.includes('.js') || arg.includes('.ico'))) arg += ".html";
    response.sendFile(__dirname + arg);
});
//---------------------------------------------------------------------------------------

//const clients = {};// подключённые клиенты
const tablos = {};// подключённые tablo
let startId = 0;
let data = {};
let copyData = {};

try{//Пытаемся прочитать файл с информацией от предыддущего запуска сервера, чтобы не приходилось каждый раз вводить настройки
	data = JSON.parse(fs.readFileSync('data.txt', 'utf8'));
}catch(err){};

atn.init(data);
//console.log(data)

function updateData(){
	atn.processing(data);
	let jsonStringfyData = JSON.stringify(data);
	if(jsonStringfyData != copyData){
		copyData = jsonStringfyData;
		atn.updateTablo(jsonStringfyData, tablos);
		//console.log('time='+data.curTime);
	}
}
setInterval(updateData, 1000);

//----------------------- Запуск WebSoket Server ------------------------------------

const webSocketServer = new WebSocketServer.Server({port: 8081});//WebSocket-сервер на порту 8081

webSocketServer.on('connection', function(ws) {
	startId++
	const id = startId;
	if(startId > 32766) startId = 0;
	
	console.log("новое соединение:" + id);
	ws.send('Hi, client!');

	ws.on('message', function(msg) {
		console.log('получено сообщение ' + msg);//---------------------------------------------checkOut-----------------------------------------------
		if(msg.indexOf('Tablo')==0){//если в полученном сообщении есть слово 'Tablo'
			tablos[id]= ws;			//регистрируем его как получателя информации о смене времени и режима
			atn.updateTablo(JSON.stringify(data), tablos); //и сразу отправляем текущее состояние
		}else{
			try{
				let obj = JSON.parse(msg);
				for(key in obj) //смотрим какие поля структуры прислали
					if(data.control == 0 || key =='control') data[key] = obj[key]; //если текущий режим - ожидание (0), записываем любые поля, иначе записываем только команды
				let jsonStringfyData = JSON.stringify(data);					//записываем текущую структу в строку
				if(jsonStringfyData != copyData){								//если она отличается от контрольных данных - значит было изменение
					ws.send(jsonStringfyData);										//отправляем абоненту, от которого прищёл запрос на изменение обновлённые данные
					updateData();													//обновляем контрольные данные
					try{															//записываем новые данные в файл на случай краха
						fs.writeFileSync('data.txt', jsonStringfyData, 'utf8');
						console.log(jsonStringfyData);
					}catch(err){
						console.log('Ошибка записи в файл',err);
					}
				}
			}catch(err){};
		}
	});

	ws.on('close', function() {
		console.log('3акрыто соединение ' + id);
		delete tablos[id];
	});

});
//---------------------------------------------------------------------------------------

console.log("Express in 8080, WebSocket in 8081");

