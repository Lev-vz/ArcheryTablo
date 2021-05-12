let ip = location.host;
let x = ip.indexOf(':');
if(x>0) ip = ip.substring(0,x);

let socket = null;
let timeoutId = null;

setWebSocketClient();

function setWebSocketClient(){
	//if(timeoutId) clearTimeout(timeoutId);
	socket = new WebSocket('ws://'+ip+':3003');// создать подключение

	socket.onmessage = function(event) {// обработчик входящих сообщений
		//if(registration(event.data, socket)) return;
		//----- если это была не регмстрация ws-клиента - начинаем обработку данных
		try{
			let obj = JSON.parse(event.data);
			if('dataType' in obj){
				let showTable = document.getElementById('ResultTable')
				if(!showTable) return;
				switch(obj.dataType){
					case 'shortData':
					showTable.innerHTML = '';
					{
						let keyArr = [];
						let i = 0;
						for(key in obj.data){
							keyArr.push({'key':key, 'txt':obj.data.class, 'num':obj.data.allRoundSumm});
						}
						keyArr.sort(compareTxt);
						keyArr.sort(compareNum90);
						//------------- Заголовки --------------------
						// Insert a row in the table at row index 0
						let newRow = showTable.insertRow(0);
						newRow.style.backgroundColor = '#444444';
						newRow.style.color = '#FFFFFF';
						newRow.insertCell().innerHTML = '№';
						newRow.insertCell().innerHTML = 'Имя';
						newRow.insertCell().innerHTML = 'Гр./</br>инд';
						let tmp;
						for(let i = 0; i < Q_ROUNDS; i++){
							tmp = newRow.insertCell()
							tmp.width = 20;
							tmp.innerHTML = "Круг</br>№ "+ (i+1);
						}
						newRow.insertCell().innerHTML = 'Сумма за</br>все круги';
						newRow.insertCell().innerHTML = 'Средняя</br>стрела';
						let cassDiv = '';
						//-------- заполнение таблицы -------------------
						for(let i = 0; i < keyArr.length; i++){
							let newRow = showTable.insertRow();
							newRow.style.backgroundColor = (i%2)? '#EEEEEE' : 'FFFFDD';
							newRow.insertCell().innerHTML = i + 1;
							
							let name = newRow.insertCell()
							name.innerHTML = keyArr[i].key;//имя
							name.style.textAlign = 'left';//
							
							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].group + obj.data[keyArr[i].key].index;//класс
							for(let i = 0; i < obj.data[keyArr[i].key].summs.length; i++){
								newRow.insertCell().innerHTML = obj.data[keyArr[i].key].summs[i];
							}
							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].fullSumm
							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].averageArrow
						}
					}
					break;
				/*
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
							}
						}
					}
					break;
				*/
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

function wsRequest(func, data) {
	if(!socket) return;
	let obj = {};
	obj['func'] = func;
	obj['data'] = data;
	socket.send(JSON.stringify(obj));
}
/*
function registration(message, socket){
	if(message=='Hi, client!'){
		let obj = {};
		obj['func'] = 'All results table';
		socket.send(JSON.stringify(obj));
		getTable(currTable);
		return true;
	}
	return false;
}
*/
