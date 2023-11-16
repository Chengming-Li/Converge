import React from 'react';
import '../App.css';
import SidebarButton from './SidebarButton';

function Sidebar({ collapsed }) {
    return (
        <div className={`Sidebar${collapsed ? 'Collapsed' : ''}`}>
            <SidebarButton Text={"TIME TRACKER"} IconSrc = {"/Cheese.png"} Logic = {() => {console.log("Cheese")}} />
            <SidebarButton Text={"CALENDAR"} IconSrc = {"/Cheese.png"} Logic = {() => {console.log("Cheese")}} />
            <SidebarButton Text={"ROOMS"} IconSrc = {"/Cheese.png"} Logic = {() => {console.log("Cheese")}} />
            <p>ANALYZE</p>
            <SidebarButton Text={"DASHBOARD"} IconSrc = {"/Cheese.png"} Logic = {() => {console.log("Cheese")}} />
            <SidebarButton Text={"REPORTS"} IconSrc = {"/Cheese.png"} Logic = {() => {console.log("Cheese")}} />
            <p>MANAGE</p>
            <SidebarButton Text={"PROJECTS"} IconSrc = {"/Cheese.png"} Logic = {() => {console.log("Cheese")}} />
            <SidebarButton Text={"SETTINGS"} IconSrc = {"/Cheese.png"} Logic = {() => {console.log("Cheese")}} />
        </div>
    );
}

export default Sidebar;