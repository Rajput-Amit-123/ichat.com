const moment = require('moment');

function formateMessage(Name,message) {
   return{
       Name:Name,
       message:message,
       time: moment().format("hh:mm a")
   }
}

module.exports = formateMessage;