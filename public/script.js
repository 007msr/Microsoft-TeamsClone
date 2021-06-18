
   
const socket = io('/')
const videoGrid = document.getElementById('video-grid')

//adding name in chatbox//
const username = prompt("Please enter your name", "<name goes here>");
//console.log(username)
$('ul').append("you joined<br>");
socket.emit('new-user', username);
//here it ends//


const peer = new Peer(undefined)
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = false;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)


  peer.on('call', call => {
    console.log('answering call');
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
  peer.on('close',(roomID, userID) => {
    socket.emit('disconnect', roomID, userID);
  })


  socket.on('user-connected', (userId) => {
    console.log("user-connected")
    connectToNewUser(userId, stream)
  }) 


  socket.on('user-joined', (username) => {
   // console.log("user-name: " + username);
    $('ul').append(`<b>${username}</b> joined the chat`);
  }) 

 


})


peer.on('open', id => {
  console.log(id);
  socket.emit('join-room', ROOM_ID, id)
})

socket.on('chat-message',data =>{
  console.log(data.name);
  $('ul').append(`<li class="message"><b>${data.name}</b>:${data.message}</li>`);
})



const leaveMeeting = () => {
socket.on('user-disconnected', userID => {
  console.log("leave-meeting");
  
  call.on('close', () => {
    video.remove()
  })
})
}
     

const connectToNewUser= (userID,stream) => {
    console.log('new user connected');
    console.log(userID);
    const call=peer.call(userID,stream)
    const video=document.createElement('video')
    call.on('stream',userVideoStream =>{
       
        addVideoStream(video,userVideoStream)
    })

    call.on('close', () => {
      video.remove()
    })
  
    peers[userID] = call
}




const addVideoStream = (video, stream) =>{
    console.log('hey bro');
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  }
 
  const sendMessage=(e) =>{
   
    let text=$('input'); 
   if( text.val().length!=0){
    console.log(text.val());
    $('ul').append(`<li class="message"><b>Me:</b> ${text.val()}</li>`);
    socket.emit('message',text.val());
   
    text.val('');
  }
  }


  let text=$('input'); 
  $('html').keydown((e) =>{
    if(e.which==13 && text.val().length!=0){
      console.log(text.val());
      $('ul').append(`<li class="message"><b>Me:<t></b> ${text.val()}</li>`);
      socket.emit('message',text.val());
     
      text.val('');
    }

  })
  




const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

//Mute umNoute our audio

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}  

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}


