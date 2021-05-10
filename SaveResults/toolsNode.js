const fs = require("fs");

module.exports.saveInFile = function(fileName, obj){
	try{															//записываем новые данные в файл на случай краха
		fs.writeFileSync(fileName, JSON.stringify(obj), 'utf8');
	}catch(err){
		console.log('Ошибка записи в файл ' + fileName,err);
	}
}

module.exports.uploadFromFile = function(fileName){
	try{															//записываем новые данные в файл на случай краха
		let obj = JSON.parse(fs.readFileSync(fileName, 'utf8'));
		return obj;
	}catch(err){
		return null;
	}
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
	else if(!(arg.includes('.html') || arg.includes('.htm') || arg.includes('.js') ||
				arg.includes('.ico') || arg.includes('.jpg') || arg.includes('.png'))) return arg + ".html";
	
	return arg;
}
