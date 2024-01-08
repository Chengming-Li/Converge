import React, { useState, useEffect } from 'react';
import '../Styles/Components.css';

function UserActiveInterval({ info }) {
    const [startTime, setStartTime] = useState(new Date(info.start_time));
    const [intervalName, setIntervalName] = useState(info.name);
    const [timeElapsed, setTimeElapsed] = useState("00:00:00");

    useEffect(() => {
        function calculateTimeDifference() {
            if (info.name !== intervalName) {
                setIntervalName(info.name);
            }
            const et = new Date();
            const st = new Date(startTime)
            if (et < st) {
                et.setDate(et.getDate() + 1);
            } else if ((et - st) > (24 * 60 * 60 * 1000)) {
                et.setDate(et.getDate() - 1);
            }

            const timeDifference = et - st;

            const hours = Math.floor(timeDifference / 3600000);
            const minutes = Math.floor((timeDifference % 3600000) / 60000);
            const seconds = Math.max(Math.floor((timeDifference % 60000) / 1000), 1);

            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');

            setTimeElapsed(formattedHours + ":" + formattedMinutes + ":" + formattedSeconds);
        }
        const intervalId = setInterval(calculateTimeDifference, 1000);
        calculateTimeDifference();
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className='Interval'>
            <p className="IntervalName" style={{ top: "3px" }}>{intervalName}</p>
            <p id="TimeElapsed" style={{ position: "absolute", top: "4px", right: "49px", fontWeight: "100", fontSize: "20px" }}>{timeElapsed}</p>
        </div>
    );
}

export default UserActiveInterval;