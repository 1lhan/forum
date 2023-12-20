const mongoose = require('mongoose')

const userModel = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: true
    },
    membershipDate: {
        type: Date,
        required: true
    },
    profileImage: {
        type: String,
        required: false
    },
    bookmarks: [
        {
            topicId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'topic'
            }
        }
    ],
    comments: [
        {
            topicId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'topic'
            },
            commentId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'comment'
            }
        }
    ],
    myTopics: [
        {
            topicId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'topic'
            }
        }
    ],
    reactions: [
        {
            value: {
                type: String,
                required: true
            },
            topicId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'topic'
            },
            commentId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'comment'
            }
        }
    ]
})

module.exports = mongoose.model('user', userModel)