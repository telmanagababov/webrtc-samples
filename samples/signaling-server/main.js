let socket = null;

window.onload = _ => {
  createSocket();
  joinRoom();
}

function createSocket() {
  socket = io.connect('127.0.0.1:8080');
  socket.on('created', room => {
    console.log('Room created: ' + room);
  });
  socket.on('full', room => {
    console.log('Message from client: Room ' + room + ' is full :^(');
  });
  socket.on('ipaddr', ipaddr => {
    console.log('Message from client: Server IP address is ' + ipaddr);
  });
  socket.on('joined', room => {
    console.log('Joined to room: ' + room);
  });
  socket.on('log', array => {
    console.log.apply(console, array);
  });
}

function joinRoom () {
  const room = prompt("Enter room name:");
  if (room !== "") {
    console.log('Message from client: Asking to join room ' + room);
    socket.emit('create or join', room);
  }
}