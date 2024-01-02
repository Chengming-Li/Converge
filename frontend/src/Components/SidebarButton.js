import '../Styles/Components.css';
import React from 'react';
import { Link } from 'react-router-dom';

function SidebarButton({ Text, IconSrc, route }) {
    return (
        <Link to={route}>
            <button>
                <img src={IconSrc} alt="Icon" />
                <span>{Text}</span>
            </button>
        </Link>
    );
}

export default SidebarButton;