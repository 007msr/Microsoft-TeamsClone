const express=require('express');
const app=express();
const port=process.env.PORT || 8080;
const nodemailer = require('nodemailer');
const mailGun=require('nodemailer-mailgun-transport');
var smtpTransport = require('nodemailer-smtp-transport');


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

//Data Parsing //
app.use(express.urlencoded({extended:false}));
app.use(express.json());



require("dotenv").config();
const { auth,requiresAuth } = require('express-openid-connect');
const { EEXIST } = require('constants');

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

//app.get('/',(req,res) => {
////    res.render('home');
//})

const history = [];
app.get("/profile", requiresAuth(),(req,res) => {
  //console.log(req.oidc.user.name+hi);
  // res.render('home',{
  //   username:req.oidc.user.name,
 // });
 
 res.send(JSON.stringify(req.oidc.user));
 
});
app.get('/', requiresAuth(),(req,res) => {
 res.redirect(`/${uuidv4()}`);
});
app.get('/:room',(req,res) => {
  //console.log(req.oidc.user.password);
    res.render("home", {
      roomID:req.params.room,
      username:req.oidc.user.name,
      nickname:req.oidc.user.nickname,
      picture:req.oidc.user.picture,
      useremail:req.oidc.user.email,
      email_verified:req.oidc.user.email_verified
    });
});


app.post('/send',  function (req, res) {
 // console.log(req.body);
   

  var mailOpts, smtpTrans;

  //Setup Nodemailer transport, I chose gmail. Create an application-specific password to avoid problems.
  smtpTrans = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      //  host:'smtp.gmail.com',
      //  port:465,
      // secure:true,
      auth: {
        user: req.body.senderemail, // generated ethereal user
        pass: req.body.password,  // generated ethereal password
       }
  }));
  const output = `
  <p>You have a new meeting url</p>
  <h3>Credentials for the new meeting</h3>
  <ul>  

    <li>Meeting Link: ${req.body.link}</li>
    
  </ul>
  <h3>Message</h3>
  <p>${req.body.msg}</p>
`;
  //Mail options
  mailOpts = {
      from:req.body.senderemail,
      to: req.body.receiveremail, // list of receivers
      subject: 'Meeting Credentials for the new meeting', //, // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };
 smtpTrans.sendMail(mailOpts,  function (error, res) {
  try{
    console.log('Message sent successfully!');
   }
   catch(error)
     {
        // res.send("Email could not send due to error" +error);
        return console.log(error);
    }

});

});


 //  
                 

   

//console.log(query.sql);



io.on('connection',socket => {
   
        /* New user connected  */
        console.log('A user connected');
    
        /* draw all old updates to this user's canvas */
        console.log('Syncing new user"s canvas from history')
        for(let item of history)
          socket.emit('update_canvas',item);
    
        /* Recieving updates from user */
        socket.on('update_canvas',function(data){
    
          /* store updates */
          history.push(data);
    
          /* send updates to all sockets except sender */
          socket.broadcast.emit('update_canvas',data);
        });
     
      
  
    socket.on('new-user',(username)=>{
       // console.log(username);
        users[socket.id] =username;
        socket.broadcast.emit('user-joined',username);
    })
    socket.on('join-room',(roomID,userID)=>{
       // console.log("joined room");
     socket.join(roomID);
     socket.broadcast.to(roomID).emit('user-connected',userID);
    
     socket.on('message',message=>{
        socket.broadcast.emit('chat-message',{message: message, name: users[socket.id]});
     })


    //  socket.on('disconnect', (roomID,userID) => {
    //     socket.broadcast.to(roomID).emit('user-disconnected', userID)
    //   })
    socket.on('disconnect', () =>{
    socket.broadcast.emit('disconnected',users[socket.id]);
    
    delete users[socket.id];
    })
    socket.on('video-disconnect', (roomID,userID) =>{
      socket.broadcast.to(roomID).emit('user-disconnected',userID);
      delete peers[userID];
      
    
      })
    })
    
   
   

   
})



server.listen(port,(req,res) => {
    console.log("connection succcessful");
})