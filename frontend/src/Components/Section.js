import React, { useState } from 'react';
import '../Styles/Components.css';
import Interval from './Interval';
import { SHA256 } from 'crypto-js';

function Section({ title, totalTime, intervals, deleteInterval, editInterval, rerender, resumeInterval, projects, timezone }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="IntervalSection">
            <div id='Head'>
                <span id='title'>{title}</span>
                <span id='time'>{totalTime}</span>
                <button id="collapse" onClick={() => { setCollapsed(!collapsed) }}>
                    <img src={collapsed ? '/collapse.png' : '/expand.png'} alt="collapse" />
                </button>
            </div>
            {!collapsed &&
                intervals.map((interval, index) => (
                    <Interval key={SHA256(interval.interval_id + interval.name + interval.start_time + interval.end_time + interval.project_id)} info={interval} deleteInterval={deleteInterval} editInterval={editInterval} rerender={rerender} resumeInterval={resumeInterval} projects={projects} timezone={timezone} />
                ))
            }
        </div>
    );
}
export default Section;