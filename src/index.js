const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const Filter = require('bad-words')
const {generateMessage , generateLocationMessage} = require('./utils/messages')

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
    socket.on('join' , ({username , room}) =>{
        socket.join(room)
        //welcome message

        socket.emit('message' , generateMessage('Welcome!'))

        //new user message
        socket.broadcast.to(room).emit('message' , generateMessage(`${username} has joined!`))
    })

    //client message
    socket.on('sendMessage' , (message , callback) =>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to('room1').emit('message' , generateMessage(message))
        callback()
    })

    //location message
    socket.on('sendLocation' , (position , callback) =>{
        io.to('room1').emit('locationMessage' , generateLocationMessage(`https://www.google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    //user disconnected
    socket.on('disconnect' , () =>{
        io.to('room1').emit('message' , 'A user has left!')
    })
})




server.listen(port , () => {
    console.log('server up on port ' , port)
})