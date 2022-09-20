const mongoose = require('mongoose');
const data_schema = new mongoose.Schema({
  
    User_id: {
        type: 'String',
        required: true
    },
    User_roomName: {
        type: 'String',
        required: true
    },
    User_name: {
        type: 'String',
        required: true
    },
  
    User_messages:{
        type:'String',
        required:true
    },

    message_time:{
        type:'String',
        required:true
    },
});

const Database_model = mongoose.model('ichat',data_schema);

module.exports = Database_model;