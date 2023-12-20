import io from 'socket.io-client';
import '../Styles/Rooms.css';
import React, { useState, useEffect } from 'react';
import Input from '../Components/Input';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

const Rooms = () => {
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
    const [windowHeight, setWIndowHeight] = useState(document.documentElement.clientHeight);
    const [activeInterval, setActiveInterval] = useState(null);
    const [error, setError] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [roomCode, setRoomCode] = useState('');
    const [room, setRoom] = useState('CODE');
  
    const updateWindowDimensions = () => {
        setWindowWidth(document.documentElement.clientWidth);
        setWIndowHeight(document.documentElement.clientHeight);
    };
    useEffect(() => {
        window.addEventListener('resize', updateWindowDimensions);
        return () => {
            window.removeEventListener('resize', updateWindowDimensions);
        };
    }, []);

    const handleRoomCodeInput = (event) => {
        if (event.target.value.trim() == event.target.value && event.target.value.length <= 20) {
            setRoomCode(event.target.value.toUpperCase());
        }
    };
    const handleRoomKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleJoinRoom();
            e.target.blur();
        }
    };
    const handleJoinRoom = () => {
        // join room
        if (roomCode) {
            setRoom(roomCode);
        }
    }
    const handleHostRoom = () => {
        // join room
    }

    const startInterval = (name, project_id) => {
        console.log("Started: " + name)
    };
  
    const endInterval = () => {
        console.log("Ended Interval")
    }

    const backgroundStyle = { 
        backgroundImage: 'url("/RoomUI.png")',
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
            {
                room ?
                <div>
                    <Input 
                        activeInterval={activeInterval} 
                        addInterval={startInterval} 
                        endInterval={endInterval} 
                        inputWidth = {windowWidth - (collapsedMenu ? 58 : 198) + "px"}
                        addProject = {() => {console.log("Added Project")}}
                        value={inputValue}
                        setValue={setInputValue}
                    />
                    <div className="Banner" style={{width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}`}}>
                        <p id="Title">FOCUS ROOM</p>
                        <p id="Code">{room}</p>
                    </div>
                </div> :
                <div className='RoomsMenu' style={{
                    width: `${Math.min(windowWidth - (collapsedMenu ? 114 : 254), 370)}px`,
                    top: `${Math.max(0.53 * windowHeight, 300)}px`,
                    right: `${-20 + (windowWidth - (collapsedMenu ? 58 : 198) - Math.min(windowWidth - (collapsedMenu ? 114 : 254), 370))/2}px`,
                }}>
                    <p id='Title'>Rooms</p>
                    <input
                        type="text"
                        value={roomCode}
                        onChange={handleRoomCodeInput}
                        onKeyDown={handleRoomKeyPress}
                        placeholder="Enter Room Code"
                    />
                    <button id="JoinButton" onClick={handleJoinRoom}>Join</button>
                    <button id="HostButton" onClick={handleHostRoom}>Host</button>
                </div>
            }
        </div> 
    );
}

export default Rooms;