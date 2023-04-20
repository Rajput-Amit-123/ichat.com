const socket = io('http://localhost:3000');
const messageContainer = document.getElementById("chat-messages");
const inputContainer = document.getElementById('msg');
const form = document.getElementById('chat-form');
const join_sound = new Audio('/utils/server_in.wav');
const leave_sound = new Audio('/utils/server_out.wav');
const msg_sound = new Audio('/utils/notification.wav');

const { username, room } = Qs.parse(window.location.search, {
    ignoreQueryPrefix: true
});


// creating a new message
form.addEventListener('submit',(e)=>{
e.preventDefault();
const messageElement = inputContainer.value;
socket.emit('send',username,messageElement);
inputContainer.value = '';
inputContainer.focus
});

// append function 
const append_Msg = (username,message,time,event) => {
    const Msg = document.createElement("div");
    Msg.innerHTML = ` <div class = "message" draggable="true">
   <div id = ${socket.id}> <p class="meta">${username} <span>${time}</span></p>
                    <p class="text" >
                        ${message}
                    </p></div></div>`
    let Msg_container = document.getElementById('chat-messages')
    Msg_container.append(Msg);
    if (event == 'JOIN_message') {
        join_sound.play()
    }
    else if(event == 'leave'){
        leave_sound.play();
    }
    else if(event == 'receive'){
        msg_sound.play();
    }
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
//loading old message
socket.on('history_message', (result) => {
    printOutOldMessage(result);
});

//fired when new user joined , taking perameter form query string(URL)
socket.emit('userJoin',({username,room}));

//Greating message from BOT
socket.emit('new-user-found',"Welcome to IChat");

socket.on('user-joined',(data)=>{
    append_Msg(`${data.Name}`,`${data.message}`,`${data.time}`, null);
})
socket.on('Onsend', (data) => {
    append_Msg("You", `${data.message}`, `${data.time}`,'Onsend');
});
socket.on('JOIN_message',(data)=>{
    append_Msg(data.BotName, `${data.message}`, data.time, 'JOIN_message');
});
socket.on('leave', (data) => {
    append_Msg(data.BotName, `${data.message}`, data.time,null);
});
socket.on('receive',(data)=>{
    append_Msg(`${data.Name}`, `${data.message}`,`${data.time}`,'receive');
});
 socket.on('leave',(data)=>{
     append_Msg(`${data.BotName}`,`${data.message}`,`${data.time}`,'leave');
 });


const RoomName = document.getElementById('room-name');
const users_info = document.getElementById('users');

socket.on('Sidebar_info',(data) => {
   printOutRoomName(data.room);
   printOutUsersName(data.users);
});

function printOutRoomName(room) {
    
    RoomName.innerText = room;
}
function printOutUsersName(users) {
  
 users_info.innerHTML = ` ${users.map(user => `<li>${user.username}</li>`).join('')}`;
   
}
function printOutOldMessage(data) {
for (let i = 0; i < data.length; i++) {
    if (`${data[i].User_name}`=== username) {
        
        append_Msg(`You`, `${data[i].User_messages}`, `${data[i].message_time}`);
      
    } else {
        append_Msg(`${data[i].User_name}`, `${data[i].User_messages}`, `${data[i].message_time}`) 
    }
}
}

// Drag and drop event 

const message_feild = document.querySelector('.chat-messages');

message_feild.addEventListener('dragend', (e) => {
    //function to delete the message from data base
    
    setTimeout(() => {
        if (e) {
            e.target.classList.add('hide');
        }
        else {
        }
    }, 0);
});
message_feild.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/HTML', e.target.innerHTML);
})

const Been = document.getElementById('dust_been');
Been.addEventListener('dragover', dragOver);
Been.addEventListener('dragenter', dragEnter);
Been.addEventListener('dragleave', dragLeave);
Been.addEventListener('drop', drop);// do color transition form white to red to white 

function dragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function dragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function dragLeave(e) {
    e.target.classList.remove('drag-over');
}

function drop(e) {

    const id = e.dataTransfer.getData('text/HTML');
    const draggable = document.getElementById(id);
}