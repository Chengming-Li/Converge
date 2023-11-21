import React, { useState } from 'react';
import '../App.css';
import Interval from './Interval';

function Section({ title, totalTime, intervals, deleteInterval, editInterval }) {
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
                    <Interval key={interval.interval_id} info={interval} deleteInterval={deleteInterval} editInterval={editInterval} />
                ))
            }
        </div>
    );
}
export default Section;