import { NavLink } from "react-router-dom";
import { dateConverter } from "../utils";

export default function TopicDiv({ topic }) {
    return (
        <div className="topic-div">
            <span className="image" />
            <div className="topic-div-right-side">
                <div className="topic-div-right-side-top">
                    <NavLink className="title" to={'/topic/' + topic.title + '_t' + topic.createdAt}>{topic.title}</NavLink>
                    <span className="date">{topic.updatedAt != null ? '' : dateConverter(topic.createdAt)}</span>
                </div>
                <div className="topic-div-right-side-bottom">
                    <NavLink className="username" to={'/user/' + topic.creatorUserId.username}>{topic.creatorUserId.username}</NavLink>
                    <span className="dot" />
                    <span className="category">{topic.category.split('-').map(item => item = item.slice(0, 1).toUpperCase() + item.slice(1)).join(' ')}</span>
                    <span className="dot" />
                    <span className="comments-count">
                        <i className="fa-regular fa-message" />
                        {topic.comments.length}
                    </span>
                </div>
            </div>
        </div>
    )
} 