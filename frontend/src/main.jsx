import React from 'react'
import ReactDOM from 'react-dom/client'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { signal } from '@preact/signals-react'
import { configureStore } from '@reduxjs/toolkit'
import slice from './slice'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'

import './styles/style.css'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import Category from './pages/Category'
import UserPage from './pages/User.Page'
import Topic from './pages/Topic'

const autoLogin = async () => {
    let _autoLogin = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/auto-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: document.cookie })
    }).then(res => res.json())

    return _autoLogin.success ? _autoLogin.user : false
}
const user = signal(await autoLogin())

const getTopics = async () => {
    let get = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-topic-for-home-page').then(res => res.json())
    return get.success ? get : []
}

const router = createBrowserRouter([
    {
        element: <><Header user={user} /><Outlet /></>,
        children: [
            {
                path: '/',
                element: <HomePage user={user} />,
                loader: getTopics
            },
            {
                path: '/login',
                element: <Login user={user} />
            },
            {
                path: '/register',
                element: <Register />
            },
            {
                path: '/category/:categoryName',
                element: <Category />
            },
            {
                path: '/user/:username',
                element: <UserPage user={user} />
            },
            {
                path: '/topic/:title',
                element: <Topic user={user} />
            }
        ]
    }
])

const store = configureStore({ reducer: { slice } })

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false
        }
    }
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </Provider>
)
