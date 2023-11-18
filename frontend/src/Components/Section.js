import React from 'react';
import '../App.css';
import Interval from './Interval';

function Section({ title, totalTime, intervals }) {
    return (
        <div className="IntervalSection">
            <div id='Head'>
                <span id='title'>{title}</span>
                <span id='time'>{totalTime}</span>
            </div>
            <Interval 
                info={{name:"Interval", project:"Project", interval_id:"1", start_time:"00:00", end_time:"00:00"}}
            />
            <Interval 
                info={{name:"Interval1", project:"Project", interval_id:"1", start_time:"00:00", end_time:"00:00"}}
            />
            <Interval 
                info={{name:"Interval3", project:"Project", interval_id:"1", start_time:"00:00", end_time:"00:00"}}
            />
        </div>
    );
}
export default Section;
/*
{intervals.map((interval, index) => (
                <Interval key={index} info={interval} />
            ))}
*/