import React, { useState } from 'react';
import '../Styles/Components.css';

function UserSection({ username, pfp, totalTime, intervals, resumeInterval }) {
    const [collapsed, setCollapsed] = useState(false);
    
    return (
        <div className="IntervalSection" style={{
            height: "61px", 
            borderTopLeftRadius: "15px", 
            borderTopRightRadius: "15px", 
            borderBottomRightRadius: "15px", 
            borderBottomLeftRadius: "15px",
        }}>
            <div id='Head' style={{
                borderTopLeftRadius: "15px", 
                borderTopRightRadius: `${collapsed ? 15 : 0}px`, 
                borderBottomRightRadius: `${collapsed ? 15 : 0}px`, 
                borderBottomLeftRadius: `${collapsed ? 15 : 0}px`, 
                height: "100%",
                backgroundColor: "#34464f"
            }}>
                <span id='username'>{username}</span>
                <img id="pfp" src={pfp} alt="pfp" />
                <span id='time' style={{top:"19px"}}>{totalTime}</span>
                <button id="collapse" style={{height: "61px", backgroundColor: "#34464f"}} onClick={() => {setCollapsed(!collapsed)}}>
                    <img src={'/Cheese.png'} alt="collapse" />
                </button>
            </div>
        </div>
    );
}
export default UserSection;