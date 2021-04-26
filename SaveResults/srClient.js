let ip = location.host;
let x = ip.indexOf(':');
if(x>0) ip = ip.substring(0,x);
//alert(ip);

let socket = null;
let timeoutId = null;

setWebSocketClient();

function setWebSocketClient(){
	//if(timeoutId) clearTimeout(timeoutId);
	socket = new WebSocket('ws://'+ip+':3001');// создать подключение

	socket.onmessage = function(event) {// обработчик входящих сообщений
		registration(event.data, socket)
		
		try{
			let obj = JSON.parse(event.data);
			for(key in obj){
				let tmp = document.getElementById(key)
				if(tmp){
					tmp.innerHTML = obj[key];
					if(key == 'ready'){
						if(obj[key] == GROUP_READY){
							tmp.style.color = '#000000'
							tmp.style.backgroundColor = '#DDDDDD'
						}else if(obj[key] == ALL_READY){
							tmp.style.color = '#000000'
							tmp.style.backgroundColor = '#44FF44'
						}else{
							tmp.style.color = '#FFFF00'
							tmp.style.backgroundColor = '#FF0000'
						}
					}else if(key == 'targetType'){
						if(obj[key] == '3D'){
							document.getElementById('FieldButton').style.display = 'none'
							document.getElementById('3dButton').style.display = 'block'
							document.getElementById('13').innerHTML = '';
							document.getElementById('23').innerHTML = '';
							document.getElementById('33').innerHTML = '';
							document.getElementById('43').innerHTML = '';
						}else{
							document.getElementById('FieldButton').style.display = 'block'
							document.getElementById('3dButton').style.display = 'none'
						}
					}
				}
			}
		}catch(err){};
	};

	socket.onclose = function(event) {
		//alert('No connect with WebSocketServer');
		//timeoutId = setTimeout(setWebSocketClient, 10000); //Если было отключение сервера, клиент раз в 10 секунд пытается подключиться снова
	};

	//socket.onerror = function(error) {alert(`[error] ${error.message}`);};
}
function getUserId(cook){
	let start = cook.indexOf('userId=');
	if(start<0) return '';
	start += 7;
	let end = cook.indexOf(';',start);
	if(end > 0) return cook.substring(start, end)
	else  		return cook.substring(start)
}

function wsRequest(func, data) {// показать сообщение в div#subscribe
	if(!socket) return;
	let obj = {};
	obj['func'] = func;
	obj['data'] = data;
	obj['userId'] = getUserId(document.cookie);
	socket.send(JSON.stringify(obj));
}

function registration(message, socket){
	if(message=='Hi, client!'){
		let obj = {};
		obj['func'] = 'Result saver';
		obj['userId'] = getUserId(document.cookie);
		socket.send(JSON.stringify(obj));
		return true;
	}
	return false;
}
/*
function updateData(msg){
	try{
		let allDate = JSON.parse(msg)
		for(key in allDate){
			let tmp = document.getElementById(key);
			if(tmp) tmp.innerHTML = allDate[key];
		}
		document.getElementById('curSerieBig').innerHTML = allDate.curSerie;
		bigBox.style.backgroundColor = allDate.color;
	}catch(e){}
	
	return true;
}
*/