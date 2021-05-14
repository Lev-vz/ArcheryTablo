module.exports.getShortTable = function(allRoundArchers, qArrows){
	let ret = {};
	//console.log(JSON.stringify(allRoundArchers));////---------------------------------------------checkOut-----------------------------------------------
	//console.log('qArrows=' + qArrows);////---------------------------------------------checkOut-----------------------------------------------
	let qRound = allRoundArchers.length
	for(let i = 0; i < qRound; i++){
		for(let key in allRoundArchers[i]){
			if(!(key in ret)){
				ret[key] = {}
				ret[key]["group"] = allRoundArchers[i][key]["group"];
				ret[key]["index"] = allRoundArchers[i][key]["index"];
				ret[key]["class"] = allRoundArchers[i][key]["class"];
				ret[key]["club"] = allRoundArchers[i][key]["club"];
				ret[key]["summs"] = [];
				for(let k = 0; k < qRound; k++){
					ret[key]["summs"][k] = 0;
				}
				ret[key]["fullSumm"] = 0;
			}
			ret[key]["summs"][i] = allRoundArchers[i][key]["summ"];
			ret[key]["fullSumm"] += allRoundArchers[i][key]["summ"];
			ret[key]["averageArrow"] = Math.round((ret[key]["fullSumm"]/qArrows)*100)/100;
			
		}
	}
	for(let i = 0; i < qRound; i++){
		let x = 0;
		for(let key in allRoundArchers[i]){
			if((x++)> 4) break;
			//console.log('summ['+key+']['+i+']='+ret[key]["summs"][i]);//JSON.stringify());//---------------------------------------------checkOut-----------------------------------------------			
		}
	}

	return ret;
}
//:"4","index":"B","class":"тренировка","club":"Царское Село","summ":124,"arr":[