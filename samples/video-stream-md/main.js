window.onload = _ => {
    const constrains = {
        audio: true,
        video: true
    }
    navigator.mediaDevices.getUserMedia(constrains)
        .then(startVideoStream)
        .catch(handleError);
};

function startVideoStream(stream) {
    const videoElement = document.querySelector("video");
    videoElement.srcObject = stream;
}

function handleError(error) {
    console.error("on error: ", error);
}