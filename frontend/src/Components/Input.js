import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Components.css';
import ProjectsDropdown from '../Components/ProjectsDropdown';

function Input({ activeInterval, addInterval, endInterval, inputWidth, projects, project, setProject, value, setValue }) {
  const [time, setTime] = useState(activeInterval ? activeInterval.start_time : "00:00:00");
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const projectRef = useRef(null);
  const [projectButtonWidth, setProjectButtonWidth] = useState(0);

  // closes projects dropdown if clicked off
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (event) => {
    if (event.target.value.length <= 280) {
      setValue(event.target.value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addInterval(value, project.project_id);
      e.target.blur();
    }
  };

  const handleButtonPress = () => {
    if (activeInterval) {
      endInterval();
      setValue("");
      setProject({
        color: "white",
        project_id: null,
        name: "No Project"
      });
    } else {
      addInterval(value, project.project_id);
    }
  }

  const selectProject = (p) => {
    setProject(p);
    if (activeInterval) {
      addInterval(value, p.project_id);
    }
    setDropdown(false);
  }

  useEffect(() => {
    setProjectButtonWidth(projectRef.current.offsetWidth);
  }, [project, inputWidth]);

  useEffect(() => {
    const calculateTimeElapsed = () => {
      if (activeInterval) {
        const timeDifference = new Date() - new Date(activeInterval.start_time);
        const hours = Math.floor(timeDifference / 3600000);
        const minutes = Math.floor((timeDifference % 3600000) / 60000);
        const seconds = Math.floor((timeDifference % 60000) / 1000);

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
    if (activeInterval && projects && activeInterval.project_id) {
      setProject(projects.find(project => project.project_id === activeInterval.project_id));
    }
    return () => clearInterval(intervalId);
  }, [activeInterval]);

  return (
    <div className='Input' style={{ width: `${inputWidth}` }}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="What are you working on?"
        style={{ width: `calc(100% - 270px - ${projectButtonWidth}px)` }}
      />
      <button id="Project" onClick={() => { setDropdown(!dropdown) }} ref={projectRef}>
        <span style={{ color: project.color }}>{parseInt(inputWidth, 10) > 500 ? "• " + project.name : "•"}</span>
      </button>
      {dropdown &&
        <div ref={dropdownRef}>
          <ProjectsDropdown
            projects={projects}
            selectProject={selectProject}
          />
        </div>
      }
      <p>{time}</p>
      <button id="Start" onClick={handleButtonPress}>{activeInterval ? "STOP" : "START"}</button>
    </div>
  );
}

export default Input;