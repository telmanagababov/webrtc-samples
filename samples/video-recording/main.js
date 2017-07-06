let stream = null,
    mediaRecorder = null,
    recordedBlobs = null;

window.onload = _=> {
    loadLocalStream();
    document.querySelector('#start-record-control').onclick = startRecording;
    document.querySelector('#stop-record-control').onclick = stopRecording;
    document.querySelector('#play-control').onclick = play;
    document.querySelector('#download-control').onclick = download;
};

function loadLocalStream() {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    }).then(streamData => {
        stream = streamData;
        document.querySelector('#source-video').srcObject = streamData;
    });
}

function startRecording() {
  recordedBlobs = [];
  mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm;codecs=vp9'});
  mediaRecorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
  };
  mediaRecorder.start(10); // collect 10ms of data
}

function stopRecording() {
  isRecording = false;
  mediaRecorder.stop();
}

function play() {
  var sourceBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  document.querySelector('#record-video').src = window.URL.createObjectURL(sourceBuffer);
}

function download() {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'}),
    url = window.URL.createObjectURL(blob),
    a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(_ => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}