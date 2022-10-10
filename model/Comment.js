const mongoose = require('mongoose');


const commentSchema  = new mongoose.Schema({

    reaction: {
        type: String,
        default: "none"},
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

    
});

module.exports.commentSchema = commentSchema;
module.exports.Comment = mongoose.model("comment", commentSchema);


