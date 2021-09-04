const socket = io() 

//Elements
const $chatForm = document.querySelector('#message-form')
const $messageOutput = document.querySelector('#message')
const $chatFormInput = $chatForm.querySelector('input')
const $chatFormButton = $chatForm.querySelector('#send')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML

//send message event
$chatForm.addEventListener('submit' , (e) => {
    e.preventDefault()
    //disable form 
    $chatFormButton.setAttribute('disabled' , 'disabled')

    //both of these lines do same thing
    // const messageField = e.target.message
    const $messageField = e.target.elements.message

    if(!$messageField.value){
        $messageOutput.textContent = 'Enter a message'
    }
    else{
        socket.emit('sendMessage' , $messageField.value , (error) =>{
            //enable form
            $chatFormButton.removeAttribute('disabled')
            $chatFormInput.focus()
            if(error){
                return console.log(error)
            }
            console.log('Message delivered')
        })
    }
})


//message from server
socket.on('message' , (message) =>{
    const html = Mustache.render($messageTemplate , {
        message
    })
    $messages.insertAdjacentHTML( 'beforeend' , html)
})

//send location event
$sendLocationButton.addEventListener('click' , () =>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled' , 'disabled')
    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendLocation' , {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        } , () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})