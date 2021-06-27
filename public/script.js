
   
const socket = io('/')
const videoGrid = document.getElementById('video-grid')

//adding name in chatbox//
const username = prompt("Please enter your name", "<name goes here>");

//console.log(username)
$('.messages').append(`<div class="messages_center">you joined<br></div>`);
socket.emit('new-user', username);
//here it ends//


const peer = new Peer(undefined)
let myVideoStream;
const myVideo = document.createElement('video')
//const name= document.createElement('name');


myVideo.muted = false;
const peers = {}

//const constraintsVideo = {
//  audio:false,
//  video:true,
//}
//const constraintsAudio = {
////  audio:true,
//}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: 
 {
    echoCancellation: true,
    noiseSuppression:true,
  }
  //constraintsVideo,
  //constraintsAudio
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
    console.log("user-name: " + username);
    $('.messages').append(`<div class="messages_center"><b>${username}</b> joined the chat<br></div>`);
  }) 

  peer.on('open', id => {
    console.log(id);
    socket.emit('join-room', ROOM_ID, id)
  })
  
  socket.on('chat-message',data =>{
    console.log(data.name);
    $('.messages').append(`<div class="messages_left"><b>${data.name}</b>:${data.message}</div>`);
  })
  


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
    console.log('my video appended');
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
 
  }
 
  const sendMessage=(e) =>{
    let msgtext=$('input');
    console.log(msgtext);
   if( msgtext.val().length!=0){
  
    console.log('i m inside sendmesaage fun') 
    $('.messages').append(`<div class="messages_right"><b>Me:</b> ${msgtext.val()}</div>`);
    socket.emit('message',msgtext.val());
   
    msgtext.val('');
  }
  }


  let msgtext=$('input'); 
  $('html').keydown((e) =>{
    if(e.which==13 && msgtext.val().length!=0){
      console.log(msgtext);
      $('.messages').append(`<div class="messages_right"><b>Me:<t></b> ${msgtext.val()}</div>`);
      socket.emit('message',msgtext.val());
     
      msgtext.val('');
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




 /*  <--Screen Sharing Code --> */
  
  function handleSuccess(stream) {
    startButton.disabled = true;      
    const video = document.querySelector('video');
    video.srcObject = stream;
  
    // demonstrates how to detect that the user has stopped
    // sharing the screen via the browser UI.
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      errorMsg('The user has ended sharing the screen');
      startButton.disabled = false;
    });
  }
  
  
 const shareScreen = () => {
    console.log('i m under share screen funtion');
  const startButton = document.getElementById('startButton');
  startButton.addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia({video: true})
        .then(handleSuccess);
  });
}

  
  if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    startButton.disabled = false;
  } else {
    errorMsg('getDisplayMedia is not supported');
  }

  /*  <--Screen Sharing Code ends --> */



  /* <--Screen Recording,Play and Download Code starts--> */


let mediaRecorder;
let recordedBlobs;

const codecPreferences = document.querySelector('#codecPreferences');

//const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');




const playButton = document.querySelector('button#play');
playButton.addEventListener('click', () => {
  const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value.split(';', 1)[0];
  const superBuffer = new Blob(recordedBlobs, {type: mimeType});
  recordedVideo.src = null;
  recordedVideo.srcObject = null;

  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});

const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function getSupportedMimeTypes() {
 const possibleTypes = [
    'video/webm;codecs=vp9,opus',
   'video/webm;codecs=vp8,opus',
   'video/webm;codecs=h264,opus',
    'video/mp4;codecs=h264,aac',
  ];
  return possibleTypes.filter(mimeType => {
    return MediaRecorder.isTypeSupported(mimeType);
  });
}

function startRecording() {
  recordedBlobs = [];
  const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
  const options = {mimeType};

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  downloadButton.disabled = true;
  codecPreferences.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
}

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  const gumVideo = document.querySelector('video');
  gumVideo.srcObject = stream;

  getSupportedMimeTypes().forEach(mimeType => {
    const option = document.createElement('option');
    option.value = mimeType;
    option.innerText = option.value;
    codecPreferences.appendChild(option);
  });
  codecPreferences.disabled = false;
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}


 

const recordButton = document.querySelector('button#record');
recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
    codecPreferences.disabled = false;
  }
});


function startRecord(){
document.querySelector('button#start').addEventListener('click', async () => {
  document.querySelector('button#start').disabled = true;
  const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
  const constraints = {
    audio: {
      echoCancellation: {exact: hasEchoCancellation}
    },
    video: {
      width: 1280, height: 720
    }
  };
  console.log('Using media constraints:', constraints);
  await init(constraints);
});
}


  /* <--Screen Recording,Play and Download Code ends--> */

  



  /* WhiteBoard Code Begins */
  const whitetable = () =>{

    /* Initialise variables */
    let isDrawing = false;
    let x = 0;
    let y = 0;
    
let eraseEnable = false;

    /* Get canvas and context */
    const canvas = document.getElementById('sheet');
    var context = canvas.getContext('2d');

    /* Add the event listeners for mousedown, mousemove, and mouseup */
    canvas.addEventListener('mousedown', e => {
        /* Drawing begins */
        x = e.offsetX;
        y = e.offsetY;
        isDrawing = true;
    });
    
    canvas.addEventListener('mousemove', e => {
        /* Drawing continues */
        if (isDrawing === true) {
            drawLine(context, x, y, e.offsetX, e.offsetY);
            x = e.offsetX;
            y = e.offsetY;
        }
    });
    
    window.addEventListener('mouseup', e => {
        /* Drawing ends */
        if (isDrawing === true) {
            drawLine(context, x, y, e.offsetX, e.offsetY);
            x = 0;
            y = 0;
            isDrawing = false;
        }
    });

    /* Initialise socket */
   // var socket = io();

    /* Receiving Updates from server */
    socket.on('update_canvas',function(data){
        let {x1,y1,x2,y2,color} = JSON.parse(data);
        drawLine(context,x1,y1,x2,y2,color,true);
    });

    /* Function to Draw line from (x1,y1) to (x2,y2) */
    function drawLine(context, x1, y1, x2, y2,color = selected_color,from_server = false) {

        /* Send updates to server (not re-emiting those received from server) */
        if(!from_server)
            socket.emit('update_canvas',JSON.stringify({x1,y1,x2,y2,color}));
        
        /* Draw line with color, stroke etc.. */
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 5;
        context.lineCap = 'round'
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
        }

     /* helper function to change selected_color
   triggered onclick buttons below canvas
   'red','green','blue'
 */


}
let selected_color = 'red';
function selectColor(color){
    document.getElementsByClassName(selected_color)[0].classList.remove('selected');
    document.getElementsByClassName(color)[0].classList.add('selected');    
    selected_color = color;
}  

toggleBtn = createButton("Toggle erase");
  toggleBtn.position(30, 60);
  toggleBtn.mouseClicked(toggleErase);

  function toggleErase() {
    if (eraseEnable) {
      noErase();
      eraseEnable = false;
    }
    else {
      erase();
      eraseEnable = true;
    }
  }
    
  function mouseMoved() {
    fill('red');
    noStroke();
    circle(mouseX, mouseY, 50);
  }
