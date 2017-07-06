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
  socket = io.connect();
  socket.on('created', room => {
    isCreator = true;
  });
  socket.on('join', room => {
    isChannelReady = true;
  });
  socket.on('joined', room => {
    isChannelReady = true;
  });
  socket.on('message', onMessage);
}

function connectToRoom(roomId) {
  socket.emit('create or join', roomId);
}

function sendMessage(message) {
  socket.emit('message', message);
}

function onMessage(message) {
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
  close();
};

function close() {
  console.log('Session terminated.');
  pc.close();
  pc = null;
  isStarted = false;
  isCreator = false;
}