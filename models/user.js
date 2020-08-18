const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 7},
    email: {type: String, required: true, unique: true},
    
})

module.exports = mongoose.model('User', userSchema)
