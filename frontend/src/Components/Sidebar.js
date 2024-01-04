import React from 'react';
import '../Styles/Components.css';
import SidebarButton from './SidebarButton';

function Sidebar({ collapsed, username }) {
    return (
        <div className={`Sidebar${collapsed ? 'Collapsed' : ''}`}>
            <SidebarButton Text={"TIME TRACKER"} IconSrc={"/Cheese.png"} route={"/"} />
            <SidebarButton Text={"ROOMS"} IconSrc={"/Cheese.png"} route={"/rooms"} />
            <SidebarButton Text={"REPORTS"} IconSrc={"/Cheese.png"} route={"/"} />
            <SidebarButton Text={"PROJECTS"} IconSrc={"/Cheese.png"} route={"/"} />
            <SidebarButton Text={"SETTINGS"} IconSrc={"/Cheese.png"} route={"/"} />
            <div className="Profile">
                <button className="Profile" onClick={() => { console.log("Profile: " + username) }}>
                    <img src={'/pfp.png'} alt="pfp" style={{ left: `${(collapsed ? "50%" : "7px")}` }} />
                    <span>{username}</span>
                </button>
            </div>

        </div>
    );
}

export default Sidebar;