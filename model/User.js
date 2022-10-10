const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    date: {
        type: Date,
        default: Date.now
    },

    posts : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],

    friends : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
    

    


});

module.exports = mongoose.model('User', userSchema);