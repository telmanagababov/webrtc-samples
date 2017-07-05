let sendChannel = null;

window.onload = _=> {
  createConnection();
  document.querySelector('#send-control').onclick = sendData;
}

function createConnection() {
  localConnection = new RTCPeerConnection();
  localConnection.onicecandidate = event => addIceCandidate(remoteConnection, event);

  remoteConnection = new RTCPeerConnection();
  remoteConnection.onicecandidate = event => addIceCandidate(localConnection, event);
  remoteConnection.ondatachannel = event => {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = onReceivedData;
  };

  sendChannel = localConnection.createDataChannel('sendDataChannel');

  localConnection.createOffer().then(descriptor => {
      setDescriptors(localConnection, remoteConnection, descriptor);
      remoteConnection.createAnswer().then(descriptor => {
        setDescriptors(remoteConnection, localConnection, descriptor)
      });
  });
}

function addIceCandidate(remotePC, event) {
    if(event.candidate) {
        remotePC.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
}

function setDescriptors(localPC, remotePC, descriptor) {
    localPC.setLocalDescription(descriptor);
    remotePC.setRemoteDescription(descriptor);
}

function sendData() {
  const data = document.querySelector('#channel-send-area').value;
  sendChannel.send(data);
}

function onReceivedData(event) {
  const receiveArea = document.querySelector('#channel-receive-area');
  receiveArea.value = event.data
}
