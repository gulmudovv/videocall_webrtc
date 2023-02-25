const loginElement = document.getElementById('login');
const inviteElement = document.getElementById('invite');
const callingElement = document.getElementById('calling');
const calledElement = document.getElementById('called');
const phoneElement = document.getElementById('phone');
const genderFormElement = document.getElementById('genderForm');
const genderElement = document.getElementById('gender');
const btnLoginElement = document.getElementById('btnLogin');
const oUserName1 = document.getElementById('username1');
const oUserName2 = document.getElementById('username2');
const oUserName3 = document.getElementById('username3');
const oUserName4 = document.getElementById('username4');
const oToUser1 = document.getElementById('touser1');
const oToUser2 = document.getElementById('touser2');
const oToUser3 = document.getElementById('touser3');
const lstUsers = document.getElementById('lstUsers');
const btnInvite = document.getElementById('btnInvite');
const btnLogout = document.getElementById('btnLogout');
const btnCancel1 = document.getElementById('btnCancel1');
const btnAgree = document.getElementById('btnAgree');
const btnDecline = document.getElementById('btnDecline');
const videoRemote = document.getElementById('video_remote');
const videoLocal = document.getElementById('video_local');
const btnCancel2 = document.getElementById('btnCancel2');
const oMessages = document.getElementById('messages');
const frmChat = document.getElementById('frmChat');
const txtMessage = document.getElementById('txtMessage');
const txtFile = document.getElementById('txtFile');
const btnSend = document.getElementById('btnSend');

const serverURL = 'ws://' + location.hostname + ':8080';
const dataChannelName = 'chat', dataChannelID = 1000;

let webSocket, guestName, toUser, webRTC, localStream, remoteStream, dataChannel, userGender;

genderElement.addEventListener('change', (event) => {
    if(event.target.value!==""){
        btnLogin.disabled = false;
        userGender = event.target.value;
    }
    
});

genderFormElement.addEventListener('submit', (evt) => {
    evt.preventDefault();
    webSocket = new WebSocket(serverURL);
    webSocket.addEventListener('open', tryLogin);
    webSocket.addEventListener('message', tryLoginAnswer);
});

function tryLogin() {
    guestName="guest_" + Math.random().toString(16).slice(2);
    const messageToSend = { type: 'login', userName: guestName, userGender: userGender};
    webSocket.send(JSON.stringify(messageToSend));
}

function tryLoginAnswer(evt) {
    const messageFromWebServer = JSON.parse(evt.data);   
        loginElement.style.display = 'none';
        inviteElement.style.display = 'block';       
        oUserName1.textContent = guestName;
        oUserName2.textContent = guestName;
        oUserName3.textContent = guestName;
        oUserName4.textContent = guestName;
        frmInvite.reset();
        btnInvite.disabled = true;
        lstUsers.innerHTML = '';
        for (let userName of messageFromWebServer.users)
            addUser(userName);            
        webSocket.removeEventListener('open', tryLogin);
        webSocket.removeEventListener('message', tryLoginAnswer);
        webSocket.addEventListener('message', getMessage);
        console.log("Users:" + messageFromWebServer.count);
    
}

lstUsers.addEventListener('change', () => {
    if (lstUsers.selectedIndex > -1)
        btnInvite.disabled = false;
});

frmInvite.addEventListener('submit', (evt) => {
    evt.preventDefault();
    let oM = { type: 'busy', userName: guestName };
    webSocket.send(JSON.stringify(oM));
    toUser = lstUsers.options[lstUsers.selectedIndex].value;
    oM = { type: 'invite', userName: guestName, toUser: toUser };
    webSocket.send(JSON.stringify(oM));
    inviteElement.style.display = 'none';
    callingElement.style.display = 'block';
    oToUser1.textContent = toUser;
});

btnLogout.addEventListener('click', () => {
    webSocket.close(1000);
    webSocket = undefined;
    loginElement.style.display = 'block';
    inviteElement.style.display = 'none';
    genderFormElement.reset();
    btnLoginElement.disabled = true;
});

btnCancel1.addEventListener('click', () => {
    let messageToSend = { type: 'cancel', userName: guestName, toUser: toUser };
    webSocket.send(JSON.stringify(messageToSend));
    messageToSend = { type: 'free', userName: guestName };
    webSocket.send(JSON.stringify(messageToSend));
    callingElement.style.display = 'none';
    inviteElement.style.display = 'block';
    frmInvite.reset();
    btnInvite.disabled = true;
});

