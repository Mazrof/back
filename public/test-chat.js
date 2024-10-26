const socket = io('http://localhost:3000');
let localStream;
let peerConnection;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // TURN server can be added here if needed
    ],
};

// Start video call
async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to the peer connection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // When a remote stream is added
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = event.streams[0];
    };

    // Create an offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
    // When ICE candidate is generated
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };
}

// Handle incoming offer
socket.on('offer', async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

// Handle incoming answer
socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Handle ICE candidates
socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// ====================================
//         SECTION 2: Messaging
// ====================================


const sendNewMessage1 = () => {
    const message = {content:'hello',sender:'abdo',recieverId:1}
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    console.log(file);
    if(file)
        socket.emit('create-message', {...message,file,filename:file.name,filetype:file.type})
    else
        socket.emit('create-message', {...message})

}
const sendNewMessage2 = () => {
    const message = {content:'hello',sender:'abdo',recieverId:2}
    socket.emit('create-message', message);
}
socket.on('new-message', (message) => {
    console.log(message);
})

function displayFileURL(url) {
    document.getElementById('fileLink').href = url;
}
