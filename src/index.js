const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
// const Filter = require('bad-words')
const {generateMessage , generateLocationMessage} = require('./utils/messages')
const {addUser , removeUser , getUser , getUsersInRoom} = require('./utils/users')

const app = express()

//express does this behind the scenes
const server = http.createServer(app)

const io =  socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname , '../public') 

app.use(express.static(publicDirectoryPath))


//user connected
io.on('connection' , (socket) => {
    console.log('new Websocket connection')

    //setup chat rooms
    socket.on('join' , ({username , room} , callback) =>{
        const {error ,user} = addUser(
                                {
                                    id : socket.id,
                                    username,
                                    room
                                }
        )
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        //welcome message
        socket.emit('message' , generateMessage('Welcome!' , ' Admin'))

        //new user message
        socket.broadcast.to(user.room).emit('message' , generateMessage(`${user.username} has joined!` , 'Admin'))

        //updated users list
        io.to(user.room).emit('roomData' , {
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    })

    //client message
    socket.on('sendMessage' , (message , callback) =>{
        const user = getUser(socket.id)
        // const filter = new Filter()
        // if(filter.isProfane(message)){
        //     return callback('Profanity is not allowed')
        // }
        io.to(user.room).emit('message' , generateMessage(message , user.username))
        callback()
    })

    //location message
    socket.on('sendLocation' , (position , callback) =>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage' , generateLocationMessage(`https://www.google.com/maps?q=${position.latitude},${position.longitude}` , user.username))
        callback()
    })

    //user disconnected
    socket.on('disconnect' , () =>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message' , generateMessage(`${user.username} has left!` , 'Admin'))

            // //updated user list
            io.to(user.room).emit('roomData' , {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    
    })
})




server.listen(port , () => {
    console.log('server up on port ' , port)
})