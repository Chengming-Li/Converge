import React, { useState, useEffect } from 'react';
import '../App.css';
import Interval from './Interval';

function Section({ title, totalTime, intervals }) {
    const [collapsed, setCollapsed] = useState(false);
    const [tempInterval, setTempInterval] = useState(null)
    return (
        <div className="IntervalSection">
            <div id='Head'>
                <span id='title'>{title}</span>
                <span id='time'>{totalTime}</span>
                <button id="collapse" onClick={() => {setCollapsed(!collapsed)}}>
                    <img src={'/Cheese.png'} alt="collapse" />
                </button>
            </div>
            {tempInterval}
            {!collapsed && 
                intervals.map((interval, index) => (
                    <Interval key={interval.interval_id} info={interval} />
                ))
            }
        </div>
    );
}
export default Section;
/*
{intervals.map((interval, index) => (
                <Interval key={index} info={interval} />
            ))}
*/