const express=require('express');
const app=express();
const port=process.env.PORT || 8080;

const server = require('http').Server(app)
const io = require('socket.io')(server);
const {v4:uuidv4}=require('uuid');
const {ExpressPeerServer} = require("peer");
const { name } = require('ejs');
const peerServer=ExpressPeerServer(server,{
    debug:true,
})
const users={};


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use("/peerjs",peerServer);

require("dotenv").config();
const { auth,requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  secret: process.env.SECRET,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  clientID: process.env.CLIENT_ID,
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
//app.get('/', (req, res) => {
 // res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
//});





app.get('/', requiresAuth(),(req,res) => {
 res.redirect(`/${uuidv4()}`);
});
app.get('/:room',(req,res) => {
    res.render("room", {roomID:req.params.room});
});

io.on('connection',socket => {
  
    socket.on('new-user',(username)=>{
        console.log(username);
        users[socket.id] =username;
        socket.broadcast.emit('user-joined',username);
    })
    socket.on('join-room',(roomID,userID)=>{
        console.log("joined room");
     socket.join(roomID);
     socket.broadcast.to(roomID).emit('user-connected',userID);
    
     socket.on('message',message=>{
        socket.broadcast.emit('chat-message',{message: message, name: users[socket.id]});
     })


     socket.on('disconnect', (roomID,userID) => {
        socket.broadcast.to(roomID).emit('user-disconnected', userID)
      })
    })
   
})



server.listen(port,(req,res) => {
    console.log("connection succcessful");
})