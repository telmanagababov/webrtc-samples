const ROOM_NAME = "test-simple-web-rtc-room";

const webrtc = new SimpleWebRTC({
    localVideoEl: 'local-video',
    remoteVideosEl: 'remote-videos',
    autoRequestMedia: true
});

webrtc.on('readyToCall', function () {
  webrtc.joinRoom(ROOM_NAME);
});