import React from 'react';

function Interval({ info }) {
  return <div className='Interval'>
    <button id="Project" onClick={() => {console.log(info.project)}}>{info.project}</button>
    <input value={info.name}></input>
  </div>;
}

export default Interval;
/*
<p style={{ fontSize: "25px", marginBottom: "-2px" }}>{info.name}</p>
    <span style={{paddingRight: "3%" }}>({info.interval_id})</span>
    <span>{info.start_time} - {info.end_time}</span>
    <p style={{ position: "absolute", left: "23px", top: "37px", textAlign: "left",  }}>{info.name}</p>
*/