const path = require('path');
const moment = require('moment');
const express = require('express');
const http = require('http');
const PORT = 3000 || process.env.PORT;
const formateMessage = require('./utils/formateMessage');
const { user_collection, getCurrentUser, getRoomUser, user_left } = require('./utils/user_info');
const { db } = require('./utils/database');
const BotName = 'IChatBot';
const auth = require('./public/middleware/auth');
const bodyParser = require('body-parser');

// Authentication requirement
require("dotenv").config();
require('./public/config/auth_Database').connect(); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { models } = require("mongoose");
const app = express();
const User = require('./public/models/user');
const req = require("express/lib/request");
const cookieParser = require('cookie-parser');  
const { log } = require('console');

app.use(cookieParser());
app.use(express.static(__dirname));
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
app.set('view engine','ejs');
app.get('/',(req,res)=>{
res.redirect('/home');
});






app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/register", async (req, res) => {
    //register logic
    try { 
    
        const  Username = req.body.Username;
        const email = req.body.email;
        const password = req.body.password;
       
        //if any feild is empty
        if (!(Username && email && password)) {
            res.status(400).send("All feild is required!");
        }

        //check if user is already exists 
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).send("User is already exist | please try to login");
        }
        // Password encryption
        encryptedPassword = await bcrypt.hash(password, 10);

        //create user in database
        const user = await User.create({
            Username,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        //create token 
        let user_id = { user_id: user._id, email };
        const token = jwt.sign(
            user_id,
            process.env.TOKEN_KEY,
            { expiresIn: "2h" }
        );
   
        res.cookie("token", token);
        user.token = token;

        user.save();
        // return new user
        res.cookie('token', token, { maxAge: 7200000 });
        res.cookie('Username', user.Username, { maxAge: 7200000 }).status(201).redirect('/home');
    } catch (error) {
        console.log(`your error is: ${error}`);
    }
})

app.post("/login", async (req, res) => {
    try {
        //accepting perameters form request
        const { email, password } = req.body;
        
        //cheking if all entered
        if (!(email && password)) {
            res.status(400).send("Please Enter All required details");
        }

        //now valid the user
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            //create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // asign created token to the user
            user.token = token;
           
            //return the user

            res.cookie('token',token,{maxAge:7200000});
            res.cookie('Username',user.Username,{maxAge:7200000}).status(201).redirect('/home');
        }
        else{
            res.status(400).send(`User Not exist || please try to register first`)
        }

    } catch (error) {
        console.log(`There is some error: ${error}`);
    }
})

app.get('/login',(req, res) => {
    res.status(200).render("Login");
})
app.get('/chat',auth,(req,res)=>{
    res.render("chat");
})
app.get('/register',(req, res) => {
    res.status(200).render("register");
});
app.get('/home',auth,async (req,res)=>{
    res.status(200).render("index");
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
        // Adding Props to the New User.
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