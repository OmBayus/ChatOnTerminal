const express = require("express")
const http = require("http")
const socketio = require("socket.io")

const app = express()

const PORT = process.env.PORT || 4000

const server = http.createServer(app)

app.get("/",(req,res)=>{
    res.send("Hello")
})


const io = socketio(server,{cors: {
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}})

const users = [
    {username:'admin',password:'123'},
    {username:'gm',password:'123'},

]

var onlineList = [] 

io.on("connection",(socket)=>{

    socket.on('login',(data)=>{
        const user = users.find(i=>i.username===data.username)
        if(user && user.password === data.password){
            onlineList.push({username:user.username,socketId:socket.id})
            socket.emit('login',{success:true,username:data.username})
        }
        else{
            socket.emit('login',{success:false})
        }
    })

    socket.on('register',(data)=>{
        const user = users.find(i=>i.username===data.username)
        if(user){
            socket.emit('register',{success:false})
        }
        else{
            onlineList.push({username:data.username,socketId:socket.id})
            users.push(data)
            socket.emit('register',{success:true,username:data.username})
        }
    })

    socket.on("online",(data)=>{
        // onlineList.forEach(item=>{
        //     io.sockets.to(item.socketId).emit("online",onlineList.map(i=>i.username))
        // })

        socket.broadcast.emit('online',('online list: '+ onlineList.map(i=>i.username)))
    })
    
    socket.on('sendMsg',(data)=>{
        if(data === "/online"){
            socket.broadcast.emit('online',('online list: '+ onlineList.map(i=>i.username)))
        }
        else{
            const user = onlineList.find(i=>i.socketId === socket.id)
            // onlineList.forEach(item=>{
            //     io.sockets.to(item.socketId).emit("getMsg",(user.username+': '+data))
            // })
            
            socket.broadcast.emit("getMsg",(user.username+': '+data))
        }
    })

    socket.on("disconnect", () => {
            
        onlineList = onlineList.filter(i=>i.socketId!==socket.id)
    });
})

server.listen(PORT,()=>{
    console.log("Server has started on port",PORT);
})