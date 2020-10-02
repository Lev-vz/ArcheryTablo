// подключение express
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
  // создаем парсер для данных application/x-www-form-urlencoded
const urlencodedParser = bodyParser.urlencoded({extended: false});// определяем обработчик для маршрута "/"

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
/*
app.use(express.static(__dirname + "/archTablo"));

app.get("/exit", function(request, response){
    process.exit(1);
});


//app.use(express.static(__dirname));

app.use(function(request, response){//, next){
	let arg = request.url;
	console.log('request.url='+arg);
    if(request.url!='/setDate')response.sendFile(__dirname + "/archTablo"+request.url);//+".html");
    //next();
});

app.get("/getAllDate", urlencodedParser, function (request, response) {
	response.send('<div id=\"curTime\">'+globDate.curTime+'</div>' );
    //response.sendFile(__dirname + "/getAllDate.html");
});

app.get("/setDate", urlencodedParser, function (request, response) {
	//console.log('setDate.url='+request.url); 		//--------------------------- CheckOut ------------------------------------
    response.sendFile(__dirname + "/setDate.html");
});

app.get("/getDate", urlencodedParser, function (request, response) {
	console.log('getDate.url='+request.url); 		//--------------------------- CheckOut ------------------------------------
    response.sendFile(__dirname + "/getDate.html");
});
*/
app.get("/*", urlencodedParser, function (request, response) {
	let arg = request.url;
	//console.log('request.url='+arg); 		//--------------------------- CheckOut ------------------------------------
	if(!(arg.includes('.html') || arg.includes('.htm') || arg.includes('.js'))) arg += ".html";
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
    console.log("getAllDate="+globDate.curTime); 		//--------------------------- CheckOut ------------------------------------
	response.send('<div id=\"curTime\" style=\"border:solid 2 black; background-color:#DDDD00\">'+globDate.curTime+'</div>' );
});

/*
app.post("/getAllDate", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    console.log('AllDate');
	response.send('<div id=\"curTime\">'+globDate.curTime+'</div>' );
});
*/
app.get("/", function(request, response){
    response.send("<h2>Привет Express!</h2>");
});

app.listen(3000);// начинаем прослушивать подключения на 3000 порту