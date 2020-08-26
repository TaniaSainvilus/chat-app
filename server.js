const express = require('express');
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env .PORT || 3003

const mongodbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ventd'
console.log(mongodbURI)
require('dotenv').config()



// Error / Disconnection
mongoose.connection.on('error', err => console.log(err.message + ' is Mongod not running?'))
mongoose.connection.on('disconnected', () => console.log('mongo disconnected'))

//Database Connection
mongoose.connect(mongodbURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true
})
mongoose.connection.once('open', ()=>{
    console.log('connected to mongoose...')
})

//middleware
app.use(express.json())
app.use(
  session({
    secret: process.env.JWT_SECRET, 
    resave: false, 
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
)

const whitelist = ['http://localhost:3000', 'https://ventdchatapp-frontend.herokuapp.com/', "https://ventdchatapp-frontend.herokuapp.com"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) >= 0) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))

//For allowing all headers to avoid preflight CORS problems
app.all((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://ventdchatapp-frontend.herokuapp.com');
  next();
});

//Controller/Routes
const chatsController = require("./controllers/chat.js");
app.use("/chats", chatsController);

const userController = require('./controllers/userRouter.js')
app.use('/user', userController)

app.get('/', (req, res) => {
  res.redirect('/');
});

const Chat = require("./models/chat.js");

io.on('connection', (socket) => {

  // Get the last 10 messages from the database.
  Chat.find().sort({createdAt: -1}).limit(10).exec((err, chat) => {
    if (err) return console.error(err);

    // Send the last messages to the user.
    socket.emit('init', chat);
  });

  // Listen to connected users for a new message.
  socket.on('message', (cht) => {

    // Notify all other users about a new message.
    socket.broadcast.emit('push', cht);
  });

});

http.listen(PORT, ()=> {
    console.log("I am listening for requests at port:", PORT);
  });