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
		//if(
		registration(event.data, socket)
		//) return;
		//if(updateData(event.data)) return;
		
		try{
			let obj = JSON.parse(event.data);
			for(key in obj){
				let tmp = document.getElementById(key)
				if(tmp) tmp.innerHTML = obj[key];
			}
		}catch(err){};
	};

	socket.onclose = function(event) {
		//alert('No connect with WebSocketServer');
		//timeoutId = setTimeout(setWebSocketClient, 10000); //Если было отключение сервера, клиент раз в 10 секунд пытается подключиться снова
	};

	//socket.onerror = function(error) {alert(`[error] ${error.message}`);};
}

function wsRequest(func, data) {// показать сообщение в div#subscribe
	if(!socket) return;
	let obj = {};
	obj['func'] = func;
	obj['data'] = data;
	socket.send(JSON.stringify(obj));
}

function registration(message, socket){
	if(message=='Hi, client!'){
		socket.send('Result saver');
		return true;
	}
	return false;
}

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

	/*
function setData(group, index, target, arrow, points){
	alert("groupIndex="+groupIndex+", target="+target+", arrayNumb="+arrow+", points="+points);
	let ret = null;
	let funcSend = function() { //когда iframe загрузится - тогда и выполним запрос
		new_rcv.contentWindow.document.getElementsByName('group')[0].value = group;
		new_rcv.contentWindow.document.getElementsByName('index')[0].value = index;
		new_rcv.contentWindow.document.getElementsByName('target')[0].value = target; 
		new_rcv.contentWindow.document.getElementsByName('arrow')[0].value = arrow;
		new_rcv.contentWindow.document.getElementsByName('points')[0].value = points; 
		new_rcv.onload = funcRec;
		new_rcv.contentWindow.document.getElementById('form').submit();
	}	
	let funcRec = function() { //когда придёт ответ от PHP, тогда и обработаем его
		ret = new_rcv.contentWindow.document.body.innerHTML;
		new_rcv.remove();
		document.getElementById("out").innerHTML = ret;
	}	
	let new_rcv     = document.createElement("iframe");
	new_rcv.src 	= "./setData.html";
	new_rcv.onload = funcSend;
	new_rcv.style.display = "none";
	document.body.append(new_rcv);
}

function getGroup(varName){
	answer[varName] = null;
	let funcSendGet = function() { //когда iframe загрузится - тогда и выполним запрос
		new_rcv.contentWindow.document.getElementsByName('variable')[0].value = varName; 
		new_rcv.onload = funcRecGet;
		new_rcv.contentWindow.document.getElementById('form').submit();
	}	
	let funcRecGet = function() { //когда придёт ответ от PHP, тогда и обработаем его
		answer[varName] = new_rcv.contentWindow.document.body.innerHTML;
		new_rcv.remove();
	}	
	let new_rcv     = document.createElement("iframe");
	new_rcv.src 	= "../getGroup.html";
	new_rcv.onload = funcSendGet;
	new_rcv.style.display = "none";
	document.body.append(new_rcv);
}
	*/
		
