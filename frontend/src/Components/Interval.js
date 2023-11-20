import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

function Interval({ info }) {
  const [startTime, setStartTime] = useState(info.start_time);
  const [EndTime, setEndTime] = useState(info.start_time);
  const [intervalName, setIntervalName] = useState(info.name);
  const [selectedDate, setSelectedDate] = useState(info.date);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleStartChange = (event) => {
    setStartTime(event.target.value);
  };

  const handleEndChange = (event) => {
    setEndTime(event.target.value);
  };

  const handleNameChange = (event) => {
    setIntervalName(event.target.value);
  };
  
  const formatDate = (date) => {
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    console.log(formatDate(date))
  };

  return <div className='Interval'>
    <button id="Project" onClick={() => {console.log(info.project)}}>{"• "+info.project}</button>
    <input id="Name" value={intervalName} onChange={handleNameChange}></input>
    
    <input id="StartTime" value={startTime} onChange={handleStartChange}></input>
    <p id="Mid" style={{position: "absolute", marginTop: "15px", right: "257px", fontWeight: "100", fontSize: "30px"}}>-</p>
    <input id="EndTime" value={EndTime} onChange={handleEndChange}></input>

    <button id="Date" onClick={() => setShowDatePicker(!showDatePicker)}><img src={'/calendar.png'} alt="date" /></button>
    {showDatePicker && (
      <div style={{position: "absolute", top: "50px", right: "50px", zIndex: 100}}>
        <DatePicker
          wrapperClassName="datePicker"
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd MMMM yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          inline
          style={{
            color: "red"
          }}
        />
      </div>
      )}

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