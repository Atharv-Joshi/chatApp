const socket = io() 

const chatForm = document.querySelector('#message-form')
const messageOutput = document.querySelector('#message')

chatForm.addEventListener('submit' , (e) => {
    e.preventDefault()

    //both of these lines do same thing
    // const messageField = e.target.message
    const messageField = e.target.elements.message

    if(!messageField.value){
        messageOutput.textContent = 'Enter a message'
    }
    else{
        socket.emit('sendMessage' , messageField.value , (error) =>{
            if(error){
                return console.log(error)
            }
            console.log('Message delivered')
        })
    }
})

socket.on('newMessage' , (message) =>{
    messageOutput.textContent = message
})

socket.on('message' , (message) =>{
    console.log(message)
})

document.querySelector('#send-location').addEventListener('click' , () =>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendLocation' , {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        } , () => {
            console.log('Location Shared')
        })
    })
})