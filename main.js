
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const sendButton = document.getElementById('send-button');

let localStream;
let remoteStream;
let peerConnection;
let signalingChannel;

async function startVideoCall() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    createPeerConnection();
    signalingChannel = new SignalingChannel();
  } catch (error) {
    console.error('Error starting video call:', error);
  }
}
function createPeerConnection() {
  peerConnection = new RTCPeerConnection();

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });


  peerConnection.ontrack = (event) => {
    remoteStream = event.streams[0];
    remoteVideo.srcObject = remoteStream;
  };

  signalingChannel.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'offer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      signalingChannel.send(JSON.stringify(answer));
    } else if (message.type === 'answer') {
      
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate') {
      
      const candidate = new RTCIceCandidate(message);
      await peerConnection.addIceCandidate(candidate);
    }
  };
}


function sendMessage() {
  const message = messageInput.value;
  
  signalingChannel.send(JSON.stringify({ type: 'chat', message }));
  displayMessage('You', message);
  messageInput.value = '';
}


function displayMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  messagesContainer.appendChild(messageElement);
}

sendButton.addEventListener('click', sendMessage);

startVideoCall();