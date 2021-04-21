let ip = location.host;
let x = ip.indexOf(':');
if(x>0) ip = ip.substring(0,x);
//alert(ip);

let socket = null;
let timeoutId = null;

setWebSocketClient();


function setWebSocketClient(){
	if(timeoutId) clearTimeout(timeoutId);
	socket = new WebSocket('ws://'+ip+':8081');// создать подключение

	socket.onmessage = function(event) {// обработчик входящих сообщений
		if(registration(event.data, socket)) return;
		if(updateData(event.data)) return;
		
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
		timeoutId = setTimeout(setWebSocketClient, 3000);
	};

	//socket.onerror = function(error) {alert(`[error] ${error.message}`);};
}

function setData(variable, value) {// показать сообщение в div#subscribe
	if(!socket) return;
	let obj = {};
	obj[variable] = +value;
	socket.send(JSON.stringify(obj));
}
/*
function showMessage(message) {// показать сообщение в div#subscribe
  let messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}
*/