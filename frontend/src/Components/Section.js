import React from 'react';
import '../App.css';
import Interval from './Interval';

function Section({ title, totalTime }) {
    return (
        <div className="IntervalSection">
            <div id='Head'>
                <span id='title'>{title}</span>
                <span id='time'>{totalTime}</span>
            </div>
        </div>
    );
}
export default Section;