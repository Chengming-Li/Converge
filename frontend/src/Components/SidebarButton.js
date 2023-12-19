import '../Styles/Components.css';
import React from 'react';

function SidebarButton({ Text, IconSrc, Logic }) {
    return (
        <button onClick={Logic}>
            <img src={IconSrc} alt="Icon"/>
            <span>{Text}</span>
        </button>
    );
}

export default SidebarButton;