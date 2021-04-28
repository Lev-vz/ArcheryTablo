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
				let showTable = document.getElementById('ResultTable')
				if(!showTable) return;
				switch(currTable){
					case 'abcTable':
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
							
							let name = newRow.insertCell()
							name.innerHTML = obj.table[keyArr[i].npp][0];//имя
							name.style.textAlign = 'left';//
							
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][3];//класс
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][4];//клуб
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][1];//группа
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][2];//индекс
						}
					}
					break;
					/**/
					case 'groupTable':
					showTable.innerHTML = '';
					{
						let keyArr = []
						for(let i = 0; i < obj.table.length; i++){
							keyArr.push({'npp':i, 'txt': obj.table[i][1]+obj.table[i][2], 'num':parseInt(obj.table[i][1])});
						}
						keyArr.sort(compareTxt);
						keyArr.sort(compareNum);
						let newRow = showTable.insertRow(0);
						newRow.style.backgroundColor = '#444444';
						newRow.style.color = '#FFFFFF';
						//------------- Заголовки --------------------
						newRow.insertCell().innerHTML = '№';
						newRow.insertCell().innerHTML = 'Имя';
						newRow.insertCell().innerHTML = 'Класс/Дивизион';
						let tmp;
						for(let i = 0; i < Q_TARGET; i++){
							tmp = newRow.insertCell()
							tmp.width = 20;
							tmp.innerHTML = i+1
						}
						newRow.insertCell().innerHTML = 'Сумма';
						newRow.insertCell().innerHTML = 'Средняя</br>стрела';
						let group = '';
						//-------- заполнение таблицы -------------------
						for(let i = 0; i < keyArr.length; i++){
							newRow = showTable.insertRow();
							if(group != obj.table[keyArr[i].npp][1]){
								group = obj.table[keyArr[i].npp][1];
								
								newRow.style.backgroundColor = '#888888';
								newRow.style.color = '#FFFFDD';
								
								tmp = newRow.insertCell();
								tmp.colSpan = Q_TARGET + 6;
								tmp.innerHTML = 'Группа №' + group;
								newRow = showTable.insertRow();
							}
							newRow.style.backgroundColor = (i%2)? '#EEEEEE' : '#FFFFDD';
							newRow.insertCell().innerHTML = i + 1;
							
							let name = newRow.insertCell()
							name.innerHTML = obj.table[keyArr[i].npp][0];
							name.style.textAlign = 'left';//
							
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][3];
							for(let j = 0; j < Q_TARGET; j++){
								tmp = newRow.insertCell()
								//tmp.width = 20;
								tmp.innerHTML = obj.table[keyArr[i].npp][j+5]
							}
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][Q_TARGET + 5];
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][Q_TARGET + 6];
						}
					}
					break;
					case 'classTable':
					showTable.innerHTML = '';
					{
						let keyArr = []
						for(let i = 0; i < obj.table.length; i++){
							keyArr.push({'npp':i, 'txt': obj.table[i][3], 'num':parseFloat(obj.table[i][Q_TARGET + 6])});
						}
						keyArr.sort(compareNum90);
						keyArr.sort(compareTxt);
						let newRow = showTable.insertRow(0);
						newRow.style.backgroundColor = '#444444';
						newRow.style.color = '#FFFFFF';
						//------------- Заголовки --------------------
						newRow.insertCell().innerHTML = '№';
						newRow.insertCell().innerHTML = 'Имя';
						newRow.insertCell().innerHTML = 'Гр./</br>инд';
						let tmp;
						for(let i = 0; i < Q_TARGET; i++){
							tmp = newRow.insertCell()
							tmp.width = 20;
							tmp.innerHTML = i+1
						}
						newRow.insertCell().innerHTML = 'Сумма';
						newRow.insertCell().innerHTML = 'Средняя</br>стрела';
						let cassDiv = '';
						//-------- заполнение таблицы -------------------
						let k = 1;
						for(let i = 0; i < keyArr.length; i++){
							newRow = showTable.insertRow();
							if(cassDiv != obj.table[keyArr[i].npp][3]){
								cassDiv = obj.table[keyArr[i].npp][3];
								
								newRow.style.backgroundColor = '#888888';
								newRow.style.color = '#FFFFDD';
								
								tmp = newRow.insertCell();
								tmp.colSpan = Q_TARGET + 6;
								tmp.innerHTML = cassDiv;
								newRow = showTable.insertRow();
								k = 1;
							}
							newRow.style.backgroundColor = (k%2)? '#EEEEEE' : '#FFFFDD';
							newRow.insertCell().innerHTML = k++;
							
							let name = newRow.insertCell()
							name.innerHTML = obj.table[keyArr[i].npp][0];
							name.style.textAlign = 'left';//
							
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][1] + obj.table[keyArr[i].npp][2];
							for(let j = 0; j < Q_TARGET; j++){
								tmp = newRow.insertCell()
								//tmp.width = 20;
								tmp.innerHTML = obj.table[keyArr[i].npp][j+5]
							}
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][Q_TARGET + 5];
							newRow.insertCell().innerHTML = obj.table[keyArr[i].npp][Q_TARGET + 6];
						}
					}
					break;
					/**/
				}
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
		getTable('abcTable');
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
