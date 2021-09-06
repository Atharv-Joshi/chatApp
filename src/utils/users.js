const users = []

//add user  function
const addUser = ({id , username , room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error : 'Username and room are required!'
        }
    }

    //checking for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error : 'Username is already used!'
        }
    }

    //store user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return {user}
}

//remove user  returns undefined in user not found else the user
const removeUser = (id) =>{
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return users.splice(index , 1)[0]
    }
}

//getUser returns undefined in user not found else the user
const getUser = (id) =>   users.find((user) => user.id === id)

//getUsersInRoom returns empty array if conditon not met else array of users
const getUsersInRoom = (room) => {
    const usersInRoom = users.filter(
        (user) =>  user.room === room
    )
    return usersInRoom
}



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

