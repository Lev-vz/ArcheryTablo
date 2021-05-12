function getUserId(cook){
	let userId = 'userArcherTournamentId='
	let start = cook.indexOf(userId);
	if(start<0) return '';
	start += userId.length;
	let end = cook.indexOf(';',start);
	if(end > 0) return cook.substring(start, end)
	else  		return cook.substring(start)
}

function rgb2hex(r, g, b){
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function compareTxt(a, b) {
  if (a.txt < b.txt) return -1;
  if (a.txt > b.txt) return 1;
  if (a.txt == b.txt) return 0;
}

function compareNum(a, b) {
  if (a.num < b.num) return -1;
  if (a.num > b.num) return 1;
  if (a.num == b.num) return 0;
}
function compareNum90(a, b) {
  if (a.num > b.num) return -1;
  if (a.num < b.num) return 1;
  if (a.num == b.num) return 0;
}
