import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Components.css';

function ReportsInterval({ name, timeString }) {
    const intervalRef = useRef(null);

    useEffect(() => {
    }, []);

    return (
        <div className='Interval' style={{ height: "50px" }} ref={intervalRef}>
            <span className="IntervalName" style={{ top: "13px", fontSize: "22px" }}>{name}</span>

            <p id="TimeElapsed" style={{ position: "absolute", top: "-6px", right: "49px", fontWeight: "100", fontSize: "20px" }}>{timeString}</p>
        </div>
    );
}

export default ReportsInterval;