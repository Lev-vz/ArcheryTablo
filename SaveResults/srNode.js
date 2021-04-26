const cnst = require("./const");

module.exports.isAllReady = function(groupInfo, clientId, setReady){
	let ready = true;
	for(let k in groupInfo){
		//console.log('groupInfo['+k+']["ready"] = ' + groupInfo[k]["ready"]);//---------------------------------------------checkOut-----------------------------------------------
		if(setReady && groupInfo[k]["clientId"] == clientId) groupInfo[k]["ready"] = true;
		ready = ready && groupInfo[k]["ready"];
		//console.log('ready = ' + ready);//---------------------------------------------checkOut-----------------------------------------------
	}
	return ready;
}

module.exports.getGroupInfo = function(groupInfo, archers, clientId, targets, resp){ //
	let k = "";
	for(k in groupInfo){
		if(groupInfo[k]["clientId"] == clientId){
			resp['group'] = k;
			resp['target'] = groupInfo[k]["currTarget"];
			resp['targetType'] = targets[groupInfo[k]["currTarget"]-1];
			if(module.exports.isAllReady(groupInfo, clientId, false)) resp['ready'] = cnst.ALL_READY;
			else if(groupInfo[k]["ready"])           resp['ready'] = cnst.GROUP_READY;
			else                                     resp['ready'] = cnst.GROUP_NOT_READY;
			
			break;
		}
	}
	if(k=="") return 1;
	if(!module.exports.getArchersInfo(archers, k, groupInfo[k].currTarget, targets[groupInfo[k].currTarget-1], resp)) return 2;
	return 0;
}


module.exports.getArchersInfo = function(archers, group, target, targetType, resp){ //
	i = 1;
	for(let key in archers){
		if(archers[key]["group"] == group){
			resp['name'+i] = key;
			module.exports.getPointsInfo(archers, key, target-1, targetType, i, resp)
			i++;
		}
	}
}
//archers - таблица стрелков, name - имя стрелка, target - номер мишени, targetType - тип мишени,
//row - строка в таблице на странице управления группой, resp - ответ на запрос
module.exports.getPointsInfo = function(archers, name, target, targetType, row, resp){ //
	let qArrow = (targetType=='3D')? 2 : 3;
	let summ = 0;
	for(let j=0; j < qArrow; j++){
		let points = archers[name].arr[target][j];
		resp[row+""+(j+1)] = points;
		summ += points;
	}
	resp['summ'+row] = summ;
	
	summ = 0;
	let start = 0;
	let end = 12;
	if(target > 11){
		start = 12
		end = cnst.Q_TARGET
	}
	for(let k=start; k < end; k++){
		for(let j=0; j < qArrow; j++){
			summ += archers[name].arr[k][j];
		}
	}
	resp['integ'+row] = summ;
	//console.log('resp='+JSON.stringify(resp));//---------------------------------------------checkOut-----------------------------------------------
}

module.exports.checkPass = function(arg, userId, groups, fs, path){ //проверка допуска запрса
	if(arg.toLowerCase().indexOf('/groupcontrol') == 0){
		if(arg.length == 13 || arg.toLowerCase().substring(13) == '.html'){
			for(let key in groups){
				if(groups[key].clientId == userId) return '/groupControl.html';
			}
			return '/wrongPass.html';
		}else{
			let st = arg.indexOf('?');
			if(st < 0) return '/wrongPass.html';
			
			let end = arg.indexOf('?',st+1)
			if(end < 0) return '/wrongPass.html';
			
			let group = arg.substring(st + 1,end);
			let pass = arg.substring(end + 1);
			
			
			if(groups[group].pass == pass){
				groups[group].clientId = userId;
				module.exports.saveGroupInfo(groups, group, userId, fs, path);
				return '/groupControl.html';
			}
			
			return '/wrongPass.html';
		}
	}
	else if(!(arg.includes('.html') || arg.includes('.htm') || arg.includes('.js') || arg.includes('.ico'))) return arg + ".html";
	
	return arg;
}

module.exports.saveGroupInfo = function(groupInfo, key, userId, fs, path){ 
	if(key in groupInfo){
		for(let k in groupInfo){
			if(groupInfo[k]["clientId"] == userId) groupInfo[k]["clientId"] = "";
			//console.log('groupInfo[k]["clientId"] = ' + groupInfo[k]["clientId"]);//---------------------------------------------checkOut-----------------------------------------------
		}
		groupInfo[key]["clientId"] = userId;
		try{															//записываем новые данные в файл на случай краха
			fs.writeFileSync(path + 'groupInfo.txt', JSON.stringify(groupInfo), 'utf8');
		}catch(err){
			console.log('Ошибка записи в файл',err);
		}
	}
	
	let groupForBind = {}
	for(let key in groupInfo){
		groupForBind[key] = groupInfo[key]["clientId"];
	}
	
	try{															//записываем новые данные в файл на случай краха
		fs.writeFileSync('groupForBind.js', 'let groups = '+ JSON.stringify(groupForBind), 'utf8');
	}catch(err){
		console.log('Ошибка записи в файл',err);
	}
}
