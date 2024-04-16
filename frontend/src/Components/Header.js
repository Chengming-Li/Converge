import React from 'react';
import '../Styles/Components.css';

function Header({ ToggleMenu, MenuHidden }) {
    return (
        <div className='Header' style={{ userSelect: "none" }}>
            {!MenuHidden && <button className="Menu" onClick={ToggleMenu}>
                <img src={'/menu.png'} alt="Icon" />
            </button>}
            <button className="Logo" style={{ left: MenuHidden ? "0px" : "58px" }} onClick={() => { console.log("Logo") }}>
                <img src={'/logo.png'} alt="Logo" />
            </button>
        </div>
    );
}

export default Header;