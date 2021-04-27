let ip = location.host;
let x = ip.indexOf(':');
if(x>0) ip = ip.substring(0,x);

let socket = null;
let timeoutId = null;

setWebSocketClient();

function setWebSocketClient(){
	if(timeoutId) clearTimeout(timeoutId);
	socket = new WebSocket('ws://'+ip+':3001');// создать подключение

	socket.onmessage = function(event) {// обработчик входящих сообщений
		if(registration(event.data, socket)) return;
		//----- если это была не регмстрация ws-клиента - начинаем обработку данных
		try{
			let obj = JSON.parse(event.data);
			if('table' in obj){
				let tmp = document.getElementById('ResultTable')
				if(!tmp) return;
				let qCols = 1;
				for(let i = 0; i < obj.table.length; i++){
					if(obj.table[i].length > qCols) qCols = obj.table[i].length;
				}
				let tableContent = '';
				//tableContent += '<tr style="background-color:#444444; color:#FFFFFF; text-align: center"><b>'
				//tableContent += '<td colspan="' + qCols + '">'+ obj.table[0][0] + '</b></td></tr>\n'
				let bgColor = '#DDDDDD'
				for(let i = 0; i < obj.table.length; i++){
					if(obj.table[i].length == 1){
						tableContent += '<tr style="background-color:#888888; color:#DDDDDD;" colspan="' + qCols + '"><b>'
						tableContent += '<td>'+ obj.table[i][0] + '</b></td></tr>\n';
					}else{
						tableContent += '<tr>'//' + bgColor +';">';
						for(let j = 0; j < obj.table[i].length; j++){
							let cellContent = obj.table[i][j];
							if((''+cellContent).length < 3) tableContent += '<td style="background-color:#4488FF" width=20>' + obj.table[i][j] + '</td>';
							else tableContent += '<td style="background-color:#4488FF">' + obj.table[i][j] + '</td>';
						}
						tableContent += '</tr>\n';
					}
				}
				tmp.innerHTML = tableContent;
			}
		}catch(err){};
	};

	socket.onclose = function(event) {
		//alert('No connect with WebSocketServer');
		timeoutId = setTimeout(setWebSocketClient, 60000); //Если было отключение сервера, клиент раз в ... секунд пытается подключиться снова
	};

	//socket.onerror = function(error) {alert(`[error] ${error.message}`);};
}

function wsRequest(data) {// показать сообщение в div#subscribe
	if(!socket) return;
	let obj = {};
	obj['func'] = 'getTable';
	obj['data'] = data;
	socket.send(JSON.stringify(obj));
}

function registration(message, socket){
	if(message=='Hi, client!'){
		let obj = {};
		obj['func'] = 'Result table';
		socket.send(JSON.stringify(obj));
		return true;
	}
	return false;
}
