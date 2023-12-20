import { useLocation, useParams, useSearchParams } from "react-router-dom"
import CategoryNav from "../components/CategoryNav"
import { useQuery } from "@tanstack/react-query"
import TopicDiv from "../components/TopicDiv"
import { useSignal } from "@preact/signals-react"
import { useSelector } from "react-redux"
import { dynamicTitle } from "../utils"

export default function Category() {
    dynamicTitle(useLocation().pathname)
    const { categoryName } = useParams()
    const { categories } = useSelector(state => state.slice)
    let [searchParams, setSearchParams] = useSearchParams()
    const topicCount = useSignal(1)

    const getTopicCount = async () => {
        let getCount = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-topic-count/' + categoryName).then(res => res.json())
        topicCount.value = getCount.success ? getCount.count : 1
    }
    getTopicCount()

    const changePage = (pageNumber) => {
        if (searchParams.has('page')) searchParams.delete('page')
        searchParams.append('page', pageNumber);
        setSearchParams(searchParams)
        refetch()
    }

    const getTopics = async () => {
        let get = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/get-topics/${categoryName}/${searchParams.get('page') || 1}`).then(res => res.json())
        return get.topics || []
    }

    const { data: topics, refetch } = useQuery({
        queryFn: () => getTopics(),
        queryKey: ['topics', { categoryName }],
        staleTime: Infinity,
        gcTime: 0
    })

    return (
        <div className="category-page container">
            {categories.findIndex(item => item[0] == categoryName) != -1 ?
                <>
                    <input id="category-nav-cb" type="checkbox" />
                    <div className="category-nav-wrapper">
                        <CategoryNav />
                    </div>
                    <section>
                        <label className="category-nav-hamburger-btn" htmlFor="category-nav-cb">
                            <i className="fa-solid fa-bars" />
                        </label>
                        <div className="topics">
                            {topics?.map((topic, index) =>
                                <TopicDiv topic={topic} key={index} />
                            )}
                        </div>
                        <div className="page-numbers">
                            {topics?.length > 0 && [...new Array(Math.ceil(topicCount / 10))].map((item, index) =>
                                <button className="btn" onClick={() => changePage(index + 1)} key={index}>{index + 1}</button>
                            )}
                        </div>
                    </section>
                </>
                :
                <span className="page-msg-span">Category is not available</span>
            }
        </div>
    )
}