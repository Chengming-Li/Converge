import React from 'react';
import '../App.css';

function Header() {
    return (
        <div className='Header'>
            <button className="Menu" onClick={() => {console.log("Menu")}}>
                <img src={'/menu.png'} alt="Icon"/>
            </button>
            <img className="Logo" src={'/logo.png'} alt="Logo" />
            <button className="Profile" onClick={() => {console.log("Profile")}}>
                <img src={'/pfp.png'} alt="pfp" />
            </button>
        </div>
    );
}

export default Header;