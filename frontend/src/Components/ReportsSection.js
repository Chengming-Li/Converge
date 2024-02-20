import React, { useEffect, useState } from 'react';
import '../Styles/Components.css';
import ReportsInterval from './ReportsInterval';

function ReportsSection({ project, intervals }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSections] = useState([]);
    const [totalTime, setTotalTime] = useState("");

    useEffect(() => {
        const output = [];
        const time = { hours: 0, minutes: 0, seconds: 0 };
        for (let intervalName in intervals) {
            const newInterval = { hours: 0, minutes: 0, seconds: 0 };
            console.log(intervals[intervalName]);
            for (let i = 0; i < intervals[intervalName].length; i++) {
                const st = new Date(intervals[intervalName][i].start_time)
                const et = new Date(intervals[intervalName][i].end_time)
                const timeDifference = et - st;
                newInterval.hours += Math.floor(timeDifference / 3600000);
                newInterval.minutes += Math.floor((timeDifference % 3600000) / 60000);
                newInterval.seconds += Math.floor((timeDifference % 60000) / 1000);
                time.hours += Math.floor(timeDifference / 3600000);
                time.minutes += Math.floor((timeDifference % 3600000) / 60000);
                time.seconds += Math.floor((timeDifference % 60000) / 1000);
            }
            const timeString = String(newInterval.hours).padStart(2, '0') + ":" + String(newInterval.minutes).padStart(2, '0') + ":" + String(newInterval.seconds).padStart(2, '0');
            output.push(<ReportsInterval key={intervalName} name={intervalName} project={project} timeString={timeString} />);
        }
        setSections(output);
        setTotalTime(String(time.hours).padStart(2, '0') + ":" + String(time.minutes).padStart(2, '0') + ":" + String(time.seconds).padStart(2, '0'));
    }, [intervals]);

    return (
        <div className="ReportsSection">
            <div id='Head'>
                <span id='title' style={{ color: project.color }}>{project.name}</span>
                <span id='time'>{totalTime}</span>
                <button id="collapse" onClick={() => { setCollapsed(!collapsed) }}>
                    <img src={'/Cheese.png'} alt="collapse" />
                </button>
            </div>
            {!collapsed &&
                section
            }
        </div>
    );
}
export default ReportsSection;