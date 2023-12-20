import { useSignal } from "@preact/signals-react"
import { dynamicTitle, usePostRequest } from "../utils"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

export default function Login({ user }) {
    dynamicTitle(useLocation().pathname)
    const formMsg = useSignal('')
    const navigate = useNavigate()

    const login = async (e) => {
        e.preventDefault()

        let { username, password } = e.target

        if (username.value.length < 3) { formMsg.value = 'Username length should be between 3-15'; return false }
        else if (password.value.length < 8) { formMsg.value = 'Password length should be more than 8'; return false }

        let _login = await usePostRequest('/login', { username: username.value, password: password.value })

        if (_login.success) {
            let date = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)).toUTCString()
            let token = `token=${_login.token}; expires=${date};  path=/;`
            document.cookie = token

            user.value = _login.user
            navigate('/')
        }
        else formMsg.value = _login.msg || 'Login failed'
    }

    return (
        <div className="login-page container">
            <form onSubmit={login} className="form">
                <div className="form-header">
                    <h2 className="center">Login</h2>
                </div>
                <div className="form-body">
                    <div className="form-body-item">
                        <span>Username</span>
                        <input name="username" type="text" />
                    </div>
                    <div className="form-body-item">
                        <span>Password</span>
                        <input name="password" type="password" />
                    </div>
                </div>
                <span className="form-msg-span">{formMsg}</span>
                <button className="submit-btn" type="submit">Login</button>
                <NavLink className="to-register-page-btn" to='/register'>Create Account</NavLink>
            </form>
        </div>
    )
}