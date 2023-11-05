import React from 'react';

function Interval({ info }) {
  return <div>
    <p style={{ fontSize: "25px", marginBottom: "-2px" }}>{info.name}</p>
    <span style={{paddingRight: "3%" }}>({info.interval_id})</span>
    <span>{info.start_time} - {info.end_time}</span>
  </div>;
}

export default Interval;