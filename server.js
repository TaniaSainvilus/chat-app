const express = require('express');
const mongoose = require('mongoose')
const session = require('express-session')
const cors = require('cors')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3003

const mongodbURI = process.env.MONGODBURI || 'mongodb://localhost:27017/xpense'
console.log(mongodbURI)
require('dotenv').config()

// Error / Disconnection
mongoose.connection.on('error', err => console.log(err.message + ' is Mongod not running?'))
mongoose.connection.on('disconnected', () => console.log('mongo disconnected'))

//Database Connection
mongoose.connect(mongodbURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
})
mongoose.connection.once('open', ()=>{
    console.log('connected to mongoose...')
})

//middleware
app.use(express.json())
app.use(
  session({
    secret: process.env.JWT_SECRET, //a random string do not copy this value or your stuff will get hacked
    resave: false, // default more info: https://www.npmjs.com/package/express-session#resave
    saveUninitialized: false // default  more info: https://www.npmjs.com/package/express-session#resave
  })
)

const whitelist = ['http://localhost:3000', 'http://10.0.0.29:3000', 'https://xpensefrontend.herokuapp.com/', "https://xpensefrontend.herokuapp.com"];
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
  res.header('Access-Control-Allow-Origin', 'https://xpensefrontend.herokuapp.com');
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