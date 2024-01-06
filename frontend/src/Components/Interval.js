import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../Styles/Components.css';

function Interval({ info, deleteInterval, editInterval, rerender, resumeInterval }) {
  // extracts and formats time from Date object
  function getTime(currentDate) {
    if (!currentDate) {
      return null;
    }
    return currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  const [startTime, setStartTime] = useState(new Date(info.start_time));
  const [endTime, setEndTime] = useState(new Date(info.end_time));
  const [startInput, setStartInput] = useState(getTime(startTime));
  const [endInput, setEndInput] = useState(getTime(endTime));
  const [intervalName, setIntervalName] = useState(info.name);
  const [finalIntervalName, setFinalIntervalName] = useState(info.name);
  const [projectId, setProjectId] = useState(info.project_id);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const datepickerRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const isInitialRender = useRef(true);
  const [dateChanged, setDateChanged] = useState(false);

  const handleStartChange = (event) => {
    setStartInput(event.target.value);
  };
  const handleEndChange = (event) => {
    setEndInput(event.target.value);
  };

  function updateTime(newTime, currentTime, updateFunction, updateInput) {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/i; // 00:00 AM/PM format
    const timeRegexNoSpace = /^(0?[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/i; // 00:00AM/PM format
    const timeRegexNoAMPM = /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/i; // military time format
    let temp;
    newTime = newTime.trim().toLowerCase();
    if (timeRegex.test(newTime) || timeRegexNoAMPM.test(newTime)) {
      temp = new Date(`01/01/2023 ${newTime}`);
    } else if (timeRegexNoSpace.test(newTime.toLowerCase())) {
      const tempTime = newTime.slice(0, 5) + " " + newTime.slice(5);
      temp = new Date(`01/01/2023 ${tempTime}`);
      console.log(temp);
    } else {
      updateInput(getTime(currentTime));
      console.log(newTime)
      return;
    }
    const st = new Date(currentTime);
    st.setHours(temp.getHours(), temp.getMinutes());
    updateFunction(st);
    updateInput(getTime(st));
    setDateChanged(true);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handleNameChange = (event) => {
    if (event.target.value.length <= 280) {
      setIntervalName(event.target.value);
    }
  };

  const changeName = () => {
    setFinalIntervalName(intervalName);
  }

  const handleDateChange = (date) => {
    const et = new Date(endTime);
    const st = new Date(startTime)
    st.setDate(date.getDate())
    st.setFullYear(date.getFullYear());
    et.setDate(date.getDate())
    et.setFullYear(date.getFullYear());
    setStartTime(st)
    setEndTime(et)
    setShowDatePicker(false);
    setDateChanged(true);
  };

  // closes date picker and options menu if clicked off
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

  // calls edit interval function whenever one of the inputs are altered
  useEffect(() => {
    // doesn't trigger upon first render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    editInterval(info.interval_id, finalIntervalName, projectId, startTime, endTime);
    if (dateChanged) {
      rerender();
      setDateChanged(false);
    }
  }, [rerender, editInterval, info.interval_id, finalIntervalName, projectId, startTime, endTime])

  function calculateTimeDifference() {
    const et = new Date(endTime);
    const st = new Date(startTime)
    if (et < st) {
      et.setDate(et.getDate() + 1);
    } else if ((et - st) > (24 * 60 * 60 * 1000)) {
      et.setDate(et.getDate() - 1);
    }

    const timeDifference = et - st;

    const hours = Math.floor(timeDifference / 3600000);
    const minutes = Math.floor((timeDifference % 3600000) / 60000);
    const seconds = Math.floor((timeDifference % 60000) / 1000);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return formattedHours + ":" + formattedMinutes + ":" + formattedSeconds
  }

  return (
    <div className='Interval'>
      <button id="Project" onClick={() => { console.log(info.project) }}>{"• " + info.project}</button>
      <input className="IntervalName" value={intervalName} onChange={handleNameChange} onKeyDown={handleKeyPress} onBlur={changeName}></input>

      <input ref={startTimeRef} className="StartTime" value={startInput} onChange={handleStartChange} onKeyDown={handleKeyPress} onBlur={() => { updateTime(startInput, startTime, setStartTime, setStartInput) }}></input>
      <p id="Mid" style={{ position: "absolute", marginTop: "15px", right: "292px", fontWeight: "100", fontSize: "30px" }}>-</p>
      <input ref={endTimeRef} className="EndTime" value={endInput} onChange={handleEndChange} onKeyDown={handleKeyPress} onBlur={() => { updateTime(endInput, endTime, setEndTime, setEndInput) }}></input>

      <button id="Date" onClick={() => setShowDatePicker(!showDatePicker)}><img src={'/calendar.png'} alt="date" /></button>
      {showDatePicker && (
        <div ref={datepickerRef} style={{ position: "absolute", top: "50px", right: "50px", zIndex: 99 }}>
          <DatePicker
            wrapperClassName="datePicker"
            selected={startTime}
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

      <p id="TimeElapsed" style={{ position: "absolute", top: "4px", right: "49px", fontWeight: "100", fontSize: "20px" }}>{calculateTimeDifference(startTime, endTime)}</p>
      <button id="Edit" onClick={() => { setMenuIsOpen(!menuIsOpen) }}><img src={'/options.png'} alt="edit" /></button>
      {menuIsOpen && (
        <div className="EditMenu" ref={dropdownRef}>
          <button id='resume' onClick={() => { resumeInterval(intervalName, projectId) }}>
            Resume
          </button>
          <button id='delete' onClick={() => { deleteInterval(info.interval_id) }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Interval;