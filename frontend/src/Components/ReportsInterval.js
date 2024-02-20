import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Components.css';

function ReportsInterval({ name, project, timeString }) {
    const [intervalName, setIntervalName] = useState(name);
    const intervalRef = useRef(null);
    const [intervalWidth, setIntervalWidth] = useState(0);

    useEffect(() => {
        const changeIntervalSize = () => {
            setIntervalWidth(intervalRef.current.offsetWidth);
        }
        window.addEventListener('resize', changeIntervalSize);
        changeIntervalSize();

        return () => {
            window.removeEventListener('resize', changeIntervalSize);
        };
    }, []);

    return (
        <div className='Interval' ref={intervalRef}>
            <span id="Project"
                style={{
                    maxWidth: `${intervalWidth - 450 + (intervalWidth < 556 ? 220 : 0) + (intervalWidth < 347 ? 150 : 0)}px`,
                    color: project.color
                }}
            >{"• " + (project ? project.name : "No Project")}</span>
            <span className="IntervalName" value={intervalName}></span>

            <p id="TimeElapsed" style={{ position: "absolute", top: "4px", right: "49px", fontWeight: "100", fontSize: "20px" }}>{timeString}</p>
        </div>
    );
}

export default ReportsInterval;