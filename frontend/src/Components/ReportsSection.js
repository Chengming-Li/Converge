import React, { useEffect, useState } from 'react';
import '../Styles/Components.css';
import ReportsInterval from './ReportsInterval';

function ReportsSection({ project, intervals, time, percent }) {
    const [collapsed, setCollapsed] = useState(false);
    const [section, setSections] = useState([]);
    const [totalTime, setTotalTime] = useState("");

    useEffect(() => {
        const output = [];
        for (let intervalName in intervals) {
            const newInterval = { hours: 0, minutes: 0, seconds: 0 };
            for (let i = 0; i < intervals[intervalName].length; i++) {
                newInterval.hours += intervals[intervalName][i].hours;
                newInterval.minutes += intervals[intervalName][i].minutes;
                newInterval.seconds += intervals[intervalName][i].seconds;
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
                <span id='time' style={{ right: `${Math.floor(Math.log10(percent)) * 10 + 85}px` }}>{totalTime}</span>
                <span id='percent' style={{ color: project.color }}>({percent.toString() + "%"})</span>
                <button id="collapse" onClick={() => { setCollapsed(!collapsed) }}>
                    <img src={collapsed ? '/collapse.png' : '/expand.png'} alt="collapse" />
                </button>
            </div>
            {!collapsed &&
                section
            }
        </div>
    );
}
export default ReportsSection;