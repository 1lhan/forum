export const usePostRequest = async (url, requestBody) => {
    let request = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    }).then(res => res.json())

    return request
}

export function dynamicTitle(title) {
    title = title.slice(1).split(' ')
    for (let i in title) title[i] = title[i].slice(0, 1).toUpperCase() + title[i].slice(1)
    title = title.join(' ')

    if (title.includes('%20')) title = title.replaceAll('%20', ' ')
    if (title.includes('Topic')) title = title.slice(0, title.indexOf('_t'))

    document.title = title
}

export const dateConverter = (__date) => {
    let date = new Date(__date)

    let _date;
    if (new Date().getDate() != date.getDate() || ((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) > 1) {
        _date =
            (date.getDate().toString().length == 1 ? '0' : '') + date.getDate() + '.' +
            ((date.getMonth() + 1).toString().length == 1 ? '0' : '') + (date.getMonth() + 1) + '.' +
            date.getFullYear()
    }
    else {
        _date =
            (date.getHours().toString().length == 1 ? '0' : '') + date.getHours() + '.' +
            (date.getMinutes().toString().length == 1 ? '0' : '') + date.getMinutes()
    }

    return _date
}