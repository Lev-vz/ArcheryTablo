module.exports.init = function(suttingData){
	suttingData.setTime = 120;
	suttingData.setIndex = 1;
	suttingData.curIndex = 1;
	suttingData.serie = 1;
	//suttingData.type = 1;
	suttingData.curTime = 120;
	suttingData.prevTime = 10;
	suttingData.qBeep = 0;
	suttingData.control = 0;
	
	console.log('control='+suttingData.control);
	
}
//suttingData.control == 1 - пуск, 2 - стоп, 3 - сброс, 4 - настройка, 0 - ожидание
module.exports.processing = function(suttingData){
	let control = suttingData.control;
	if(control == 1){
		if(suttingData.controlPrev == 3 || suttingData.controlPrev == 4 || suttingData.controlPrev == 5){
			suttingData.curTime = suttingData.setTime;
			suttingData.prevTime = 10;
			suttingData.qBeep = 2;
		}
		else if(suttingData.controlPrev == 2 && suttingData.prevTime == 0) suttingData.qBeep = 1;
		else if(suttingData.prevTime > 0) suttingData.prevTime--;
		else if(suttingData.curTime  > 0){
			if(suttingData.curTime == suttingData.setTime) suttingData.qBeep = 1;
			suttingData.curTime--;
		}
		else{
			suttingData.curIndex++;
			suttingData.curTime = suttingData.setTime;
			suttingData.prevTime = 10;
			if(suttingData.curIndex > suttingData.setIndex){
				suttingData.control = 0;
				suttingData.qBeep = 3;
				suttingData.serie++;
			}else{
				suttingData.qBeep = 2;
			}	
		}
	}else if(control == 2 && suttingData.controlPrev == 1 && suttingData.prevTime == 0){
		suttingData.qBeep = 3;
	}else if(control == 3){
		if(suttingData.controlPrev != 3){
			suttingData.curIndex++;
			if(suttingData.curIndex > suttingData.setIndex){
				if(suttingData.prevTime == 0) suttingData.qBeep = 3;
				control = 0;
				suttingData.serie++;
			}
		}else suttingData.control = 1;
	}else if(control == 4){
		if(suttingData.controlPrev != 4 && suttingData.prevTime == 0) suttingData.qBeep = 3;
		suttingData.serie=1;
	}else{
			suttingData.curTime = suttingData.setTime;
			suttingData.prevTime = 10;
	}
	suttingData.controlPrev = control;
	console.log('time='+suttingData.curTime);
}