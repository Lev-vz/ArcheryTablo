function getUserId(cook){
	let userId = 'userArcherTournamentId='
	let start = cook.indexOf(userId);
	if(start<0) return '';
	start += userId.length;
	let end = cook.indexOf(';',start);
	if(end > 0) return cook.substring(start, end)
	else  		return cook.substring(start)
}
