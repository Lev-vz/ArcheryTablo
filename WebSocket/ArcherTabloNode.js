module.exports.updateTablo = function(data, tablos){
	for(let key in tablos) {
		//console.log('tablos[key]=', key);
		tablos[key].send(data);
	}
}

module.exports.init = function(sootingData){
	sootingData.shootingTime = 0;	//Оставшееся время стрельбы
	sootingData.prevTime = 0;		//Оставшееся время подготовки
	sootingData.qBeep = 0;			//Количество гудков
	sootingData.control = 0;		//режим системы: 0 - ожидание, 1 - работа, 2 - пауза, 3 - переход к следующему индексу
	sootingData.curIndex = 0;		//Текущие индексы - A-B, C-D или E-F
	sootingData.curSerie = 1;		//текущая серия
	sootingData.curTime = 0;		//Время для индикации. В зависимости от текущего режима - время стрельбы или время подготовки
	sootingData.showIndex = 'A,B';	//Отображаемый индекс - не равен текущему при настройке табло
	sootingData.showType = ' разм.';//Отображаемый тип серии - разминочная или зачётная 
	sootingData.color = 'red';		//Цвет светофора
	
	//console.log(sootingData)
}

function getIndex(curIndex){ //возвращает отображаемые индексы по номеру индекса
	switch(curIndex){
		case 0: return 'A,B';
		case 1: return 'C,D';
		case 2: return 'E,F';
	}
	return 'X,X';
}
//sootingData.control == 0 - ожидание, 1 - работа, 2 - пауза, 3 - переход к следующему индексу
module.exports.processing = function(sootingData){ // основная функция - цикл функции должен быть ровно 1 секунда!
	let control = sootingData.control;
	if(control == 1){ 												//если режим - работа
		if(sootingData.controlPrev == 3 || sootingData.controlPrev == 0){// если на предыдущем цикле был режим перехода к следующему индексу или режим ожидания
			sootingData.shootingTime = sootingData.setTime;					//устанавливаем оставшееся время стрельбы
			sootingData.prevTime = 10;										//устанавливаем время подготовки равным настройке максимального времени стрельбы
			sootingData.qBeep = 2;											//устанавливаем количество гудков для команды "выйти на рубеж и готовиться" (2 гудка)
			sootingData.color = 'red';										//устанавливаем цвет светофора красным - "стрельба запрещена"
		}
		else if(sootingData.controlPrev == 2 && sootingData.prevTime == 0){// если на предыдущем цикле был режим "пауза" и время подготовки истекло
			sootingData.qBeep = 1;												//устанавливаем количество гудков для команды "огонь!" (1 гудок)
			sootingData.color = 'green';										//устанавливаем цвет светофора зелёным - "стрельба разрешена"
		}
		else if(sootingData.prevTime > 0) sootingData.prevTime--;		//если на предыдущем цикле не было ни паузы, ни ожидания ни возврата и время подготоки ещё не истекло - уменьшаем время подготовки на 1
		else if(sootingData.shootingTime  > 0){							//если верно всё предыдущее и время подготовки истекло
			if(sootingData.shootingTime == sootingData.setTime) sootingData.qBeep = 1; //если время стельбы ещё равно максимальному, т.е. это первая секнда стрельбы - устанавливаем количество гудков =1 - начать стрельбу
			sootingData.shootingTime--;													//уменьшаем время стрельбы на 1
			if(sootingData.shootingTime > 30)	sootingData.color = 'green';			//если до кнца стрельбы больше 30 секунд - держим зелёный свет - стрельба разрешена
			else								sootingData.color = 'yellow';			//если до кнца стрельбы меньше или = 30 секунд - держим жёлтый свет - стрельба разрешена, но скоро закончится
		}
		else{				//если режим - работа и время стрельбы истекло
			sootingData.color = 'red';							//светофор - красный (стрельба запрещена)
			sootingData.curIndex++;								//увеличиваем индекс, что бы начали готовится следующий подход лучников
			//console.log('befor---------------------');//---------------------------------------------checkOut-----------------------------------------------
			//console.log(JSON.stringify(sootingData));//---------------------------------------------checkOut-----------------------------------------------
			sootingData.shootingTime = sootingData.setTime;		//возвращаем время стрельбы в масимальное значение
			sootingData.prevTime = 10;							//возвращаем время подготовки на 10 сек
			if(sootingData.curIndex > sootingData.setIndex){	//если индекс больше макимально допустимого
				sootingData.control = 0;							//переводим режим на "ожидание"
				sootingData.curIndex = 0;							//возвращаем индекс в 0
				sootingData.qBeep = 3;								//даём 3 гудка - (стрельба запрещена)
				sootingData.curSerie++;								//увеличиваем номер серии
			}else{												//если индекс допустимый - значит будет стрелять ещё один подход в этой же серии
				sootingData.qBeep = 2;								//даём 2 гудка - команда "выйти на рубеж и готовиться"
			}	
			sootingData.showIndex = getIndex(sootingData.curIndex);//передаём в систему отображения индексы, которые надо показать стрелкам
		}
	}else if(control == 2){									//если режим - пауза
		if(sootingData.controlPrev == 1 && sootingData.prevTime == 0){ //если попали в паузу из режима "работа" и время подготовки истекло - значит была разрешена стрельба.
			sootingData.color = 'red';										//поэтому переводим светофор в красный
			sootingData.qBeep = 3;											//И даём 3 гудка - запрет стрельбы
		}
	}else if(control == 3){									//если режим - переход к следующему индексу
		sootingData.color = 'red';									//светофор - красный
		if(sootingData.controlPrev != 3){							//если это первый цикл режима "переход" 
			sootingData.curIndex++;										//увеличиваем индекс
			if(sootingData.curIndex > sootingData.setIndex){			//если индекс больше макимально допустимого
				if(sootingData.prevTime == 0) sootingData.qBeep = 3;		//даём 3 гудка - (стрельба запрещена)
				sootingData.control = 0;									//переводим режим на "ожидание"
				sootingData.curIndex = 0;									//возвращаем индекс в 0
				sootingData.curSerie++;										//увеличиваем номер серии
			}
			sootingData.prevTime = 10;									//устанавливаем начальные установки стрельбы
			sootingData.showIndex = getIndex(sootingData.curIndex);			//передаём в систему отображения индексы, которые надо показать стрелкам
		}else sootingData.control = 1;								//если это не первый цикл режима "переход" и не произошло перехода в режим "ожидание" - автоматически переходим в режим "работа"
	}else{													//если режим - "ожидание"
		sootingData.shootingTime = sootingData.setTime;			//принимаем настройки от интерфейса управления
		sootingData.prevTime = 10;
		switch(sootingData.setSeriesType){
			case 0: sootingData.showType = ' разм.'; break;
			case 1: sootingData.showType = ' зачёт.'; break;
		}
	}
	sootingData.controlPrev = control;												//запоминаем режим для следующего цикла
	if(sootingData.prevTime == 0) 	sootingData.curTime = sootingData.shootingTime;	//выбираем, какое время показывать стрелкам - стрельбы
	else 							sootingData.curTime = sootingData.prevTime;		//или подготовки

	//console.log('time='+sootingData.curTime);
}