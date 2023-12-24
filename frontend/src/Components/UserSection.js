import React, { useState, useEffect } from 'react';
import '../Styles/Components.css';
import UserInterval from "./UserInterval"
import UserActiveInterval from "./UserActiveInterval"

function UserSection({ username, pfp, intervals, activeInterval, resumeInterval, userActive }) {

    const [collapsed, setCollapsed] = useState(false);
    const [totalTime, setTotalTime] = useState("00:00:00");

    console.log(activeInterval);

    useEffect(() => {
        const calcTotalTime = () => {
            let hours = 0;
            let minutes = 0;
            let seconds = 0;
            if (intervals) {
                for (const interval of intervals) {
                    const st = new Date(interval.start_time);
                    const et = new Date(interval.end_time);
                    const timeDifference = et - st;
                    hours += Math.floor(timeDifference / 3600000);
                    minutes += Math.floor((timeDifference % 3600000) / 60000);
                    seconds += Math.floor((timeDifference % 60000) / 1000);
                }
            }
            if (activeInterval) {
                const st = new Date(activeInterval.start_time);
                const et = new Date();
                const timeDifference = et - st;
                hours += Math.floor(timeDifference / 3600000);
                minutes += Math.floor((timeDifference % 3600000) / 60000);
                seconds += Math.floor((timeDifference % 60000) / 1000);
            }
            if (userActive) {
                const st = new Date(userActive.start_time);
                const et = new Date();
                const timeDifference = et - st;
                hours += Math.floor(timeDifference / 3600000);
                minutes += Math.floor((timeDifference % 3600000) / 60000);
                seconds += Math.floor((timeDifference % 60000) / 1000);
            }
            setTotalTime(String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0'));
        }
        const intervalId = setInterval(calcTotalTime, 500);
        calcTotalTime();
        return () => clearInterval(intervalId);
    });
    
    return (
        <div className="IntervalSection" style={{
            borderTopLeftRadius: "15px", 
            borderTopRightRadius: "15px", 
            borderBottomRightRadius: `${collapsed || !intervals || intervals.length === 0 ? 15 : 0}px`, 
            borderBottomLeftRadius: `${collapsed || !intervals || intervals.length === 0 ? 15 : 0}px`, 
            backgroundColor: "#34464f",
            marginBottom: "6px"
        }}>
            <div id='Head' style={{
                borderTopLeftRadius: "15px", 
                borderTopRightRadius: "15px", 
                borderBottomRightRadius: `${collapsed || !intervals || intervals.length === 0 ? 15 : 0}px`, 
                borderBottomLeftRadius: `${collapsed || !intervals || intervals.length === 0 ? 15 : 0}px`, 
                height: "61px", 
                backgroundColor: "#34464f"
            }}>
                <span id='username'>{username}</span>
                <img id="pfp" src={pfp} alt="pfp" />
                <span id='time' style={{top:"19px"}}>{totalTime}</span>
                <button id="collapse" style={{height: "61px", backgroundColor: "#34464f"}} onClick={() => {
                    if(intervals.length > 0 || activeInterval) {
                        setCollapsed(!collapsed);
                    }
                }}>
                    <img src={'/Cheese.png'} alt="collapse" />
                </button>
            </div>
            {
                !collapsed && activeInterval && (
                    <UserActiveInterval info={activeInterval}/>
                )
            }
            {
                !collapsed && intervals &&
                intervals.map((interval, index) => (
                    <UserInterval key={interval.interval_id} info={interval} resumeInterval={resumeInterval} />
                ))
            }
        </div>
    );
}
export default UserSection;