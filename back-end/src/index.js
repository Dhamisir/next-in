require("dotenv").config();
const express= require("express");
const cors= require("cors");
const http =  require('http')
const connect = require("./config/db");
const PORT= process.env.PORT;
const AuthRoute = require('./routes/auth.route') 
const TaskRoute = require('./routes/task.route')
const ChatroomRoute = require('./routes/chatroom.route')
const { Server } = require('socket.io')
const MessageModel = require("./model/message.model")
const ChatroomModel = require('./model/chatRoom.model')
const UserModel = require('./model/user.model')

const app= express();
const server = http.createServer(app)

app.use(express.json());
app.use(cors());
app.use('/auth', AuthRoute)
app.use('/task', TaskRoute)
app.use('/chatroom', ChatroomRoute)

app.get("/", (req, res)=>{
    res.status(200).send('Server Started!')
})


 
server.listen(PORT,async()=>{
    await connect();
    console.log(`listening at http://localhost:${PORT}`)
})

const io = new Server(server, {
    cors:{
        origin:'http://localhost:3000',
        methods:["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
})

io.on('connection', (socket)=>{
    socket.once('setup', async (user)=>{
        socket.join(user)
        console.log(socket.id, 'connected')
        socket.broadcast.emit('update')
        let user1 = await UserModel.findOneAndUpdate({_id:user}, {online:true, socket:socket.id}, {new:true})
    })
    
    socket.once("newMsg", async ({msg,sender,chat})=>{
        const newtest = new MessageModel({
            msg, 
            sender,
            chat,
        })
        await newtest.save()
        const chatroom = await ChatroomModel.findById(chat)
        let arr = [...chatroom.messages]
        arr.push(newtest._id)
        const update = await ChatroomModel.findByIdAndUpdate(chat, {
            $set:{messages:arr}
        })
        const getMsg = await MessageModel.findById(newtest._id).populate("sender") 
        socket.broadcast.emit("newMessage", getMsg)
    })
    
    socket.once('disconnect', async (id)=>{
        console.log(socket.id, 'disconnected')
        socket.broadcast.emit('update')
        let user = await UserModel.findOneAndUpdate({socket:socket.id}, {online:false, socket:''}, {new: true})
    })
})