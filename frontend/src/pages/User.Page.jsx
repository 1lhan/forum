import { useSignal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom"
import TopicDiv from "../components/TopicDiv"
import { dateConverter, dynamicTitle, usePostRequest } from "../utils"

export default function UserPage({ user }) {
    dynamicTitle(useLocation().pathname)
    const { username } = useParams()
    const selectedNavItem = useSignal('my-topics')
    const updateUserFormMsg = useSignal('')
    const changePasswordFormMsg = useSignal('')
    const navigate = useNavigate()

    const getDetailedUserData = async () => {
        let detailedUserData = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-detailed-user-data/' + username).then(res => res.json())
        return detailedUserData.success ? detailedUserData.user : false
    }

    const { data: detailedUser } = useQuery({
        queryFn: async () => await getDetailedUserData(),
        queryKey: ['detailedUser'],
        staleTime: Infinity,
        gcTime: 0
    })

    const updateUser = async (e) => {
        e.preventDefault()

        let { username, email } = e.target

        if (user.value.username == username.value && user.value.email == email.value) return false

        let requestBody = { _id: user.value._id, username: username.value, email: email.value }
        let update = await usePostRequest('/update-user', requestBody)

        if (update.success) { navigate('/user/' + username.value); user.value = update.user }
        else updateUserFormMsg.value = update.msg
    }

    const changePassword = async (e) => {
        e.preventDefault()

        let { password, newPassword, newPasswordAgain } = e.target

        if (password.value.length < 8 || newPassword.value.length < 8 || newPasswordAgain.value.length < 8) { changePasswordFormMsg.value = 'Password length can be at least 8'; return false }
        else if (newPassword.value != newPasswordAgain.value) { changePasswordFormMsg.value = 'New passwords are not same'; return false }

        let requestBody = { userId: user.value._id, password: password.value, newPassword: newPassword.value }
        let update = await usePostRequest('/change-password', requestBody)

        if (update.success) changePasswordFormMsg.value = 'Password has been changed'
        else changePasswordFormMsg.value = update.msg || 'Password could not changed'

    }

    const Comment = ({ comment }) => {
        return (
            <div className="comment-div">
                <div className="comment-div-top">
                    <NavLink className="title" to={'/topic/' + comment.topicId.title + '_t' + comment.topicId.createdAt}>{comment.topicId.title}</NavLink>
                    <span className="date">{new Date(comment.updatedAt).getTime() == 0 ? dateConverter(comment.createdAt) : dateConverter(comment.updatedAt) + ' (updated)'}</span>
                </div>
                <hr />
                <div className="comment-div-bottom">
                    <i className="fa-regular fa-message" />
                    <span className="comment">{comment.comment}</span>
                </div>
            </div>
        )
    }

    const Reactions = ({ item }) => {
        return (
            <div className="reaction-div">
                <div className="reaction-div-top">
                    <NavLink className="title" to={'/topic/' + item.commentId.topicId.title + '_t' + item.commentId.topicId.createdAt}>{item.commentId.topicId.title}</NavLink>
                    <span className="date">{new Date(item.commentId.updatedAt).getTime() == 0 ? dateConverter(item.commentId.createdAt) : dateConverter(item.commentId.updatedAt) + ' (updated)'}</span>
                </div>
                <hr />
                <div className="reaction-div-bottom">
                    <span className="reaction-value">{item.value == 'like' ? <i className="fa-regular fa-thumbs-up" /> : <i className="fa-regular fa-thumbs-down" />}</span>
                    <span className="reaction-comment">{item.commentId.comment}</span>
                </div>
            </div>
        )
    }

    const SettingsDiv = () => {
        return (
            <div className="settings-div">
                <form className="form" onSubmit={updateUser}>
                    <div className="form-header">
                        <h3>User Informations</h3>
                    </div>
                    <div className="form-body">
                        <div className="form-body-item">
                            <span>Username</span>
                            <input defaultValue={user.value.username} type="text" name="username" />
                        </div>
                        <div className="form-body-item">
                            <span>Email</span>
                            <input defaultValue={user.value.email} type="email" name="email" />
                        </div>
                    </div>
                    <span className="form-msg-span">{updateUserFormMsg}</span>
                    <button className="submit-btn">Update User</button>
                </form>
                <form className="form" onSubmit={changePassword}>
                    <div className="form-header">
                        <h3>Change Password</h3>
                    </div>
                    <div className="form-body">
                        <div className="form-body-item">
                            <span>Current Password</span>
                            <input type="password" name="password" />
                        </div>
                        <div className="form-body-item">
                            <span>New Password</span>
                            <input type="password" name="newPassword" />
                        </div>
                        <div className="form-body-item">
                            <span>New Password (Again)</span>
                            <input type="password" name="newPasswordAgain" />
                        </div>
                    </div>
                    <span className="form-msg-span">{changePasswordFormMsg}</span>
                    <button className="submit-btn">Change Password</button>
                </form>
            </div>
        )
    }

    return (
        <div className="user-page container">
            {detailedUser == false && <span className="page-msg-span">User could not find</span>}
            {detailedUser?.username &&
                <>
                    <div className="user-page-left-side">
                        <div className="left-side-top">
                            <span className="image" />
                            <span className="username">{username}</span>
                            <span className="membership-date">
                                <span>Membership Date</span>
                                <span>{detailedUser.membershipDate.slice(0, 10).split('-').reverse().join('.')}</span>
                            </span>
                        </div>
                        <hr />
                        <div className="left-side-bottom">
                            <div className="left-side-bottom-item">
                                <span>My Topics</span>
                                <span>{detailedUser.myTopics.length}</span>
                            </div>
                            <div className="left-side-bottom-item">
                                <span>Comments</span>
                                <span>{detailedUser.comments.length}</span>
                            </div>
                            <div className="left-side-bottom-item">
                                <span>Reactions</span>
                                <span>{detailedUser.reactions.length}</span>
                            </div>
                            <div className="left-side-bottom-item">
                                <span>Bookmarks</span>
                                <span>{detailedUser.bookmarks.length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="user-page-right-side">
                        <nav>
                            <span className="nav-item" style={{ borderBottom: selectedNavItem == "my-topics" ? ' 2px solid #fdba74' : '' }} onClick={() => selectedNavItem.value = "my-topics"}>My Topics</span>
                            <span className="nav-item" style={{ borderBottom: selectedNavItem == "comments" ? ' 2px solid #fdba74' : '' }} onClick={() => selectedNavItem.value = "comments"}>Comments</span>
                            <span className="nav-item" style={{ borderBottom: selectedNavItem == "reactions" ? ' 2px solid #fdba74' : '' }} onClick={() => selectedNavItem.value = "reactions"}>Reactions</span>
                            <span className="nav-item" style={{ borderBottom: selectedNavItem == "bookmarks" ? ' 2px solid #fdba74' : '' }} onClick={() => selectedNavItem.value = "bookmarks"}>Bookmarks</span>
                            {user.value.username == username &&
                                <button className="btn settings-btn" onClick={() => selectedNavItem.value = "settings"}>
                                    <i className="fa-solid fa-gear" />
                                    <span>Settings</span>
                                </button>
                            }
                        </nav>
                        <hr />
                        <section>
                            {selectedNavItem == "my-topics" && detailedUser?.myTopics.map((topic, index) => <TopicDiv key={index} topic={topic.topicId} />)}
                            {selectedNavItem == "comments" && detailedUser?.comments.map((comment, index) => <Comment key={index} comment={comment.commentId} />)}
                            {selectedNavItem == "reactions" && detailedUser?.reactions.map((item, index) => <Reactions key={index} item={item} />)}
                            {selectedNavItem == "bookmarks" && detailedUser?.bookmarks.map((topic, index) => <TopicDiv key={index} topic={topic.topicId} />)}
                            {selectedNavItem == "settings" && <SettingsDiv />}
                        </section>
                    </div>
                </>}
        </div>
    )
}