btnAgree.addEventListener('click', async function () {
    let messageToSend = { type: 'agree', userName: guestName, toUser: toUser };
    webSocket.send(JSON.stringify(messageToSend));
    calledElement.style.display = 'none';
    phoneElement.style.display = 'block';
    oToUser3.textContent = toUser;
    createRTC();
    await getMediaTracks();
    const offer = await webRTC.createOffer();
    await webRTC.setLocalDescription(offer);
    messageToSend = { type: 'offer', userName: guestName, toUser: toUser,
                          data: webRTC.localDescription };
    webSocket.send(JSON.stringify(messageToSend));
});

btnDecline.addEventListener('click', () => {
    let messageToSend = { type: 'decline', userName: guestName, toUser: toUser };
    webSocket.send(JSON.stringify(messageToSend));
    messageToSend = { type: 'free', userName: guestName };
    webSocket.send(JSON.stringify(messageToSend));
    calledElement.style.display = 'none';
    inviteElement.style.display = 'block';
    frmInvite.reset();
    btnInvite.disabled = true;
});

btnCancel2.addEventListener('click', () => {
    const messageToSend = { type: 'close', userName:guestName, toUser: toUser };
    webSocket.send(JSON.stringify(messageToSend));
    stopCall();
});

//метод обработки сигнала с сервера вебсокета  
function getMessage(evt) {
    const messageFromServer = JSON.parse(evt.data);
    switch (messageFromServer.type) {
        case 'userLoggedIn':
        case 'free':
            addUser(messageFromServer.userName);
            break;
        case 'userLoggedOut':
        case 'busy':
            removeUser(messageFromServer.userName);
            break;
        case 'invite':
            inviteUser(messageFromServer.userName);
            break;        
        case 'cancel':
        case 'decline':
            callIsCancelled();
            break;
        case 'agree':
            callIsAgreed();
            break;
        case 'offer':
            getOffer(messageFromServer.data);
            break;
        case 'answer':
            getAnswer(messageFromServer.data);
            break;
        case 'candidate':
            getCandidate(messageFromServer.data);
            break;
        case 'close':
            stopCall();
    }
}

function addUser(userName) {
    const oOpt = document.createElement('option');
    oOpt.value = userName;
    oOpt.textContent = userName;
    lstUsers.add(oOpt);
    if (lstUsers.length > 0)
        lstUsers.disabled = false;
}

function removeUser(userName) {
    const oOpt = lstUsers.querySelector('option[value=' +
                                        userName + ']');
       console.log(oOpt);                                 
    lstUsers.removeChild(oOpt);
    if (lstUsers.length == 0) {
        lstUsers.disabled = true;
        btnInvite.disabled = true;
    }
}

function inviteUser(inviter) {
    const messageToSend = { type: 'busy', userName: guestName };
    webSocket.send(JSON.stringify(messageToSend));
    inviteElement.style.display = 'none';
    calledElement.style.display = 'block';
    toUser = inviter;
    oToUser2.textContent = toUser;
}

function callIsCancelled() {
    const messageToSend = { type: 'free', userName: guestName };
    webSocket.send(JSON.stringify(messageToSend));
    calledElement.style.display = 'none';
    inviteElement.style.display = 'block';
    frmInvite.reset();
    btnInvite.disabled = true;
}

function callIsAgreed() {
    callingElement.style.display = 'none';
    phoneElement.style.display = 'block';
    oToUser3.textContent = toUser;
}

//создание объекта webrtc  
function createRTC() {
    webRTC = new RTCPeerConnection({'iceServers': IceServers} );
    webRTC.addEventListener('icecandidate', sendCandidate);
    webRTC.addEventListener('track', joinToBroadcasting);   
    dataChannel = webRTC.createDataChannel(dataChannelName,
                         { negotiated: true, id: dataChannelID });
    dataChannel.addEventListener('message', getRTCMessage);
}

// получения пользовательских локальных медиафайлов камер и микрофона 
async function getMediaTracks() {
       
    localStream = await navigator
                        .mediaDevices
                        .getUserMedia({ video: true, audio: true });
    for (let oTr of localStream.getTracks())
        webRTC.addTrack(oTr, localStream);
    videoLocal.srcObject = localStream;
}


