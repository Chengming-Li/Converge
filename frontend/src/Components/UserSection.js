import React, { useState } from 'react';
import '../Styles/Components.css';
import UserInterval from "./UserInterval"

function UserSection({ username, pfp, totalTime, intervals, resumeInterval }) {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <div className="IntervalSection" style={{
            borderTopLeftRadius: "15px", 
            borderTopRightRadius: "15px", 
            borderBottomRightRadius: `${collapsed ? 15 : 0}px`, 
            borderBottomLeftRadius: `${collapsed ? 15 : 0}px`, 
            backgroundColor: "#34464f",
            marginBottom: "6px"
        }}>
            <div id='Head' style={{
                borderTopLeftRadius: "15px", 
                borderTopRightRadius: "15px", 
                borderBottomRightRadius: `${collapsed ? 15 : 0}px`, 
                borderBottomLeftRadius: `${collapsed ? 15 : 0}px`, 
                height: "61px", 
                backgroundColor: "#34464f"
            }}>
                <span id='username'>{username}</span>
                <img id="pfp" src={pfp} alt="pfp" />
                <span id='time' style={{top:"19px"}}>{totalTime}</span>
                <button id="collapse" style={{height: "61px", backgroundColor: "#34464f"}} onClick={() => {
                    if(intervals.length > 0) {
                        setCollapsed(!collapsed);
                    }
                }}>
                    <img src={'/Cheese.png'} alt="collapse" />
                </button>
            </div>
            {
                !collapsed && 
                intervals.map((interval, index) => (
                    <UserInterval key={interval.interval_id} info={interval} resumeInterval={resumeInterval} />
                ))
            }
        </div>
    );
}
export default UserSection;