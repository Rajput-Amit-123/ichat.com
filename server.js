const path = require('path');
const moment = require('moment');
const express = require('express');
const http = require('http');
const PORT = 3000 || process.env.PORT;
const formateMessage = require('./utils/formateMessage');
const { user_collection, getCurrentUser, getRoomUser, user_left } = require('./utils/user_info');
const { db } = require('./utils/database');
const BotName = 'IChatBot';
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

io.on('connection', socket => {

    // handling the data base
    // create a connection between database and a server

    const mongoose = require('mongoose');
    const Database_model = require('./utils/database');
    mongoose.connect('mongodb://localhost:27017/IChat').then(() => {
        console.log("connection is astablished with the Database('ichats')");
    }).catch((err) => {
        console.log(err);
    });


    socket.on('userJoin', ({ username, room }) => {


        const user = user_collection(socket.id, username, room);
        socket.join(user.room);
        //   console.log(user.room);

        Database_model.find({
            User_roomName
                : `${room}`
        }).then((result) => {
            socket.emit("history_message",result)
        })



        // we got a new user

        socket.on("new-user-found", (message) => {
            const data = formateMessage(BotName, message);
            socket.emit("user-joined", data);

            socket.broadcast.to(user.room).emit('JOIN_message', { BotName, message: `${user.username}:Has Joined the Chat`, time: moment().format("hh:mm a") });


        })

        // sending the message

        socket.on('send', (username, messageElement) => {
            // console.log(`${messageElement}`);
            let details = new Database_model({
                User_id: socket.id, User_roomName: room, User_name: username, User_messages: messageElement, message_time: moment().format("hh:mm a")
            });
            details.save().then(() => {
            }).catch((err) => {
                console.log(err);
            });

            socket.emit("Onsend", { message: messageElement, time: moment().format("hh:mm a") });

            socket.broadcast.to(user.room).emit('receive', { message: messageElement, Name: username, time: moment().format("hh:mm a") });
        });

        // When user leave the room 

        socket.on('disconnect', () => {
            const user = user_left(socket.id);
            if (user) {
                socket.broadcast.to(user.room).emit('leave', { BotName, message: `${user.username}:Has left the Chat`, time: moment().format("hh:mm a") })
            }
            // updating sidebar info when disconnect

             io.to(user.room).emit('Sidebar_info', {
                room: user.room,
                users: getRoomUser(user.room)
            })

        });

        // sending sindebar Info
        io.to(user.room).emit('Sidebar_info', {
            room: user.room,
            users: getRoomUser(user.room)
        });
    });

});

server.listen(PORT, () => {
    console.log(`server runing on http://localhost:${PORT}`);
})