const constraints = {
    audio: false,
    video: {
        width: {exact: 320},
        height: {exact: 240}
    }
};
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}
const servers = null;

let localStream = null,
    pc1 = null,
    pc2 = null;

window.onload = _ => {
    const startControl = document.querySelector("#start-control"),
        callControl = document.querySelector("#call-control"),
        stopControl = document.querySelector("#stop-control");
    startControl.onclick = startLocalStream;
    callControl.onclick = callToRemoteStream;
    stopControl.onclick = stopStreaming;
}

function startLocalStream() {
    navigator.mediaDevices.getUserMedia(
        constraints
    ).then(stream => {
        const localVideo = document.querySelector("#local-video");
        localVideo.srcObject = stream;
        localStream = stream;
    });
}

function callToRemoteStream() {
    pc2 = new RTCPeerConnection(servers);
    pc2.onicecandidate = event => addIceCandidate(pc1, event);
    pc2.onaddstream = event => {
        const remoteVideo = document.querySelector("#remote-video");
        remoteVideo.srcObject = event.stream;
    };

    pc1 = new RTCPeerConnection(servers);    
    pc1.onicecandidate = event => addIceCandidate(pc2, event);
    pc1.addStream(localStream);
    pc1.createOffer(
        offerOptions
    ).then(descriptor => {
        setDescriptors(pc1, pc2, descriptor);
        pc2.createAnswer().then(descriptor => setDescriptors(pc2, pc1, descriptor));
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

function stopStreaming() {
    pc1.close();
    pc2.close();
}