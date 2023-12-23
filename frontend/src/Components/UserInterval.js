import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Components.css';

function UserInterval({ info, resumeInterval }) {
    const [startTime, setStartTime] = useState(new Date(info.start_time));
    const [endTime, setEndTime] = useState(new Date(info.end_time));
    const [intervalName, setIntervalName] = useState(info.name);
    const [projectId, setProjectId] = useState(info.project_id);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    function calculateTimeDifference() {
        const et = new Date(endTime);
        const st = new Date(startTime)
        if(et < st) {
            et.setDate(et.getDate() + 1);
        } else if ((et - st) > (24 * 60 * 60 * 1000)) {
            et.setDate(et.getDate() - 1);
        }
    
        const timeDifference = et - st;
    
        const hours = Math.floor(timeDifference / 3600000);
        const minutes  = Math.floor((timeDifference % 3600000) / 60000);
        const seconds  = Math.max(Math.floor((timeDifference % 60000) / 1000), 1);
        
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
    
        return formattedHours + ":" + formattedMinutes + ":" + formattedSeconds
    }

    return (
        <div className='Interval'>
            <p className="IntervalName" style={{top: "-7px"}}>{intervalName}</p>
            <p id="Project" style={{top: "22px"}}>{"• "+info.project}</p>
            <p id = "TimeElapsed" style={{position: "absolute", top: "4px", right: "49px", fontWeight: "100", fontSize: "20px"}}>{calculateTimeDifference(startTime, endTime)}</p>
            {resumeInterval && <button id="Edit" onClick={() => {setMenuIsOpen(!menuIsOpen)}}><img src={'/options.png'} alt="edit" /></button>}
            {menuIsOpen && (
                <div className="EditMenu" ref={dropdownRef}>
                    <button id='resume' onClick={() => {resumeInterval(intervalName, projectId)}}>
                        Resume
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserInterval;