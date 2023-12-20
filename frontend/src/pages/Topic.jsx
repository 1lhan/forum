import { useQuery } from "@tanstack/react-query"
import { NavLink, useLocation, useParams } from "react-router-dom"
import { dateConverter, dynamicTitle, usePostRequest } from "../utils"
import { useRef } from "react"
import { useSignal } from "@preact/signals-react"

export default function Topic({ user }) {
    dynamicTitle(useLocation().pathname)
    const { title } = useParams()
    const addCommentContent = useRef()
    const replyTo = useSignal(false)

    const getTopic = async () => {
        let get = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-topic/' + title).then(res => res.json())
        return get.success ? get.topic : []
    }

    const { data: topic, refetch } = useQuery({
        queryFn: () => getTopic(),
        queryKey: ['topic', title],
        staleTime: Infinity,
        gcTime: 0
    })

    const addComment = async () => {
        const addCommentBtn = document.getElementById('add-comment-btn')
        addCommentBtn.disabled = true

        if (addCommentContent.current.value.length < 2) {
            addCommentBtn.disabled = false
            return false
        }

        let requestBody = { userId: user.value._id, createdAt: new Date(), comment: addCommentContent.current.value, replyTo: replyTo.value, topicId: topic._id }

        let add = await usePostRequest('/add-comment', requestBody)
        if (add.success) window.location.reload()

    }

    const deleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete the comment')) return false

        let requestBody = { userId: user.value._id, commentId, topicId: topic._id }

        let _delete = await usePostRequest('/delete-comment', requestBody)
        if (_delete.success) window.location.reload()
    }

    const reactionToComment = async (commentId, value) => {
        let requestBody = { userId: user.value._id, commentId, topicId: topic._id, value }
        let react = await usePostRequest('/reaction-to-comment', requestBody)

        if (react.success) {
            user.value = react.user
            refetch()
        }
    }

    const addTopicToBookmarks = async () => {
        let add = await usePostRequest('/add-topic-to-bookmarks', { userId: user.value._id, topicId: topic._id })
        if (add.success) user.value = add.user
    }

    const CommentDiv = ({ comment }) => {
        return (
            <div className="comment">

                <div className="left-side">
                    <span className="image" />
                    <NavLink className="username" to={"/user/" + comment.commentId.userId.username}>{comment.commentId.userId.username}</NavLink>
                </div>

                <div className="right-side">
                    <span className="date">{comment.commentId.updatedAt != null ? dateConverter(comment.commentId.updatedAt) + '(updated)' : dateConverter(comment.commentId.createdAt)}</span>

                    {comment.commentId.replyTo &&
                        <div className="replied-comment-div">
                            <span className="user-of-replied-comment">
                                <i className="fa-solid fa-reply" />
                                {topic.comments.findIndex(item => item.commentId._id == comment.commentId.replyTo) != -1 &&
                                    topic.comments.find(item => item.commentId._id == comment.commentId.replyTo)?.commentId.userId.username}
                            </span>
                            <hr className="replied-comment-hr" />
                            <span className="replied-comment">
                                {topic.comments.findIndex(item => item.commentId._id == comment.commentId.replyTo) == -1 ? 'This comment deleted' :
                                    topic.comments.find(item => item.commentId._id == comment.commentId.replyTo)?.commentId.comment}
                            </span>
                        </div>
                    }

                    <textarea className="comment-textarea" disabled={true} defaultValue={comment.commentId.comment} />

                    <div className="comment-buttons">
                        <button
                            style={{ color: comment.commentId.reactions.findIndex(item => item.userId == user.value._id && item.value == 'like') != -1 ? '#ea580c' : '' }}
                            onClick={() => reactionToComment(comment.commentId._id, 'like')}
                            disabled={!user.value || user.value.username == comment.commentId.userId.username}>
                            <i className="fa-regular fa-thumbs-up" />
                            {comment.commentId.reactions.filter(item => item.value == 'like').length}
                        </button>
                        <button
                            style={{ color: comment.commentId.reactions.findIndex(item => item.userId == user.value._id && item.value == 'dislike') != -1 ? '#ea580c' : '' }}
                            onClick={() => reactionToComment(comment.commentId._id, 'dislike')}
                            disabled={!user.value || user.value.username == comment.commentId.userId.username}>
                            <i className="fa-regular fa-thumbs-down" />
                            {comment.commentId.reactions.filter(item => item.value == 'dislike').length}
                        </button>
                        {user.value && user.value.username != comment.commentId.userId.username &&
                            <button onClick={() => replyTo.value = replyTo.value == false ? comment.commentId : false} style={{ color: replyTo.value._id == comment.commentId._id ? '#ea580c' : '' }}>
                                <i className="fa-solid fa-reply" />
                            </button>
                        }
                        {user.value && user.value.username == comment.commentId.userId.username &&
                            <button className="delete-comment-btn" onClick={() => deleteComment(comment.commentId._id)}>
                                <i className="fa-regular fa-trash-can" />
                            </button>
                        }
                    </div>
                </div>

            </div>
        )
    }

    const AddCommentDiv = () => {
        return (
            <div className="add-comment-div">
                {replyTo.value && <div className="add-comment-div-replied-div">
                    <i className="fa-solid fa-reply" />
                    <textarea disabled={true} defaultValue={replyTo.value.comment} className="textarea" />
                </div>}
                <h4>Add Comment</h4>
                <div className="add-comment-div-bottom">
                    <textarea ref={addCommentContent} className="add-comment-div-textarea" />
                    <button id="add-comment-btn" onClick={() => addComment()} className="btn"><i className="fa-solid fa-share" /></button>
                </div>
            </div >
        )
    }

    return (
        <div className="topic-page container">
            {topic &&
                <>
                    <div className="topic-page-topic-div">
                        <div className="left-side">
                            <span className="image" />
                            <NavLink className="username" to={"/user/" + topic.creatorUserId.username}>{topic.creatorUserId.username}</NavLink>
                        </div>
                        <div className="right-side">
                            <div className="right-side-top">
                                <h3 className="title">{topic.title}</h3>
                                <span className="date">{topic.updatedAt != null ? dateConverter(topic.updatedAt) + '(updated)' : dateConverter(topic.createdAt)}</span>
                            </div>
                            <textarea disabled className="content" defaultValue={topic.content} />
                            <div className="topic-buttons">
                                {user.value && topic.creatorUserId._id != user.value._id &&
                                    <button style={{ color: user.value.bookmarks.findIndex(item => item.topicId == topic._id) != -1 ? '#ea580c' : '' }} onClick={() => addTopicToBookmarks()}>
                                        <i className="fa-regular fa-bookmark" />
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                    <h3 className="comments-title">Comments</h3>
                    <div className="comments">
                        {topic.comments.map((comment, index) => <CommentDiv comment={comment} key={index} />)}
                    </div>
                    {user.value && <AddCommentDiv />}
                </>
            }
        </div>
    )
}