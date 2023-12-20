import { useSignal } from "@preact/signals-react";
import { useDeferredValue, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Header({ user }) {
    const [queryString, setQueryString] = useState('')
    const deferredQueryString = useDeferredValue(queryString)
    const queryResult = useSignal([])
    const navigate = useNavigate()

    const logout = () => {
        if (confirm('Are you sure you want log out')) {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            user.value = false
            navigate('/')
        }
    }

    const search = async () => {
        let _search = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/search/' + deferredQueryString).then(res => res.json())
        queryResult.value = _search.topics
    }
    useEffect(() => { if (deferredQueryString.length > 0) search() }, [deferredQueryString])

    return (
        <header>
            <div className="container">
                <NavLink className="home-page-btn" to='/'>Forum</NavLink>
                <div className="search-box">
                    <i className="fa-solid fa-magnifying-glass" />
                    <input onChange={(e) => setQueryString(e.target.value)} type="text" />
                    <div style={{ display: deferredQueryString.length == 0 ? 'none' : '' }} className="search-box-result">
                        {queryResult.value.map((item, index) =>
                            <div key={index} className="search-result-topic">
                                <span className="image" />
                                <NavLink onClick={() => { setQueryString(''); }} className="title" to={'/topic/' + item.title + '_t' + item.createdAt}>{item.title}</NavLink>
                            </div>
                        )}
                    </div>
                </div>
                {user.value ?
                    <div className="user-btn">
                        <label htmlFor="user-btn-cb">
                            <span className="image" />
                            <span>{user.value.username}</span>
                        </label>
                        <input id="user-btn-cb" type="checkbox" />
                        <div className="user-btn-dropdown">
                            <NavLink className="my-profile-btn" to={'/user/' + user.value.username}>
                                <i className="fa-regular fa-user" />
                                <span>My Profile</span>
                            </NavLink>
                            <button onClick={() => logout()} className="logout-btn">
                                <i className="fa-solid fa-arrow-right-from-bracket" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                    :
                    <NavLink className="login-btn" to='/login'>
                        <span>Login</span>
                    </NavLink>
                }
            </div>
        </header>
    )
}