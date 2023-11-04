import './App.css';
import React, { useState, useEffect } from 'react';
import Input from './Input';

const API = "http://localhost:5000/api/user/913900508510060545"
function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Assuming your server returns JSON
    }).then((data) => {
      setData(data);
      setLoading(false)
    }).catch((error) => {
      setError(error.message)
      setLoading(false)
    });
  }, []);

  return (
    <div className="background">
      <Input />
      <div className="App">
        {loading ? <p style={{ marginTop: "20px"}}>Loading...</p>
          : error ? <p style={{ color: "red", marginTop: "20px" }}>{error}</p>
          : <>
            <p style={{ marginTop: "20px", fontWeight: 'bold' }}>User Info</p>
            <p>Email: {data.userInfo.email}</p>
            <p>Username: {data.userInfo.username}</p>
            <p>User ID: {data.userInfo.id}</p>
            <p>Timezone: {data.userInfo.timezone}</p>

            <p style={{ marginTop: "20px", fontWeight: 'bold' }}>Active Interval</p>
            <p>Name: {data.activeInterval.name}</p>
            <p>Project ID: {data.activeInterval.project_id}</p>
            <p>Interval ID: {data.activeInterval.interval_id}</p>
            <p>Start Time: {data.activeInterval.start_time}</p>
            <p>End Time: {data.activeInterval.end_time}</p>

            <p style={{ marginTop: "20px", fontWeight: 'bold' }}>Past Intervals</p>
            <ul>
              {data.intervals.map((item) => (
                <li key={item.interval_id}>
                  <>
                    <p>Name: {item.name}</p>
                    <p>Project ID: {item.project_id}</p>
                    <p>Interval ID: {item.interval_id}</p>
                    <p>Start Time: {item.start_time}</p>
                    <p>End Time: {item.end_time}</p>
                  </>
                </li> 
              ))}
            </ul>
          </>
        }
      </div>
    </div>
  );
}

export default App;
