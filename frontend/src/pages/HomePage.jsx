import { useSignal } from "@preact/signals-react"
import { useSelector } from "react-redux"
import { dynamicTitle, usePostRequest } from "../utils"
import CategoryNav from "../components/CategoryNav"
import CustomSelect from "../components/CustomSelect"
import TopicDiv from "../components/TopicDiv"
import { NavLink, useLoaderData, useLocation } from "react-router-dom"

export default function HomePage({ user }) {
    dynamicTitle(useLocation().pathname)
    const { categories } = useSelector(state => state.slice)
    const topics = useLoaderData()
    const selectedTopicsType = useSignal('newest-topics')

    const createTopicFormMsg = useSignal('')
    const createTopicDivDp = useSignal(false)

    const createTopic = async (e) => {
        e.preventDefault()

        let { title, category, content } = e.target

        if (title.value.length < 8 || title.value.length > 40) { createTopicFormMsg.value = 'Topic title length should be between 8-40'; return false }
        else if (category.value == '-1') { createTopicFormMsg.value = 'You need to select category'; return false }
        else if (content.value.length < 10 || content.value.length > 200) { createTopicFormMsg.value = 'Content length should be between 10-200'; return false }

        let requestBody = { creatorUserId: user.value._id, title: title.value, category: category.value, content: content.value, createdAt: new Date() }

        let create = await usePostRequest('/create-topic', { requestBody })
        if (create.success) {
            e.target.reset()
            createTopicDivDp.value = false
            window.location.reload()
        }
    }

    const CreateTopicDiv = () => {
        return (
            <div className="create-topic-div">
                <form onSubmit={createTopic} className="form">
                    <div className="form-header">
                        <h2>Create Topic</h2>
                        <i onClick={() => createTopicDivDp.value = false} className="fa-solid fa-xmark" />
                    </div>
                    <div className="form-body">
                        <div className="form-body-item">
                            <span>Topic Title</span>
                            <input name="title" type="text" />
                        </div>
                        <div className="form-body-item">
                            <span>Category</span>
                            <select name="category">
                                <option value={-1}>Category</option>
                                {categories.map((item, index) =>
                                    <option key={index} value={item[0]}>
                                        {item[0].split('-').map(item => item = item.slice(0, 1).toUpperCase() + item.slice(1)).join(' ')}
                                    </option>
                                )}

                            </select>
                        </div>
                        <div className="form-body-item">
                            <span>Content</span>
                            <textarea name="content" />
                        </div>
                    </div>
                    <span className="form-msg-span">{createTopicFormMsg}</span>
                    <button className="submit-btn" type="submit">Create Topic</button>
                </form>
            </div>
        )
    }

    return (
        <div className="home-page container">
            <input id="category-nav-cb" type="checkbox"/>
            <div className="category-nav-wrapper">
                <CategoryNav />
                <hr />
                <button onClick={() => createTopicDivDp.value = true} className="btn create-topic-btn">
                    <i className="fa-solid fa-plus" />
                    <span>Create Topic</span>
                </button>
            </div>
            <section>
                <div className="top-div">
                    <label className="category-nav-hamburger-btn" htmlFor="category-nav-cb">
                        <i className="fa-solid fa-bars"/>
                    </label>
                    <CustomSelect id={"topic-type"} state={selectedTopicsType} options={["newest-topics", "popular-topics"]} />
                </div>
                <div className="topics">
                    {selectedTopicsType.value == "newest-topics" ?
                        <>{topics.newestTopics.map((topic, index) => <TopicDiv topic={topic} key={index} />)}</>
                        :
                        <>{topics.popularTopics.map((topic, index) => <TopicDiv topic={topic} key={index} />)}</>
                    }
                </div>
                {selectedTopicsType.value == 'newest-topics' && topics?.length > 10 && <NavLink className="btn" to="/newest-topics">Load More</NavLink>}
            </section>
            {createTopicDivDp.value && <CreateTopicDiv />}
        </div>
    )
}