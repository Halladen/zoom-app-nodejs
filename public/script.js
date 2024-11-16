const roomId = document.getElementById("roomId");
const videoGrid = document.getElementById("video-grid");
const hangupBtn = document.getElementById("hangup-btn");
const callBtn = document.getElementById("call-btn");
const peer = new Peer(undefined, {
  host: "localhost",
  port: 4000,
  path: "/peer",
});

const constraints = { video: true, audio: true };
// get user media
function getUserMedia(permissions) {
  return navigator.mediaDevices.getUserMedia(permissions);
}

const peers = {}; // track streams

// on call event
peer.on("call", (call) => {
  const answerCall = confirm("Do you Answer the Call?");
  if (answerCall) {
    getUserMedia(constraints)
      .then((stream) => {
        console.log(stream);
        const localVideo = document.createElement("video");
        // handle hangup button
        hangupBtn.addEventListener("click", () => {
          call.close();
          // close local video and audio
          stream.getTracks().forEach((track) => track.stop());
          localVideo.remove();
          return;
        });

        if (!peers[stream.id]) {
          // display hangup and disable call buttons
          hangupBtn.hidden = false;
          callBtn.disabled = true;
          peers[stream.id] = stream;

          localVideo.classList.add("video-1");
          localVideo.muted = true;
          addVideoStream(localVideo, stream);
          call.answer(stream);
        }

        const remoteVideo = document.createElement("video");
        remoteVideo.classList.add("video-2");
        call.on("stream", (remoteStream) => {
          if (!peers[remoteStream.id]) {
            peers[remoteStream.id] = remoteStream;
            addVideoStream(remoteVideo, remoteStream);
          }
        });

        call.on("close", () => {
          // remove remote and local video element
          remoteVideo.remove();
          localVideo.remove();

          // abele button
          callBtn.disabled = false;

          // hide hangup button
          hangupBtn.hidden = true;
          // close local video and audio
          stream.getTracks().forEach((track) => track.stop());
          return;
        });
      })
      .catch((error) => consolelog("Error getting user media: ", error));
  }
});

document.getElementById("call-btn").addEventListener("click", () => {
  let userId = window.prompt("Enter User ID: ");
  if (userId) {
    let conn = peer.connect(userId);
    getUserMedia(constraints)
      .then((stream) => {
        let call = peer.call(userId, stream);
        const localVideo = document.createElement("video");

        // listnen to hangup button
        hangupBtn.addEventListener("click", () => {
          call.close();
          // close local video and audio
          stream.getTracks().forEach((track) => track.stop());
          localVideo.remove();
          return;
        });
        if (!peers[stream.id]) {
          // display hangup and disable call buttons
          hangupBtn.hidden = false;
          callBtn.disabled = true;
          peers[stream.id] = stream;

          localVideo.classList.add("video-1");
          localVideo.muted = true;
          addVideoStream(localVideo, stream);
        }

        const remoteVideo = document.createElement("video");
        remoteVideo.classList.add("video-2");
        call.on("stream", (remoteStream) => {
          if (!peers[remoteStream.id]) {
            peers[remoteStream.id] = remoteStream;

            addVideoStream(remoteVideo, remoteStream);
          }
        });

        call.on("close", () => {
          // remove remote and local video element
          remoteVideo.remove();
          localVideo.remove();

          // abele button
          callBtn.disabled = false;

          // hide hangup button
          hangupBtn.hidden = true;

          // close local video and audio
          stream.getTracks().forEach((track) => track.stop());
          return;
        });
      })
      .catch((error) => consolelog("Error getting user media: ", error));
  }
});

peer.on("open", (id) => {
  roomId.textContent = id;
});

peer.on("connection", (conn) => {
  console.log("A user connected to your room: ", conn.peer);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.appendChild(video);
}
