import './App.css';
import React, { useState, useEffect } from 'react';
import Input from './Components/Input';
import Interval from './Components/Interval';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import Section from './Components/Section';

const userDataAPI = "http://localhost:5000/api/user/914587493868011521"
const startIntervalAPI = "http://localhost:5000/api/interval"
const endIntervalAPI = "http://localhost:5000/api/interval/end/"
const editIntervalAPI = "http://localhost:5000/api/interval/"


function App() {
  /*
  const [userInfo, setUserInfo] = useState(null);
  const [activeInterval, setActiveInterval] = useState(null);
  const [inactiveIntervals, setInactiveIntervals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
      fetch(editIntervalAPI + activeInterval.interval_id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, start_time : activeInterval.start_time, project_id : activeInterval.project_id, end_time : activeInterval.end_time })
      }).then((response) => {
        if (!response.ok) {
          console.log(response.json());
          throw new Error(response.status);
        }
        return response.json();
      })
    } else {
      const user_id = userInfo.id
      let interval_id;
      fetch(startIntervalAPI, {
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
        const start_time = null;
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
    fetch(endIntervalAPI + activeInterval.interval_id, {
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
      setActiveInterval(null)
      setInactiveIntervals([{end_time, interval_id, name, project_id, start_time, user_id}, ...inactiveIntervals])
    }).catch((error) => {
      setError(error.message);
      return;
    });
  }

  return loading ? 
  (
    <h1>LOADING</h1>
  ) : error ? 
  (
    error
  ) :
  (
    <div className="App">
      <h1>Interval List</h1>
      <Input addInterval={startInterval} activeInterval={activeInterval} endInterval = {endInterval}/>
      {inactiveIntervals.map((interval, index) => (
        <Interval key={index} info={interval} />
      ))}
    </div>
  );*/
  const [collapsedMenu, setCollapsedMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);

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

  // remove after dev
  const backgroundStyle = { 
    backgroundImage: 'url("/UI.png")', // Specify the path to your image relative to the public directory
    backgroundSize: 'cover',
    backgroundPosition: 'center calc(50% + 10px)',
    height: '100vh',
  };

  return (
    <div className='.App' style={backgroundStyle}>
      <Header ToggleMenu={() => {setCollapsedMenu(!collapsedMenu)}}/>
      <Sidebar collapsed={collapsedMenu}/>
      <Input 
        activeInterval={undefined} 
        addInterval={(a, b) => {console.log("Add Interval")}} 
        endInterval={() => {console.log("End Interval")}} 
        inputWidth = {windowWidth - (collapsedMenu ? 58 : 198) + "px"}
        addProject = {() => {console.log("Added Project")}}
      />
      <div className="TimeSections" style={{width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}`}}>
        <Section title={"Today"} totalTime={"00:00:00"}/>
      </div>
    </div>
    
  );
  // 
  // 83.415vw;
}

export default App;