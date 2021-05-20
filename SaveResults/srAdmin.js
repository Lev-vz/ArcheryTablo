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
			if('cnst' in obj){
				document.getElementById('TournamentName').innerHTML = obj['TournamentName'];
				document.getElementById('currRound').innerHTML 		= obj['currRound'];
				document.getElementById('targetsType').innerHTML 	= obj['targetsType'];
				document.getElementById('cnst.Q_TARGET').innerHTML 		= obj.cnst['Q_TARGET'];
				document.getElementById('cnst.Q_ARROW').innerHTML 		= obj.cnst['Q_ARROW'];
				document.getElementById('cnst.Q_ROUNDS').innerHTML 		= obj.cnst['Q_ROUNDS'];
			}else{
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
					case 'archersControlClass':
					showTable.innerHTML = '';
					{
						let keyArr = [];
						for(key in obj.data){
							keyArr.push({'key':key, 'txt':obj.data[key].class, 'txt2':key});
						}
						keyArr.sort(compareTxt2);
						keyArr.sort(compareTxt);
						//------------- Заголовки --------------------
						// Insert a row in the table at row index 0
						let newRow = showTable.insertRow(0);
						newRow.style.backgroundColor = '#444444';
						newRow.style.color = '#FFFFFF';
						newRow.insertCell().innerHTML = '№';
						newRow.insertCell().innerHTML = 'Имя';
						newRow.insertCell().innerHTML = 'Группа';
						newRow.insertCell().innerHTML = 'Индекс';
						let cassDiv = '';
						let j = 1;
						//-------- заполнение таблицы -------------------
						for(let i = 0; i < keyArr.length; i++){
							let newRow = showTable.insertRow();
							if(cassDiv != obj.data[keyArr[i].key].class){
								cassDiv = obj.data[keyArr[i].key].class;
								newRow.style.backgroundColor = '#666666';
								newRow.style.color = '#FFFFFF';
								let newCell = newRow.insertCell();
								newCell.colSpan = 4;
								newCell.innerHTML = cassDiv;
								newRow = showTable.insertRow();
								j = 1;
							}
							newRow.style.backgroundColor = (i%2)? '#EEEEEE' : 'FFFFDD';
							newRow.insertCell().innerHTML = j++;
							
							let name = newRow.insertCell()
							name.innerHTML = keyArr[i].key;//имя
							name.style.textAlign = 'left';//
							//name.id = keyArr[i].key;
							name.onclick = function() {
								//if(confirm('Удалить из списка лучника ' + this.id)) wsRequest('delArcher', 'name':this.id)
								if(confirm('Удалить из списка лучника ' + keyArr[i].key)) wsRequest('delArcher', keyArr[i].key)
							}
							
							let tmp = newRow.insertCell()
							tmp.innerHTML = obj.data[keyArr[i].key].group;
							tmp.id = keyArr[i].key;
							tmp.onclick = function() {
								let newGroup = prompt('Введите новую группу для лучника ' + this.id);
								if(newGroup == null || newGroup == '') return;
								wsRequest('setGroup', {'name':this.id, 'val':newGroup})
							}

							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].index;
						}
					}
					break;
					case 'archersControlGroup':
					showTable.innerHTML = '';
					{
						let keyArr = [];
						for(key in obj.data){
							keyArr.push({'key':key, 'txt':obj.data[key].index, 'txt2':obj.data[key].group, 'num':parseInt(obj.data[key].group)});
						}
						keyArr.sort(compareTxt);
						keyArr.sort(compareTxt2);
						keyArr.sort(compareNum);
						//------------- Заголовки --------------------
						// Insert a row in the table at row index 0
						let newRow = showTable.insertRow(0);
						newRow.style.backgroundColor = '#444444';
						newRow.style.color = '#FFFFFF';
						newRow.insertCell().innerHTML = 'Индекс';
						newRow.insertCell().innerHTML = 'Имя';
						newRow.insertCell().innerHTML = 'Класс/дивизион';
						let group = '';
						//-------- заполнение таблицы -------------------
						for(let i = 0; i < keyArr.length; i++){
							let newRow = showTable.insertRow();
							if(group != obj.data[keyArr[i].key].group){
								group = obj.data[keyArr[i].key].group;
								newRow.style.backgroundColor = '#666666';
								newRow.style.color = '#FFFFFF';
								let newCell = newRow.insertCell();
								newCell.colSpan = 4;
								newCell.innerHTML = group;
								newRow = showTable.insertRow();
							}
							newRow.style.backgroundColor = (i%2)? '#EEEEEE' : 'FFFFDD';
							//newRow.insertCell().innerHTML = obj.data[keyArr[i].key].index;
							let tmp = newRow.insertCell()
							tmp.innerHTML = obj.data[keyArr[i].key].index;
							tmp.id = keyArr[i].key;
							tmp.onclick = function() {
								let newGroup = prompt('Введите новый индекс для лучника ' + this.id);
								if(newGroup == null || newGroup == '') return;
								wsRequest('setIndex', {'name':this.id, 'val':newGroup})
							}
							
							let name = newRow.insertCell()
							name.innerHTML = keyArr[i].key;//имя
							name.style.textAlign = 'left';//
							
							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].class;
						}
					}
					break;
				}
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
	document.getElementById('ResultTable').innerHTML = '';
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
function compareTxt2(a, b) {
  if (a.txt2 < b.txt2) return -1;
  if (a.txt2 > b.txt2) return 1;
  if (a.txt2 == b.txt2) return 0;
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
