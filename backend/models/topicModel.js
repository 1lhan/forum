const mongoose = require('mongoose')

const topicModel = mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 40
    },
    category: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 200
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: false
    },
    creatorUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    images: {
        type: Array,
        required: false
    },
    comments: [
        {
            commentId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'comment'
            }
        }
    ]
})

module.exports = mongoose.model('topic', topicModel)