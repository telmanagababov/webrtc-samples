const roomId = "TEST-ROOM";
let socket = null,
  pc = null,
  isCreator = false,
  isChannelReady = false,
  isStarted = false,
  localStream = null;

window.onload = _ => {
  initSocket();
  connectToRoom(roomId);
  addLocalStream();
}

function initSocket() {
  console.log('start')
  socket = io.connect('192.168.0.106:8080');
  socket.on('created', room => {
    console.log('created');
    isCreator = true;
  });
  socket.on('join', room => {
    console.log('join');
    isChannelReady = true;
  });
  socket.on('joined', room => {
    console.log('joined');
    isChannelReady = true;
  });
  socket.on('log', params => {
    console.log('log', params);
  });
  socket.on('message', onMessage);
}

function connectToRoom(roomId) {
  console.log('create', roomId);
  socket.emit('create or join', roomId);
}

function sendMessage(message) {
  socket.emit('message', message);
}

function onMessage(message) {
  console.log('onMessage', message);
  if (message === 'got user media') {
    checkForStart();
  } else if (message.type === 'offer') {
    if (!isCreator && !isStarted) {
      checkForStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    pc.createAnswer().then(setLocalAndSendMessage);
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    close();
  }
}

function addLocalStream() {
  const localVideo = document.querySelector('#local-video');
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  }).then(stream => {
    localVideo.src = window.URL.createObjectURL(stream);
    localStream = stream;
    sendMessage('got user media');
    if (isCreator) {
      checkForStart();
    }
  });
}

function checkForStart() {
  console.log('check for start: ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    if (isCreator) {
      pc.createOffer().then(setLocalAndSendMessage);
    }
  }
}

function createPeerConnection() {
  pc = new RTCPeerConnection(null);
  pc.onicecandidate = handleIceCandidate;
  pc.onaddstream = event => {
    const remoteVideo = document.querySelector('#remote-video');
    remoteVideo.srcObject = event.stream;
  };
}

function handleIceCandidate(event) {
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  }
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  sendMessage(sessionDescription);
}

window.onbeforeunload = function() {
  sendMessage('bye');
  // close();
};

function close() {
  console.log('Session terminated.');
  pc.close();
  pc = null;
  isStarted = false;
  isCreator = false;
}