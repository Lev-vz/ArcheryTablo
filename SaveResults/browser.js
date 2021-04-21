if (!window.WebSocket) {
	document.forms.publish.message.value = 'WebSocket в этом браузере не поддерживается.';
}

let ip = location.host;
let x = ip.indexOf(':');
if(x>0) ip = ip.substring(0,x);
//alert(ip);

let socket = null;
setWebSocketClient();

document.forms.publish.onsubmit = function() {// отправить сообщение из формы publish
  socket.send(this.message.value);
  return false;
};

function setWebSocketClient(){
	socket = new WebSocket('ws://'+ip+':8081');// создать подключение
	if(!socket){
		alert('No WebSocket server:', socket);
		setTimeout(setWebSocketClient, 3000);
		return;
	}
	
	socket.onmessage = function(event) {// обработчик входящих сообщений
		showMessage(JSON.stringify(event));
		if(event.data=='Hi!') socket.send('Tablo');
	};

	socket.onclose = function(event) {
	  if (event.wasClean) {
		alert(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
	  } else {
		// например, сервер убил процесс или сеть недоступна
		// обычно в этом случае event.code 1006
		alert('Соединение прервано. Code: ', event.code);
	  }
	  setTimeout(setWebSocketClient, 3000);
	};

	//socket.onerror = function(error) {alert(`[error] ${error.message}`);};
	
	//socket.send('Tablo');
}

function showMessage(message) {// показать сообщение в div#subscribe
  let messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}
