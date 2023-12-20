import { useSignal } from "@preact/signals-react"
import { useLocation } from "react-router-dom"
import { dynamicTitle, usePostRequest } from "../utils"

export default function Register() {
    dynamicTitle(useLocation().pathname)
    const formMsg = useSignal('')

    const register = async (e) => {
        e.preventDefault()

        let { username, email, password, passwordAgain } = e.target

        if (username.value.length < 3) formMsg.value = 'Username length should be more than 3'
        else if (password.value.length < 8) formMsg.value = 'Password length should be more than 8'
        else if (password.value != passwordAgain.value) formMsg.value = 'Passwords are not same'
        else {
            let formBody = { username: username.value, email: email.value, password: password.value }
            let _register = await usePostRequest('/register', formBody)

            if (_register.success) {
                e.target.reset()
                formMsg.value = 'Account created'
            }
            else formMsg.value = _register.msg || 'Account could not created'
        }
    }

    return (
        <div className="register-page container">
            <div className="login-page container">
                <form onSubmit={register} className="form">
                    <div className="form-header">
                        <h2 className="center">Register</h2>
                    </div>
                    <div className="form-body">
                        <div className="form-body-item">
                            <span>Username</span>
                            <input name="username" type="text" />
                        </div>
                        <div className="form-body-item">
                            <span>Email</span>
                            <input name="email" type="email" />
                        </div>
                        <div className="form-body-item">
                            <span>Password</span>
                            <input name="password" type="password" />
                        </div>
                        <div className="form-body-item">
                            <span>Password (Again)</span>
                            <input name="passwordAgain" type="password" />
                        </div>
                    </div>
                    <span className="form-msg-span">{formMsg}</span>
                    <button className="submit-btn" type="submit">Register</button>
                </form>
            </div>
        </div>
    )
}