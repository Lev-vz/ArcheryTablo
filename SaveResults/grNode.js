module.exports.getShortTable = function(allRoundArchers, qArrows){
	let ret = {};
	for(let i = 0; i < allRoundArchers.length; i++){
		for(let key in allRoundArchers[i]){
			if(!(key in ret)){
				ret[key] = {}
				ret[key]["group"] = allRoundArchers[i][key]["group"];
				ret[key]["index"] = allRoundArchers[i][key]["index"];
				ret[key]["class"] = allRoundArchers[i][key]["class"];
				ret[key]["club"] = allRoundArchers[i][key]["club"];
				ret[key]["summs"] = [];
				ret[key]["fullSumm"] = 0;
			}
			ret[key]["summs"][i] = allRoundArchers[i][key]["summ"];
			ret[key]["fullSumm"] += allRoundArchers[i][key]["summ"];
			ret[key]["averageArrow"] = ret[key]["fullSumm"]/qArrows;
			
		}
	}
	return ret;
}
//:"4","index":"B","class":"тренировка","club":"Царское Село","summ":124,"arr":[