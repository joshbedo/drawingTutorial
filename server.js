//Here is where we create the global parameters
//and start listening to 'port', we are creating an express
//server and then binding it to socket.io
var express = require('express'),
	app     = express(),
	server  = require('http').createServer(app),
	io      = require('socket.io').listen(server);
	serverClients = {};

server.listen(1337);

//configure express paths to load resources when making a GET request
app.use("/css", express.static(__dirname + '/public/styles'));
app.use("/js", express.static(__dirname + '/public/js'));

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/public/index.html');
});
//add setting to use websockets first but if a browser doesn't support websockets fallback to xhr-polling
//browsers that support websockets: http://caniuse.com/websockets
io.set('transports', [ 'websocket', 'xhr-polling' ]);

// socket.io events, each connection goes through here
// and each event is emited in the client.
// I created a function to handle each event
io.sockets.on('connection', function(socket){
	socket.on('connect', function(data){
		//call function for connect and send the socket and data
		connect(socket, data);
	});

	//event when a client disconnects from the app
	socket.on('disconnect', function(){
		disconnect(socket);
	});

	//when a client draws a line this event is going to be emitted and sent to all the other sockets (clients)
	socket.on('drawing', function(data){
		updateDrawing(socket, data.image);
	});
});

function connect(socket, data){
	//generate clientid
	data.clientId = generateId();

	//save the client to the hash object 
	//for quick access, we save this data on the socket
	//with 'socket.set(key, value)'
	//but the only way to pull it back out will be async
	serverClients[socket.id] = data;
}
function disconnect(socket){
	//delete the socket (client) from the hash object
	delete serverClients[socket.id];
}
function updateDrawing(socket, image){
	//socket.broadcast sends data to everyone besides the sender
	//we are going to send the Data-URL created from our client-side
	socket.broadcast.emit('drawing', {image: image});
}