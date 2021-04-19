const express = require("express");// подключение express
const bodyParser = require("body-parser");
const app = express();
  
const urlencodedParser = bodyParser.urlencoded({extended: false});// создаем парсер для данных application/x-www-form-urlencoded

let globDate = {};
globDate.control = 4;
globDate.controlPrev = 4;

const tabloNodeFunction = require("./archTablo/ArcherTabloNode");
tabloNodeFunction.init(globDate);
console.log('setTime='+globDate.setTime);

//setInterval(updateDate, 1000);
function updateDate(){
	globDate.control++;
	tabloNodeFunction.processing(globDate);
}

app.get("/*", urlencodedParser, function (request, response) {
	let arg = request.url;
	//console.log('request.url='+arg); 		//--------------------------- CheckOut ------------------------------------
	if(!(arg.includes('.html') || arg.includes('.htm') || arg.includes('.js') || arg.includes('.ico'))) arg += ".html";
	//console.log('url='+arg);			 	//--------------------------- CheckOut ------------------------------------
    response.sendFile(__dirname + arg);
});


app.post("/setDate", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    //console.log("setDate.post="+globDate[request.body.variable]);	 		//--------------------------- CheckOut ------------------------------------
	globDate[request.body.variable] = request.body.value;
	response.send(request.body.variable + " = " + globDate[request.body.variable]);
});

app.post("/getDate", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    //console.log("request.body.variable="+request.body.variable + ", getDate.post="+globDate[request.body.variable]); 		//--------------------------- CheckOut ------------------------------------
	response.send(""+globDate[request.body.variable]);
});

app.post("/getAllDate", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
	//let json = JSON.stringify(globDate);
	response.send(JSON.stringify(globDate));
});

app.listen(3000);// начинаем прослушивать подключения на 3000 порту