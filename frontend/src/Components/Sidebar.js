import React from 'react';
import '../Styles/Components.css';
import SidebarButton from './SidebarButton';
import { Link } from 'react-router-dom';

function Sidebar({ collapsed, username, pfp }) {
    return (
        <div className={`Sidebar${collapsed ? 'Collapsed' : ''}`}>
            <SidebarButton Text={"TIME TRACKER"} IconSrc={"/Cheese.png"} route={"/"} />
            <SidebarButton Text={"ROOMS"} IconSrc={"/Cheese.png"} route={"/rooms"} />
            <SidebarButton Text={"REPORTS"} IconSrc={"/Cheese.png"} route={"/"} />
            <SidebarButton Text={"PROJECTS"} IconSrc={"/Cheese.png"} route={"/projects"} />
            <SidebarButton Text={"SETTINGS"} IconSrc={"/Cheese.png"} route={"/settings"} />
            <div className="Profile">
                <Link to={"/settings"}>
                    <button className="Profile">
                        <img src={pfp ? pfp : "/pfp.png"} alt="pfp" style={{
                            left: `${(collapsed ? "50%" : "10px")}`,
                            borderRadius: "50%",
                        }} />
                        <span>{username}</span>
                    </button>
                </Link>
            </div>

        </div>
    );
}

export default Sidebar;