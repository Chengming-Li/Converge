import React, { useState } from 'react';

function Interval({ info, windowWidth }) {

  const [startTime, setStartTime] = useState(info.start_time);
  const [EndTime, setEndTime] = useState(info.start_time);
  const [intervalName, setIntervalName] = useState(info.name);

  const handleStartChange = (event) => {
    setStartTime(event.target.value);
  };

  const handleEndChange = (event) => {
    setEndTime(event.target.value);
  };

  const handleNameChange = (event) => {
    setIntervalName(event.target.value);
  };

  return <div className='Interval'>
    <button id="Project" onClick={() => {console.log(info.project)}}>{"• "+info.project}</button>
    <input id="Name" value={intervalName} onChange={handleNameChange}></input>
    <input id="StartTime" value={startTime} onChange={handleStartChange}></input>
    <p id="Mid" style={{position: "absolute", marginTop: "15px", right: "257px", fontWeight: "100", fontSize: "30px"}}>-</p>
    <input id="EndTime" value={EndTime} onChange={handleEndChange}></input>
    <button id="Date" onClick={() => {console.log("date")}}><img src={'/calendar.png'} alt="date" /></button>
    <p id = "TimeElapsed" style={{position: "absolute", top: "4px", right: "49px", fontWeight: "100", fontSize: "20px"}}>{info.timeElapsed}</p>
    <button id="Edit" onClick={() => {console.log("edit")}}><img src={'/options.png'} alt="edit" /></button>
  </div>;
}

export default Interval;
/*
<p style={{ fontSize: "25px", marginBottom: "-2px" }}>{info.name}</p>
    <span style={{paddingRight: "3%" }}>({info.interval_id})</span>
    <span>{info.start_time} - {info.end_time}</span>
    <p style={{ position: "absolute", left: "23px", top: "37px", textAlign: "left",  }}>{info.name}</p>
*/