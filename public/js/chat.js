const socket = io() 

//Elements
const $chatForm = document.querySelector('#message-form')
const $chatFormInput = $chatForm.querySelector('input')
const $chatFormButton = $chatForm.querySelector('#send')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

//send message event
$chatForm.addEventListener('submit' , (e) => {
    e.preventDefault()
    //disable form 
    $chatFormButton.setAttribute('disabled' , 'disabled')

        socket.emit('sendMessage' , $chatFormInput.value , (error) =>{
            //enable form
            $chatFormButton.removeAttribute('disabled')
            $chatFormInput.value = ''
            $chatFormInput.focus()
            if(error){
                return console.log(error)
            }
            console.log('Message delivered')
        })
})

const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //total height
    const totalHeight = $messages.scrollHeight

    //how far have we scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(totalHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

//message from server
socket.on('message' , (message) =>{
    const html = Mustache.render($messageTemplate , {
        message : message.text,
        username : message.username,
        createdAt : moment(message.createdAt).format('HH:mm a')
    })
    $messages.insertAdjacentHTML( 'beforeend' , html)
    autoScroll()
})

//location message
socket.on('locationMessage' , (url) =>{
    const html = Mustache.render($locationTemplate , {
        url : url.url,
        username : url.username,
        createdAt : moment(url.createdAt).format('HH:mm a')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoScroll()
})

//updated user list
socket.on('roomData' , ({room , users}) => {
    const html = Mustache.render($sidebarTemplate , {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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


socket.emit('join' , {username , room} , (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})