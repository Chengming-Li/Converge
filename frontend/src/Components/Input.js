import React, { useState } from 'react';
import '../App.css';

function Input({ activeInterval, addInterval, endInterval }) {
  const [value, setValue] = useState(activeInterval ? activeInterval.name : "");

  const handleInputChange = (event) => {
    setValue(event.target.value);
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
    <div className='Input'>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="Task name"
      />
      <button onClick={handleButtonPress}>Button</button>
    </div>
  );
}

export default Input;