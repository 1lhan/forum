import { useSelector } from "react-redux"
import { NavLink, useLocation } from "react-router-dom"

export default function CategoryNav() {
    const { categories } = useSelector(state => state.slice)
    const location = useLocation()

    return (
        <nav className="category-nav">
            {categories.map((item, index) =>
                <NavLink style={{ background: location.pathname.split('/')[2] == item[0] ? '#e5e7eb' : '' }} className="category-nav-item" key={index} to={'/category/' + item[0]}>
                    <i className={item[1]} />
                    <span>
                        {item[0].split('-').map(item => item = item.slice(0, 1).toUpperCase() + item.slice(1)).join(' ')}
                    </span>
                </NavLink>
            )}
        </nav>
    )
}