const mongoose = require('mongoose');
const {commentSchema} = require('./Comment');

const postSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        commentSchema
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }

    
});


module.exports.Post = mongoose.model("post", postSchema)
