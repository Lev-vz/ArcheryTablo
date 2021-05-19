let ip = location.host;
let x = ip.indexOf(':');
if(x>0) ip = ip.substring(0,x);

let socket = null;
let timeoutId = null;

setWebSocketClient();

function setWebSocketClient(){
	//if(timeoutId) clearTimeout(timeoutId);
	socket = new WebSocket('ws://'+ip+':3001');// создать подключение

	socket.onmessage = function(event) {// обработчик входящих сообщений
		if(registration(event.data, socket)) return;
		//----- если это была не регмстрация ws-клиента - начинаем обработку данных
		try{
			let obj = JSON.parse(event.data);
			if('table' in obj){
				let showTable = document.getElementById('ResultTable')
				if(!showTable) return;
				switch(currTable){
					case 'groupControl':
					showTable.innerHTML = '';
					{
						let newRow = showTable.insertRow();
						newRow.style.backgroundColor = '#444444';
						newRow.style.color = '#FFFFFF';
						//------------- Заголовки --------------------
						newRow.insertCell().innerHTML = '№';
						newRow.insertCell().innerHTML = 'Первая</br>мишень';
						newRow.insertCell().innerHTML = 'Текущая</br>мишень';
						newRow.insertCell().innerHTML = 'Последняя</br>заполненная</br>мишень';
						newRow.insertCell().innerHTML = 'clientId';
						newRow.insertCell().innerHTML = 'Готовность';
						newRow.insertCell().innerHTML = 'Пароль';
						//-------- заполнение таблицы -------------------
						for(let i = 0; i < obj.table.length; i++){
							newRow = showTable.insertRow();
							newRow.style.backgroundColor = (i%2)? '#EEEEEE' : '#FFFFDD';
							for(let j = 0; j < obj.table[i].length; j++){
								tmp = newRow.insertCell()
								tmp.innerHTML = obj.table[i][j]
								if(j==5){
									tmp.id = i+1;
									tmp.onclick = function() {
										wsRequest('setReady', this.id)
									}
								}
							}
						}
					}
					break;
					case 'archersControl':
					showTable.innerHTML = '';
					{
						let keyArr = []
						for(let i = 0; i < obj.table.length; i++){
							keyArr.push({'npp':i, 'txt':obj.table[i][0]});
						}
						keyArr.sort(compareTxt);
						// Insert a row in the table at row index 0
						let newRow = showTable.insertRow(0);
						newRow.style.backgroundColor = '#444444';
						newRow.style.color = '#FFFFFF';
						newRow.insertCell().innerHTML = '№';
						newRow.insertCell().innerHTML = 'Имя';
						newRow.insertCell().innerHTML = 'Класс/Дивизион';
						newRow.insertCell().innerHTML = 'Клуб';
						newRow.insertCell().innerHTML = 'Группа';
						newRow.insertCell().innerHTML = 'Индекс';
						for(let i = 0; i < keyArr.length; i++){
							let newRow = showTable.insertRow();
							newRow.style.backgroundColor = (i%2)? '#EEEEEE' : 'FFFFDD';
							newRow.insertCell().innerHTML = i + 1;
							
							let tmp = newRow.insertCell()
							tmp.innerHTML = obj.table[keyArr[i].npp][0];//имя
							tmp.style.textAlign = 'left';//
							
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][3];//класс
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][4];//клуб
							tmp = newRow.insertCell();
							tmp.innerHTML = obj.table[keyArr[i].npp][1];//группа
							tmp.id = obj.table[keyArr[i].npp][0];
							tmp.onclick = function() {
								let newGroup = prompt('Введите новую группу для лучника ' + this.id);
								if(newGroup == null || newGroup == '') return;
								wsRequest('setGroup', {'name':this.id, 'val':newGroup})
							}
							
							tmp = newRow.insertCell();
							tmp.innerHTML = obj.table[keyArr[i].npp][2];//индекс
							tmp.id = obj.table[keyArr[i].npp][0];
							tmp.onclick = function() {
								let newIndex = prompt('Введите новый индех для лучника ' + this.id);
								if(newIndex == null || newIndex == '') return;
								wsRequest('setIndex', {'name':this.id, 'val':newIndex})
							}
						}
					}
					break;
				}
			}else{
				document.getElementById('TournamentName').innerHTML = obj['TournamentName'];
				document.getElementById('currRound').innerHTML 		= obj['currRound'];
				document.getElementById('targetsType').innerHTML 	= obj['targetsType'];
				document.getElementById('cnst.Q_TARGET').innerHTML 		= obj.cnst['Q_TARGET'];
				document.getElementById('cnst.Q_ARROW').innerHTML 		= obj.cnst['Q_ARROW'];
				document.getElementById('cnst.Q_ROUNDS').innerHTML 		= obj.cnst['Q_ROUNDS'];
			}
			
		}catch(err){};
	};

	socket.onclose = function(event) {
		//alert('No connect with WebSocketServer');
		//timeoutId = setTimeout(setWebSocketClient, 3000); //Если было отключение сервера, клиент раз в ... секунд пытается подключиться снова
	};

	socket.onerror = function(error) {alert(`[error] ${error.message}`);};
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
		let obj = {};
		obj['func'] = 'getCurrSetting';
		socket.send(JSON.stringify(obj));
		return true;
	}
	return false;
}

function rgb2hex(r, g, b){
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function compareTxt(a, b) {
  if (a.txt < b.txt) return -1;
  if (a.txt > b.txt) return 1;
  if (a.txt == b.txt) return 0;
}

function compareNum(a, b) {
  if (a.num < b.num) return -1;
  if (a.num > b.num) return 1;
  if (a.num == b.num) return 0;
}
function compareNum90(a, b) {
  if (a.num > b.num) return -1;
  if (a.num < b.num) return 1;
  if (a.num == b.num) return 0;
}
