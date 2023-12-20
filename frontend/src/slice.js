import { createSlice } from "@reduxjs/toolkit"

const categories = [
    ['gaming', "fa-solid fa-gamepad"], ['sports', "fa-solid fa-baseball"], ['crypto', "fa-brands fa-btc"], ['technological-products', "fa-solid fa-microchip"],
    ['vehicles', "fa-solid fa-car-side"], ['movies', "fa-solid fa-film"], ['food-and-drink', "fa-solid fa-utensils"], ['travel', "fa-solid fa-plane"]
]

export const slice = createSlice({
    name: 'slice',
    initialState: {
        categories
    }
})

export const { } = slice.actions
export default slice.reducer