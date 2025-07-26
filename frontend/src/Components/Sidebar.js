import React from 'react';
import '../Styles/Components.css';
import SidebarButton from './SidebarButton';
import { Link } from 'react-router-dom';

const backend = "http://localhost:5000";
const logoutPath = backend + "/logout";
function Sidebar({ collapsed, username, pfp }) {

    const logout = () => {
        window.location.href = logoutPath;
    }

    return (
        <div className={`Sidebar${collapsed ? 'Collapsed' : ''}`}>
            <SidebarButton Text={"TIME TRACKER"} IconSrc={"/time.png"} route={"/"} />
            <SidebarButton Text={"ROOMS"} IconSrc={"/rooms.png"} route={"/rooms"} />
            <SidebarButton Text={"REPORTS"} IconSrc={"/reports.png"} route={"/reports"} />
            <SidebarButton Text={"PROJECTS"} IconSrc={"/projects.png"} route={"/projects"} />
            <SidebarButton Text={"SETTINGS"} IconSrc={"/settings.png"} route={"/settings"} />
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
                <Link to={"/login"}>
                    <button onClick={logout} style={{ height: "30px", fontSize: collapsed ? '12px' : '15px', fontWeight: "medium", color: "red", marginTop: "-10px" }}>Sign Out</button>
                </Link>
            </div>

        </div>
    );
}

export default Sidebar;