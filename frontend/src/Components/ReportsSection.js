import React, { useEffect, useState } from 'react';
import '../Styles/Components.css';
import ReportsInterval from './ReportsInterval';

function ReportsSection({ project, totalTime, intervals }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSections] = useState([]);

    useEffect(() => {
        const uniqueSections = {};
        console.log(intervals);

        for (let interval in intervals) {
            if (!uniqueSections[interval.name]) {
                uniqueSections[interval.name] = { hours: 0, minutes: 0, seconds: 0 };
            }
            const st = new Date(interval.start_time)
            const et = new Date(interval.end_time)
            const timeDifference = et - st;
            uniqueSections[interval.name].hours += Math.floor(timeDifference / 3600000);
            uniqueSections[interval.name].minutes += Math.floor((timeDifference % 3600000) / 60000);
            uniqueSections[interval.name].seconds += Math.floor((timeDifference % 60000) / 1000);
        }
        const output = [];
        for (let name in uniqueSections) {
            const timeString = String(uniqueSections[name].hours).padStart(2, '0') + ":" + String(uniqueSections[name].minutes).padStart(2, '0') + ":" + String(uniqueSections[name].seconds).padStart(2, '0');
            output.push(<ReportsInterval key={name} name={name} project={project} timeString={timeString} />);
        }
        setSections(output);
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