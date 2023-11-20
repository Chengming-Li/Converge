import React, { useState, useEffect } from 'react';
import '../App.css';

function Input({ activeInterval, addInterval, endInterval, inputWidth, addProject }) {
  const [value, setValue] = useState(activeInterval ? activeInterval.name : "");
  const [time, setTime] = useState(activeInterval ? activeInterval.start_time : "00:00:00")

  const handleInputChange = (event) => {
    if (event.target.value.length <= 280) {
      setValue(event.target.value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addInterval(value, null);
      e.target.blur();
    }
  };

  const handleButtonPress = () => {
    if (activeInterval) {
      endInterval();
      setValue("");
    } else {
      addInterval(value, null);
    }
  }
  
  useEffect(() => {
    const calculateTimeElapsed = () => {
      if(activeInterval) {
        const timeDifference = new Date() - new Date(activeInterval.start_time);
        const hours = Math.floor(timeDifference / 3600000);
        const minutes  = Math.floor((timeDifference % 3600000) / 60000);
        const seconds  = Math.floor((timeDifference % 60000) / 1000);
        
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        setTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
      } else {
        setTime("00:00:00")
      }
    };
    const intervalId = setInterval(calculateTimeElapsed, 1000);
    calculateTimeElapsed();
    return () => clearInterval(intervalId);
  }, [activeInterval]);

  return (
    <div className='Input' style={{width: `${inputWidth}`}}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="Task name"
      />
      <button id="Project" onClick={addProject}>
        <img src={"/Cheese.png"} alt="Icon"/>
      </button>
      <p>{time}</p>
      <button id="Start" onClick={handleButtonPress}>{activeInterval ? "STOP" : "START"}</button>
    </div>
  );
}

export default Input;