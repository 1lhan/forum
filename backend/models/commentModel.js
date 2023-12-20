const mongoose = require('mongoose')

const commentModel = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'topic'
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
    comment: {
        type: String,
        required: true
    },
    reactions: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'user'
            },
            value: {
                type: String,
                required: true
            }
        }
    ],
    images: [
        {
            type: String,
            required: true
        }
    ],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'comment'
    }
})

module.exports = mongoose.model('comment', commentModel)