const express = require('express')
const router = express.Router()

const UserModel = require('../models/userModel')
const TopicModel = require('../models/topicModel')
const CommentModel = require('../models/commentModel')

const checkUser = async (userId) => {
    let user = await UserModel.findOne({ _id: userId })
    return user
}
const checkTopic = async (topicId) => {
    let topic = await TopicModel.findOne({ _id: topicId })
    return topic
}
const checkComment = async (commentId) => {
    let comment = await CommentModel.findOne({ _id: commentId })
    return comment
}

router.post('/create-topic', async (req, res) => {
    const { requestBody } = req.body

    const user = await checkUser(requestBody.creatorUserId)
    if (!user) return res.json({ success: false, msg: 'User could not find' })

    const newTopic = new TopicModel({ ...requestBody, comments: [], images: [], updatedAt: null })
    const createTopic = await newTopic.save()
    const updateUser = await UserModel.findOneAndUpdate({ _id: requestBody.creatorUserId }, { $push: { myTopics: { topicId: createTopic._id } } }, { new: true })

    return res.json({ success: createTopic ? true : false, user: updateUser ? updateUser : false })
})

router.get('/get-topic-count/:categoryName', async (req, res) => {
    let category = req.params.categoryName == -1 ? {} : { category: req.params.categoryName }
    let count = await TopicModel.countDocuments(category)
    return res.json({ success: count ? true : false, count })
})

router.get('/get-topics/:categoryName/:pageNumber', async (req, res) => {
    const { categoryName, pageNumber } = req.params
    let category = categoryName == -1 ? {} : { category: categoryName }

    let topics = await TopicModel.find(category)
        .populate('creatorUserId', 'username')
        .skip(10 * (pageNumber - 1))
        .limit(10 * pageNumber)
        .exec()

    return res.json({ success: topics ? true : false, topics })
})

router.get('/get-topic-for-home-page', async (req, res) => {
    let oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))

    let topics = await TopicModel.find({}).sort({ _id: -1 }).populate('creatorUserId', 'username').limit(100)
    let newestTopics = topics.slice(0, 10)
    let popularTopics = topics.slice().filter(item => item.createdAt >= oneWeekAgo).sort((a, b) => b.comments.length - a.comments.length).slice(0, 10)
    return res.json({ success: topics ? true : false, newestTopics: topics ? newestTopics : [], popularTopics: topics ? popularTopics : [] })
})

router.get('/get-topic/:title', async (req, res) => {
    const { title } = req.params
    let _title = title.split('_t')[0]
    let createdAt = new Date(title.split('_t')[1])

    let topic = await TopicModel.findOne({ title: _title, createdAt })
        .populate('creatorUserId', 'username')
        .populate('comments.commentId', '')
        .populate({ path: 'comments.commentId', populate: { path: 'userId', select: 'username profileImage membershipDate' } })

    return res.json({ success: topic ? true : false, topic: topic ? topic : {} })
})

router.get('/get-detailed-user-data/:username', async (req, res) => {
    let user = await UserModel.findOne({ username: req.params.username }).select('-password')
        .populate([
            { path: 'bookmarks.topicId', select: '-images -content', populate: { path: 'creatorUserId', select: 'username' } },
            { path: 'comments.commentId', select: 'comment createdAt updatedAt topicId', populate: { path: 'topicId', select: 'title createdAt' } },
            { path: 'myTopics.topicId', select: '-images -content', populate: { path: 'creatorUserId', select: 'username' } },
            { path: 'reactions.commentId', select: 'comment createdAt updatedAt', populate: { path: 'topicId', select: 'title createdAt updatedAt' } },
        ])

    if (!user) return res.json({ success: false, msg: 'User not find' })
    return res.json({ success: true, user })
})

router.post('/add-comment', async (req, res) => {
    const { userId, createdAt, comment, replyTo, topicId } = req.body

    let checkUser = await UserModel.findOne({ _id: userId })
    if (!checkUser) return res.json({ success: false, msg: 'User could not find' })

    let checkTopic = await TopicModel.findOne({ _id: topicId })
    if (!checkTopic) return res.json({ success: false, msg: 'Topic could not find' })

    let newComment = new CommentModel({ userId, topicId, createdAt, updatedAt: null, comment, reactions: [], images: [] })
    if (replyTo) newComment.replyTo = replyTo._id
    let saveNewComment = await newComment.save()

    let addNewCommentToTopic = await TopicModel.findOneAndUpdate({ _id: topicId }, { $push: { comments: { commentId: saveNewComment._id } } })
    let addNewCommentToUser = await UserModel.findOneAndUpdate({ _id: userId }, { $push: { comments: { commentId: saveNewComment._id } } })

    return res.json({ success: true })
})

