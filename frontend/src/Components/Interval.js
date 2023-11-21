import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Interval({ info, deleteInterval, editInterval }) {
  // extracts time from timeString in "00:00 AM/PM" format
  const getTime = (timeString) => {
    const currentDate = new Date(timeString)
    return currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', year: 'numeric' };
    const intl = new Intl.DateTimeFormat('en-US', options).format(date).split(" ");
    intl.push(String(date.getDate()).padStart(2, '0'))
    return intl[2] + " " + intl[3] + " " + intl[0] + " " + intl[1];
  }

  const [startTime, setStartTime] = useState(getTime(info.start_time));
  const [endTime, setEndTime] = useState(getTime(info.end_time));
  const [intervalName, setIntervalName] = useState(info.name);
  const [selectedDate, setSelectedDate] = useState(new Date(info.start_time));
  const [projectId, setProjectId] = useState(info.project_id);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const datepickerRef = useRef(null);

  const handleStartChange = (event) => {
    setStartTime(event.target.value);
  };

  const handleStartKeyPress = (e) => {
    if (e.key === 'Enter') {
      const st = new Date(`01/01/2023 ${startTime}`)
      st.setDate(selectedDate.getDate());
      st.setSeconds(new Date(info.start_time).getSeconds())
      const et = new Date(`01/01/2023 ${endTime}`)
      et.setDate(selectedDate.getDate());
      et.setSeconds(new Date(info.end_time).getSeconds())
      if(et < st) {
        et.setDate(et.getDate() + 1);
      }
      // editInterval(info.interval_id, projectId, st, et)
      e.target.blur();
    }
  };

  const handleEndChange = (event) => {
    setEndTime(event.target.value);
  };

  const handleNameChange = (event) => {
    setIntervalName(event.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log(date);
    setShowDatePicker(false);
    handleStartKeyPress({key: "Enter"})
  };
  
  useEffect(() => {
    const handleEditClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuIsOpen(false);
      }
    }
    const handleDateClickOutside = (event) => {
      if (datepickerRef.current && !datepickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleEditClickOutside);
    document.addEventListener('mousedown', handleDateClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleEditClickOutside);
      document.removeEventListener('mousedown', handleDateClickOutside);
    };
  }, []);

  function calculateTimeDifference(st, et) {
    const endDate = new Date(`01/01/2023 ${et}`);
    endDate.setSeconds(new Date(info.end_time).getSeconds())
    const startDate = new Date(`01/01/2023 ${st}`);
    startDate.setSeconds(new Date(info.start_time).getSeconds())

    if(endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    console.log(endDate)

    const timeDifference = endDate - startDate;

    const hours = Math.floor(timeDifference / 3600000);
    const minutes  = Math.floor((timeDifference % 3600000) / 60000);
    const seconds  = Math.floor((timeDifference % 60000) / 1000);
    
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return formattedHours + ":" + formattedMinutes + ":" + formattedSeconds
  }

  return (
    <div className='Interval'>
      <button id="Project" onClick={() => {console.log(info.project)}}>{"• "+info.project}</button>
      <input className="IntervalName" value={intervalName} onChange={handleNameChange}></input>
      
      <input className="StartTime" value={startTime} onChange={handleStartChange} onKeyDown={handleStartKeyPress}></input>
      <p id="Mid" style={{position: "absolute", marginTop: "15px", right: "292px", fontWeight: "100", fontSize: "30px"}}>-</p>
      <input className="EndTime" value={endTime} onChange={handleEndChange} onKeyDown={handleStartKeyPress}></input>

      <button id="Date" onClick={() => setShowDatePicker(!showDatePicker)}><img src={'/calendar.png'} alt="date" /></button>
      {showDatePicker && (
        <div ref={datepickerRef} style={{position: "absolute", top: "50px", right: "50px", zIndex: 100}}>
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

      <p id = "TimeElapsed" style={{position: "absolute", top: "4px", right: "49px", fontWeight: "100", fontSize: "20px"}}>{calculateTimeDifference(startTime, endTime)}</p>
      <button id="Edit" onClick={() => {setMenuIsOpen(!menuIsOpen)}}><img src={'/options.png'} alt="edit" /></button>
      {menuIsOpen && (
        <div className="EditMenu" ref={dropdownRef}>
          <button onClick={() => {deleteInterval(info.interval_id)}}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Interval;