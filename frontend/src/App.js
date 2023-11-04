import './App.css';
import React, { useState, useEffect } from 'react';

const API = "http://localhost:5000/api/table/users"
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
      setData(data[0].username);
      setLoading(false)
    }).catch((error) => {
      setError(error.message)
      setLoading(false)
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {loading ? <p>Loading...</p> 
        : error ? <p>{error}</p>
        : <p>{data}</p>
        }
      </header>
    </div>
  );
}

export default App;