async function getOffer(data) {
    createRTC();    
    await webRTC.setRemoteDescription(data);
    await getMediaTracks();
    const answer = await webRTC.createAnswer();
    await webRTC.setLocalDescription(answer);
    const sendObj = { type: 'answer', userName: guestName, toUser: toUser,
                                 data: webRTC.localDescription };
    webSocket.send(JSON.stringify(sendObj));
}

async function getAnswer(data) {
    await webRTC.setRemoteDescription(data);
}

function sendCandidate(evt) {
    if (evt.candidate) {
        const messageToSend = { type: 'candidate', userName: guestName,
                     toUser: toUser,  data: evt.candidate };
        webSocket.send(JSON.stringify(messageToSend));
    }
}
//метод получения icecandidate
async function getCandidate(data) {
    await webRTC.addIceCandidate(data);
}

function joinToBroadcasting(evt) {
    remoteStream = evt.streams[0];
    videoRemote.srcObject = remoteStream;
}

function stopCall() {
    dataChannel.close();
    dataChannel = undefined;
    for (let oTr of remoteStream.getTracks())
        oTr.stop();
    for (let oTr of localStream.getTracks())
        oTr.stop();
    videoRemote.srcObject = undefined;
    videoLocal.srcObject = undefined;
    remoteStream = undefined;
    localStream = undefined;
    webRTC.removeEventListener('icecandidate', sendCandidate);
    webRTC.removeEventListener('track', joinToBroadcasting);
    webRTC.close();
    webRTC = undefined;
    const oM = { type: 'free', userName: guestName };
    webSocket.send(JSON.stringify(oM));
    phoneElement.style.display = 'none';
    inviteElement.style.display = 'block';
    frmInvite.reset();
    btnInvite.disabled = true;
}

function getRTCMessage(evt) {
    showMessage(JSON.parse(evt.data));
}

function showMessage(message, myMessage=false) {
    const oDiv = document.createElement('div');
    if (myMessage)
        oDiv.classList.add('my');
    let oP, oTxt, oA;
    if (!myMessage) {
        oP = document.createElement('p');
        oP.classList.add('author');
        oP.textContent = message.userName + ':';
        oDiv.appendChild(oP);
    }
    oP = document.createElement('p');
    if (message.content) {
        oP.textContent = message.content;
        oDiv.appendChild(oP);
    }
    if (message.file && message.fileName) {
        oP = document.createElement('p');
        oTxt = document.createTextNode('Файл: ' +
                                       message.fileName + ' ');
        oP.appendChild(oTxt);
        if (!myMessage) {
            oA = document.createElement('a');
            oA.href = message.file;
            oA.download = message.fileName;
            oA.textContent = '(сохранить)';
            oP.appendChild(oA);
        }
        oDiv.appendChild(oP);
    }
    oP = document.createElement('p');
    oP.classList.add('datetime');
    oP.textContent = message.sent;
    oDiv.appendChild(oP);
    oMessages.appendChild(oDiv);
    oMessages.scrollTop = oMessages.scrollHeight;
}

function enableSendButton() {
    btnSend.disabled = !txtMessage.value &&
                       (txtFile.files.length == 0);
}

txtMessage.addEventListener('input', enableSendButton);
txtFile.addEventListener('change', enableSendButton);

function getSelectedFile() {
    return new Promise((resolve, reject) => {
        const oFR = new FileReader();
        oFR.addEventListener('load', (evt) => {
            resolve(evt.target.result);
        });
        oFR.readAsDataURL(txtFile.files[0]);
    });
}

frmChat.addEventListener('submit', async function (evt) {
    evt.preventDefault();
    const oM = { type: 'message', userName: guestName };
    if (txtMessage.value)
        oM.content = txtMessage.value;
    if (txtFile.files.length > 0) {
        oM.fileName = txtFile.files[0].name;
        oM.file = await getSelectedFile();
    }
    oM.sent = (new Date()).toLocaleString();
    dataChannel.send(JSON.stringify(oM));
    showMessage(oM, true);
    frmChat.reset();
    btnSend.disabled = true;
    txtMessage.focus();
},false);
