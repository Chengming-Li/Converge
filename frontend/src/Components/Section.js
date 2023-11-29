import React, { useState } from 'react';
import '../Styles/Home.css';
import Interval from './Interval';

function Section({ title, totalTime, intervals, deleteInterval, editInterval, rerender, resumeInterval, setIntervalName }) {
    const [collapsed, setCollapsed] = useState(false);
    
    return (
        <div className="IntervalSection">
            <div id='Head'>
                <span id='title'>{title}</span>
                <span id='time'>{totalTime}</span>
                <button id="collapse" onClick={() => {setCollapsed(!collapsed)}}>
                    <img src={'/Cheese.png'} alt="collapse" />
                </button>
            </div>
            {!collapsed && 
                intervals.map((interval, index) => (
                    <Interval key={interval.interval_id} info={interval} deleteInterval={deleteInterval} editInterval={editInterval} rerender={rerender} resumeInterval={resumeInterval} />
                ))
            }
        </div>
    );
}
export default Section;