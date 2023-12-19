import io from 'socket.io-client';
import '../Styles/Rooms.css';
import React, { useState, useEffect } from 'react';
import Input from '../Components/Input';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

const Rooms = () => {
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
    const [activeInterval, setActiveInterval] = useState(null);
    const [error, setError] = useState(null);
    const [sections, setSections] = useState(null);
    const [inputValue, setInputValue] = useState("");
  
    const updateWindowWidth = () => {
        setWindowWidth(document.documentElement.clientWidth);
    };
    useEffect(() => {
        window.addEventListener('resize', updateWindowWidth);
        return () => {
            window.removeEventListener('resize', updateWindowWidth);
        };
    }, []);

    const startInterval = (name, project_id) => {
        console.log("Started: " + name)
    };
  
    const endInterval = () => {
        console.log("Ended Interval")
    }

    const backgroundStyle = { 
        backgroundImage: 'url("/FocusIntervals.png")', // Specify the path to your image relative to the public directory
        backgroundSize: 'cover',
        backgroundPosition: 'center calc(50% + 10px)',
        height: '100vh',
    };

    return (
        <div className='App' style={backgroundStyle}>
            {error !== null && <div style={{position: "absolute", textAlign: 'center', top: "35px", left: "calc(50vw - 100px)", backgroundColor: 'red', width: "200px", height: "87px", zIndex: 101}}>
                <p>Error: {error}</p>
                <button onClick={() => {setError(null)}} style={{position: "absolute", width: "50px", bottom: "10px", left: "calc(50% - 25px)"}}>Ok</button>
            </div>}
            <Header ToggleMenu={() => {setCollapsedMenu(!collapsedMenu)}}/>
            <Sidebar collapsed={collapsedMenu}/>
            <Input 
                activeInterval={activeInterval} 
                addInterval={() => {startInterval}} 
                endInterval={() => {endInterval}} 
                inputWidth = {windowWidth - (collapsedMenu ? 58 : 198) + "px"}
                addProject = {() => {console.log("Added Project")}}
                value={inputValue}
                setValue={setInputValue}
            />
            <div className="TimeSections" style={{width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}`}}>
                <div style={{
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

export default Rooms;