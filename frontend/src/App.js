import './App.css';
import React, { useState, useEffect } from 'react';
import Input from './Components/Input';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import Section from './Components/Section';
import moment, { min } from "moment-timezone";
import { SHA256 } from 'crypto-js';

const userDataAPI = "http://localhost:5000/api/user/919089736405909505"
const intervalAPI = "http://localhost:5000/api/interval"
const endIntervalAPI = "http://localhost:5000/api/interval/end/"


function App() {
  const [collapsedMenu, setCollapsedMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);

  const [userInfo, setUserInfo] = useState(null);
  const [activeInterval, setActiveInterval] = useState(null);
  const [inactiveIntervals, setInactiveIntervals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState(null);

  // fetches and stores user data from userDataAPI
  useEffect(() => {
    fetch(userDataAPI).then((response) => {
      if (!response.ok) {
        console.log(response.json());
        throw new Error(response.status);
      }
      return response.json();
    }).then((data) => {
      setUserInfo(data.userInfo);
      setInactiveIntervals(data.intervals);
      setActiveInterval(data.activeInterval);
      setLoading(false);
    }).catch((error) => {
      setError(error.message);
      setLoading(false);
    });
  }, []);

  // starts interval
  const startInterval = (name, project_id) => {
    if (activeInterval) {
      return;
    } else {
      const user_id = userInfo.id
      setActiveInterval({ name, start_time: new Date()})
      let interval_id;
      fetch(intervalAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, user_id, project_id })
      }).then((response) => {
        if (!response.ok) {
          console.log(response.json());
          throw new Error(response.status);
        }
        return response.json();
      }).then((data) => {
        interval_id = data.id;
        const start_time = data.start_time;
        const end_time = null;
        setActiveInterval({name, user_id, project_id, interval_id, start_time, end_time})
      }).catch((error) => {
        setError(error.message);
      });
    }
  };

  // ends interval
  const endInterval = () => {
    if (!activeInterval) {
      return;
    }
    let end_time, interval_id, name, project_id, start_time, user_id;
    const id = activeInterval.interval_id;
    setActiveInterval(null)
    fetch(endIntervalAPI + id, {
      method: 'PUT',
      headers: {
      },
      body: undefined,
    }).then((response) => {
      if (!response.ok) {
        console.log(response.json());
        throw new Error(response.status);
      }
      return response.json();
    }).then((data) => {
      end_time = data.end_time;
      interval_id = data.interval_id;
      name = data.name;
      project_id = data.project_id;
      start_time = data.start_time;
      user_id = data.user_id;
      setInactiveIntervals([{end_time, interval_id, name, project_id, start_time, user_id}, ...inactiveIntervals])
    }).catch((error) => {
      setError(error.message);
      return;
    });
  }

  // deletes interval
  const deleteInterval = (id) => {
    const indexToRemove = inactiveIntervals.findIndex((interval) => interval.interval_id === id);
    const removedInterval = indexToRemove !== -1 ? inactiveIntervals[indexToRemove] : null
    const updatedList = inactiveIntervals.filter((interval) => interval.interval_id !== id);
    setInactiveIntervals(updatedList)
    fetch(intervalAPI+"/"+id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      if (!response.ok) {
        console.log(response.json());
        throw new Error(response.status);
      }
      return response.json();
    }).catch((error) => {
      setError(error.message);
      setInactiveIntervals([])
      setInactiveIntervals([removedInterval, ...inactiveIntervals])
    });
  } 

  // edits interval
  const editInterval = (id, name, project_id, start_time, end_time) => {
    if(end_time < start_time) {
      end_time.setDate(end_time.getDate() + 1);
    }
    const st = moment(start_time).tz(userInfo.timezone).utc().format("dddd DD MMMM YYYY HH:mm:ss z");
    const et = moment(end_time).tz(userInfo.timezone).utc().format("dddd DD MMMM YYYY HH:mm:ss z");
    const indexToEdit = inactiveIntervals.findIndex((interval) => interval.interval_id === id);
    if(indexToEdit !== -1) {
      inactiveIntervals[indexToEdit].name = name;
      inactiveIntervals[indexToEdit].project_id = project_id;
      inactiveIntervals[indexToEdit].start_time = st;
      inactiveIntervals[indexToEdit].end_time = et;      
    }
    fetch(intervalAPI + "/" + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, project_id, start_time: st, end_time: et }),
    }).then((response) => {
      if (!response.ok) {
        console.log(response.json());
        throw new Error(response.status);
      }
      return response.json();
    }).catch((error) => {
      setError(error.message);
    });
  }

  // separates intervals into sections
  const separateSections = () => {
    inactiveIntervals.sort((a, b) => {
      const dateA = new Date(a.start_time);
      const dateB = new Date(b.start_time);
      return dateB-dateA;
    });
    const output = []
    const compareDates = (timeOne, timeTwo) => {
      const date1 = new Date(timeOne);
      const date2 = new Date(timeTwo);
      return (date1.getFullYear() === date2.getFullYear()) &&
      (date1.getMonth() === date2.getMonth()) &&
      (date1.getDate() === date2.getDate());
    }
    for (const element of inactiveIntervals) {
      if(output.length === 0 || !compareDates(output[output.length - 1][0].start_time, element.start_time)) {
        output.push([]);
      }
      output[output.length - 1].push(element);
    }

    const relativizeDates = (timeString) => {
      const present = new Date();
      const oneDayAhead = new Date(timeString);
      oneDayAhead.setDate(oneDayAhead.getDate() + 1);
      if (compareDates(timeString, present.toDateString())) {
        return "Today";
      } else if (compareDates(oneDayAhead.toDateString(), present.toDateString())) {
        return "Yesterday";
      } else {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(timeString).toLocaleDateString('en-US', options);
      }
    }

    // calculate total time of all intervals in a section
    const calcTotalTime = (intervals) => {
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      for (const interval of intervals) {
        const st = new Date(interval.start_time)
        const et = new Date(interval.end_time)
        const timeDifference = et - st;
        hours += Math.floor(timeDifference / 3600000);
        minutes += Math.floor((timeDifference % 3600000) / 60000);
        seconds += Math.floor((timeDifference % 60000) / 1000);
      }
      return String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
    }

    setSections((
      output.map((intervals, index) => (
        <Section 
          title={relativizeDates(intervals[0].start_time)}
          totalTime={calcTotalTime(intervals)}
          intervals={intervals} 
          deleteInterval={deleteInterval}
          editInterval={editInterval}
          rerender={separateSections}
          key={SHA256(relativizeDates(intervals[0].start_time) + intervals.map(obj => obj.interval_id).join('')).toString()}
        />
      ))
    ))
  }

  // tracks window width
  const updateWindowWidth = () => {
    setWindowWidth(document.documentElement.clientWidth);
  };
  useEffect(() => {
    // Add event listener when component mounts
    window.addEventListener('resize', updateWindowWidth);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

  useEffect(() => {
    separateSections();
  }, [loading]);

  return loading ? 
  (
    <h1>LOADING</h1>
  ) : error ? 
  (
    error
  ) :
  (
    <div className='.App'>
      <Header ToggleMenu={() => {setCollapsedMenu(!collapsedMenu)}}/>
      <Sidebar collapsed={collapsedMenu}/>
      <Input 
        activeInterval={activeInterval} 
        addInterval={startInterval} 
        endInterval={endInterval} 
        inputWidth = {windowWidth - (collapsedMenu ? 58 : 198) + "px"}
        addProject = {() => {console.log("Added Project")}}
      />
      <div className="TimeSections" style={{width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}`}}>
        <div style={
          {
            width: '100%',
            height: '100%',
            overflowY: 'auto'
          }}>
          {sections}
        </div>
      </div>
    </div>
    
  );
}

export default App;