router.post('/delete-comment', async (req, res) => {
    const { userId, commentId, topicId } = req.body

    let user = await checkUser(userId)
    if (!user) return res.json({ success: false, msg: 'User could not find' })

    let comment = await checkComment(commentId)
    if (!comment) return res.json({ success: false, msg: 'Comment could not find' })

    let topic = await checkTopic(topicId)
    if (!topic) return res.json({ success: false, msg: 'Topic could not find' })

    let deleteComment = await CommentModel.deleteOne({ _id: commentId })
    let deleteCommentFromTopic = await TopicModel.findOneAndUpdate({ _id: topicId }, { $pull: { comments: { commentId } } })
    let deleteCommentFromUser = await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { comments: { commentId } } })
    let deleteReactionsFromUsers = await UserModel.updateMany({ "reactions.commentId": commentId }, { $pull: { reactions: { commentId } } })

    return res.json({ success: true })
})

router.post('/reaction-to-comment', async (req, res) => {
    const { userId, commentId, topicId, value } = req.body

    let user = await checkUser(userId)
    if (!user) return res.json({ success: false, msg: 'User could not find' })

    let topic = await checkTopic(topicId)
    if (!topic) return res.json({ success: false, msg: 'Topic could not find' })

    let comment = await checkComment(commentId)
    if (!comment) return res.json({ success: false, msg: 'Comment could not find' })

    let item = comment.reactions.find(item => item.userId == userId)

    let updateComment, updateUser;
    if (item == undefined) {
        updateComment = await CommentModel.findOneAndUpdate({ _id: commentId }, { $push: { reactions: { userId, value } } })
        updateUser = await UserModel.findOneAndUpdate({ _id: userId }, { $push: { reactions: { topicId, commentId, value } } }, { new: true })
    }
    else {
        if (item.value == value) {
            updateComment = await CommentModel.findOneAndUpdate({ _id: commentId }, { $pull: { reactions: { userId } } })
            updateUser = await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { reactions: { topicId } } }, { new: true })
        }
        else {
            updateComment = await CommentModel.findOneAndUpdate({ _id: commentId, 'reactions.userId': userId }, { $set: { 'reactions.$.value': value } })
            updateUser = await UserModel.findOneAndUpdate({ _id: userId, 'reactions.commentId': commentId }, { $set: { 'reactions.$.value': value } }, { new: true })
        }
    }

    return res.json({ success: updateComment && updateUser ? true : false, user: updateUser })
})

router.post('/add-topic-to-bookmarks', async (req, res) => {
    const { userId, topicId } = req.body

    let user = await checkUser(userId)
    if (!user) return res.json({ success: false, msg: 'User could not find' })

    let topic = await checkTopic(topicId)
    if (!topic) return res.json({ success: false, msg: 'Topic could not find' })

    let updateUser;
    if (user.bookmarks.findIndex(item => item.topicId == topicId) == -1) updateUser = await UserModel.findOneAndUpdate({ _id: userId }, { $push: { bookmarks: { topicId } } }, { new: true })
    else updateUser = await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { bookmarks: { topicId } } }, { new: true })

    return res.json({ success: updateUser ? true : false, user: updateUser })
})

router.post('/update-user', async (req, res) => {
    const { _id, username, email } = req.body

    let user = await checkUser(_id)
    if (!user) return res.json({ success: false, msg: 'User could not found' })

    if (user.username != username) {
        let checkUsername = await UserModel.findOne({ username })
        if (checkUsername) return res.json({ success: false, msg: 'The username already been using' })
    }
    if (user.email != email) {
        let checkEmail = await UserModel.findOne({ email })
        if (checkEmail) return res.json({ success: false, msg: 'The email already been using' })
    }

    let update = await UserModel.findOneAndUpdate({ _id }, { $set: { username, email } }, { new: true })
    return res.json({ success: true, user: update })
})

router.get('/search/:string', async (req, res) => {
    let string = req.params.string;

    let aggregate = await TopicModel.aggregate([
        { $match: { title: { $regex: string, "$options": 'i' } } },
        {
            $project: {
                title: 1,
                createdAt: 1,
                creatorUserId: 1
            }
        }
    ])
    let topics = await TopicModel.populate(aggregate, { path: 'creatorUserId', select: { profileImage: 1 } })
    return res.json({ topics })
})

module.exports = router