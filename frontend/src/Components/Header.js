import React from 'react';
import '../Styles/Components.css';

function Header({ ToggleMenu }) {
    return (
        <div className='Header'>
            <button className="Menu" onClick={ToggleMenu}>
                <img src={'/menu.png'} alt="Icon"/>
            </button>
            <button className="Logo" onClick={() => {console.log("Logo")}}>
                <img src={'/logo.png'} alt="Logo" />
            </button>
            <button className="Profile" onClick={() => {console.log("Profile")}}>
                <img src={'/pfp.png'} alt="pfp" />
            </button>
        </div>
    );
}

export default Header;