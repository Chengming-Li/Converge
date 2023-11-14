import React, { useState } from 'react';
import '../App.css';

function Input({ activeInterval, addInterval, endInterval, inputWidth, addProject }) {
  const [value, setValue] = useState(activeInterval ? activeInterval.name : "");

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
      endInterval()
      setValue("")
    } else {
      addInterval(value, null);
    }
  }

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
      <p>00:00:00</p>
      <button id="Start" onClick={handleButtonPress}>START</button>
    </div>
  );
}

export default Input;