module.exports.init = function(sootingData){
	//console.log(sootingData)
}

module.exports.checkPass = function(arg, ip, groups, fs){ //проверка допуска запрса
		console.log('arg = ' + arg);//---------------------------------------------checkOut-----------------------------------------------
		console.log('ip = ' + ip);//---------------------------------------------checkOut-----------------------------------------------
		console.log('groups["1"].pass = ' + groups["1"].pass);//---------------------------------------------checkOut-----------------------------------------------

	if(arg.toLowerCase().indexOf('/groupcontrol') == 0){
		if(arg.length == 13 || arg.toLowerCase().substring(13) == '.html'){
			for(let key in groups){
				if(groups[key].clientId == ip) return '/groupControl.html';
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
				groups[group].clientId = ip;
				module.exports.saveGroupInfo(groups, group, ip, fs);
				return '/groupControl.html';
			}
			
			return '/wrongPass.html';
		}
	}
	else if(!(arg.includes('.html') || arg.includes('.htm') || arg.includes('.js') || arg.includes('.ico'))) return arg + ".html";
	
	return arg;
}

module.exports.saveGroupInfo = function(groupInfo, key, ip, fs){ //возвращает отображаемые индексы по номеру индекса
	if(key in groupInfo){
		for(let k in groupInfo){
			if(groupInfo[k]["clientId"] == ip) groupInfo[k]["clientId"] = "";
		}
		groupInfo[key]["clientId"] = ip;
		try{															//записываем новые данные в файл на случай краха
			fs.writeFileSync('groupInfo.txt', JSON.stringify(groupInfo), 'utf8');
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
