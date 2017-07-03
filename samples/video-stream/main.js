window.onload = _ => {
    const constrains = {
        audio: true,
        video: true
    }
    navigator.getUserMedia(constrains, startVideoStream, handleError);
};

function startVideoStream(stream) {
    const videoElement = document.querySelector("video");
    videoElement.srcObject = stream;
}

function handleError(error) {
    console.error("on error: ", error);
}