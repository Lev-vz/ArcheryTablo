let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/i.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(7000, function(){
  console.log('listening on *:7000');
});