export default function CustomSelect({ id, state, options }) {
    return (
        <div className="custom-select">
            <label htmlFor={id} className="current-value">
                <span>{state.value.split('-').map(item => item = item.slice(0, 1).toUpperCase() + item.slice(1)).join(' ')}</span>
                <i className="fa-solid fa-caret-down" />
            </label>
            <input id={id} type="checkbox" />
            <div className="values">
                {options.map((item, index) =>
                    <label
                        htmlFor={id}
                        onClick={() => state.value = item} key={index} className="value-label">
                        {item.split('-').map(item => item = item.slice(0, 1).toUpperCase() + item.slice(1)).join(' ')}
                    </label>
                )}
            </div>
        </div>
    )
}