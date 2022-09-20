const users = [];
function user_collection(id,username, room) {
    const user = {id,username,room};

    users.push(user);

    return user;
}

function getCurrentUser(id) {
        return users.find((user)=> users.id === id);
}

function user_left(id) {
    const index = users.findIndex(user => user.id ===id);
    if (index !== -1) {
       return  users.splice(index,1)[0];
    }
}
function getRoomUser(room) {
    return users.filter((user) => user.room === room);
}
module.exports = {user_collection,getCurrentUser,user_left,getRoomUser};