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
							for(let j = 0; j < obj.data[keyArr[i].key].summs.length; j++){
								newRow.insertCell().innerHTML = obj.data[keyArr[i].key].summs[j];
							}
							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].fullSumm
							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].averageArrow
						}
					}
					break;
					default:
					showTable.innerHTML = '';
					{
						let keyArr = [];
						let i = 0;
						for(key in obj.data){
							keyArr.push({'key':key, 'txt':obj.data.class, 'num':obj.data.summ});
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
						for(let i = 0; i < Q_TARGET; i++){
							tmp = newRow.insertCell()
							tmp.width = 20;
							tmp.innerHTML = ""+ (i+1);
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
							for(let j = 0; j < Q_TARGET; j++){
								let smollTable = '<table>';
								for(let k = 0; k < obj.data[keyArr[i].key].arr[j].length; k++){
									smollTable += '<tr><td>' + obj.data[keyArr[i].key].arr[j][k] + '</td></tr>'
								}
								smollTable += '</table>'
								newRow.insertCell().innerHTML = smollTable;
							}
							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].summ
							newRow.insertCell().innerHTML = obj.data[keyArr[i].key].averageArrow
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
