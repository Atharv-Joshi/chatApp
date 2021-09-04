const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const Filter = require('bad-words')

const app = express()

//express does this behind the scenes
const server = http.createServer(app)

const io =  socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname , '../public') 

app.use(express.static(publicDirectoryPath))



io.on('connection' , (socket) => {
    console.log('new Websocket connection')

    socket.emit('message' , 'Welcome')

    socket.broadcast.emit('message' , 'A new user has joined')

    socket.on('sendMessage' , (message , callback) =>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.emit('message' , message)
        callback()
    })

    socket.on('sendLocation' , (position , callback) =>{
        io.emit('message' , `https://www.google.com/maps?q=${position.latitude},${position.longitude}`)
        callback()
    })

    socket.on('disconnect' , () =>{
        io.emit('message' , 'A user has left!')
    })
})




server.listen(port , () => {
    console.log('server up on port ' , port)
})