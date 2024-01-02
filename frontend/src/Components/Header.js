import React from 'react';
import '../Styles/Components.css';

function Header({ ToggleMenu }) {
    return (
        <div className='Header'>
            <button className="Menu" onClick={ToggleMenu}>
                <img src={'/menu.png'} alt="Icon" />
            </button>
            <button className="Logo" onClick={() => { console.log("Logo") }}>
                <img src={'/logo.png'} alt="Logo" />
            </button>
        </div>
    );
}

export default Header;