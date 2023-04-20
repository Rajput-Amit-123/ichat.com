const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Username: { type: String, default: null },
    email: { type:String, unique: true },
    password: { type: String },
    token: { type: String },
});

module.exports = mongoose.model("auth-DATABASE", userSchema);


// Feture Updates :- Add user Roles (Student, Teacher, Blogger, Profesional)