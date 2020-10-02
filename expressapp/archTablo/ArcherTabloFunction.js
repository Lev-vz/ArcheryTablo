function setDate(varName, date){
	let ret = null;
	let funcSend = function() { //когда iframe загрузится - тогда и выполним запрос
		new_rcv.contentWindow.document.getElementsByName('value')[0].value = date;//value 
		new_rcv.contentWindow.document.getElementsByName('variable')[0].value = varName;//variable; 
		new_rcv.onload = funcRec;
		new_rcv.contentWindow.document.getElementById('form').submit();
	}	
	let funcRec = function() { //когда придёт ответ от PHP, тогда и обработаем его
		ret = new_rcv.contentWindow.document.body.innerHTML;
		new_rcv.remove();
		document.getElementById(varName).innerHTML = ret;
	}	
	let new_rcv     = document.createElement("iframe");
	new_rcv.src 	= "../setDate.html";
	new_rcv.onload = funcSend;
	new_rcv.style.display = "none";
	document.body.append(new_rcv);
}

let answer = {};

function getDate(varName){
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
	new_rcv.src 	= "../getDate.html";
	new_rcv.onload = funcSendGet;
	new_rcv.style.display = "none";
	document.body.append(new_rcv);
}

let requestNamber = 0;

function getAllDate(){
	answer['allDate'] = null;
	requestNamber++;
	if(requestNamber > 32767)	requestNamber = 0;						//даём запросу 
	let rcv_name = 'req'+requestNamber;									//уникальный идентификатор

	let new_rcv = createIframe(rcv_name);								//чтобы не переходить на другую страницу, создаём контейнер запроса
	new_rcv.onload = function() { 
		answer['allDate'] = new_rcv.contentWindow.document.body.innerHTML;
		new_rcv.remove();
	}	//когда придёт ответ от PHP, тогда и обработаем его

	let new_sender    = createForm(rcv_name, '/getAllDate');			//создаём форму запроса

	//createFld('data',     data+1,  new_sender);						//наполняем запрос

	new_sender.submit();												//отсылаем запрос
	new_sender.remove();												//удаляем форму
}

function createIframe(rcv_name){//имя iframe для идентификации
	let new_rcv           = document.createElement("iframe");
	new_rcv.name          = rcv_name;
	new_rcv.style.display = "none";
	document.body.append(new_rcv);
	return new_rcv;
}

function createForm(rcv_name, phpFile){//имя iframe, к которому привязана форма и имя PHP-файла, который будет обрабатывать запрос
	let new_sender    = document.createElement("form");
	new_sender.action = phpFile;
	new_sender.method = "post";
	new_sender.target = rcv_name;
	document.body.append(new_sender);
	return new_sender;
}
