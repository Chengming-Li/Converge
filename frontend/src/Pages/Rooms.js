import io from 'socket.io-client';
import '../Styles/Rooms.css';
import React, { useState, useEffect } from 'react';
import Input from '../Components/Input';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import UserSection from '../Components/UserSection';

const userDataAPI = "http://localhost:5000/api/users"
const intervalsDataAPI = "http://localhost:5000/api/intervals"
const userIDs = ["928024115890290689", "928024337585373185", "928024346425458689", "928024359007387649", "928024370164203521", "928024381448749057", "928024391600209921", "928024400232022017", "928024409210814465", "928024417875197953", "928024426321412097", "928025913362939905", "928025921605763073", "928025931312431105", "928025938905333761", "928025946355236865", "928026047797690369", "928026055325384705"]
const Rooms = () => {
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
    const [windowHeight, setWIndowHeight] = useState(document.documentElement.clientHeight);
    const [activeInterval, setActiveInterval] = useState(null);
    const [error, setError] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [roomCode, setRoomCode] = useState('');
    const [room, setRoom] = useState('');
    const [socket, setSocket] = useState(null);

    const [thisUser, setThisUser] = useState({});
    const [userID, setUserID] = useState(userIDs[Math.floor(Math.random() * userIDs.length)]);  // active_interval, id, intervals, profile_picture, timeJoined, username
    const [users, setUsers] = useState([]);  // active_interval, id, intervals, profile_picture, timeJoined, username
    
    useEffect(() => {
        const newSocket = io.connect('http://localhost:5000');
        setSocket(newSocket);

        fetch(userDataAPI + "/" + userID).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).then((d) => {
            setThisUser({
                active_interval: null,
                id: userID,
                intervals: [],
                profile_picture: d.users[0].profile_picture, 
                timeJoined: new Date(),
                username: d.users[0].username
            });
        }).catch((error) => {
            setError(error.message);
            return;
        });

        const updateUserActive = (users, user_id, active_interval) => {
            let foundObject = users.find(obj => obj.id === user_id);
            foundObject.active_interval = active_interval;
            return users
        }
        const updateUserIntervals = (users, user_id, intervals) => {
            let foundObject = users.find(obj => obj.id === user_id);
            foundObject.active_interval = null;
            foundObject.intervals = intervals;
            return users
        }

        newSocket.on("error", (data) => {
            console.log(data);
            setError(data);
        });
        newSocket.on('join', (data) => {
            setRoom(data);
        });
        newSocket.on("join_room", (data) => {
            fetch(userDataAPI + "/" + data["user_id"]).then((response) => {
                if (!response.ok) {
                    console.log(response.json());
                    throw new Error(response.status);
                }
                return response.json();
            }).then((d) => {
                setUsers(oldUsers => [...oldUsers, {
                    id: d.users[0].id, 
                    profile_picture: d.users[0].profile_picture, 
                    username: d.users[0].username,
                    active_interval: null,
                    intervals: [],
                    timeJoined: data["timeJoined"]
                }])
            }).catch((error) => {
                setError(error.message);
                return;
            });
        });
        newSocket.on("join_data", (data) => {
            const keysString = Object.keys(data).join(', ');
            if(keysString.length > 0) {
                fetch(userDataAPI + "/" + keysString).then((response) => {
                    if (!response.ok) {
                        console.log(response.json());
                        throw new Error(response.status);
                    }
                    return response.json();
                }).then((d) => {
                    const newUsers = [];
                    const intervals = [];
                    for (const user of d.users) {
                        newUsers.push({
                            id: user.id,
                            active_interval: data[user.id]["active_interval"],
                            intervals: data[user.id]["intervals"],
                            profile_picture: user.profile_picture, 
                            username: user.username,
                            timeJoined: data[user.id]["timeJoined"]
                        });
                        if (data[user.id]["active_interval"]) {
                            intervals.push(data[user.id]["active_interval"]);
                        }
                        intervals.push(...data[user.id]["intervals"]);
                    }
                    if (intervals.length > 0) {
                        fetch(intervalsDataAPI + "/" + intervals.join(', ')).then((response) => {
                            if (!response.ok) {
                                console.log(response.json());
                                throw new Error(response.status);
                            }
                            return response.json();
                        }).then((d) => {
                            for (const user of newUsers) {
                                const intervalObj = [];
                                if (user.active_interval) {
                                    user.active_interval = d[user.active_interval];
                                }
                                for (const intervalID of user.intervals) {
                                    intervalObj.push(d[intervalID]);
                                }
                                user.intervals = intervalObj;
                            }
                        }).catch((error) => {
                            setError(error.message);
                            return;
                        });
                    }
                    setUsers(oldUsers => newUsers);
                }).catch((error) => {
                    setError(error.message);
                    return;
                });
            }
            
        });
        newSocket.on("leave", (data) => {
            setUsers(oldUsers => oldUsers.filter(user => user.id !== data));
        });
        newSocket.on("start", (data) => {
            setUsers(oldUsers => {
                let foundObject = oldUsers.find(obj => obj.id === data.user_id);
                foundObject.active_interval = {
                    project_id: data.project_id,
                    interval_id: data.interval_id,
                    start_time: data.start_time,
                    user_id: data.user_id,
                    interval_name: data.interval_name
                };
                return [...oldUsers];
            });
        });
        newSocket.on("stop", (data) => {
            setUsers(oldUsers => {
                let foundObject = oldUsers.find(obj => obj.id === data.user_id);
                foundObject.active_interval = null;
                foundObject.intervals.push({
                    project_id: data.project_id,
                    interval_id: data.interval_id,
                    start_time: data.start_time,
                    end_time: data.end_time,
                    user_id: data.user_id,
                    interval_name: data.interval_name
                });
                return [...oldUsers];
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        console.log(users);
    }, [users]);

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
        if (roomCode) {
            socket.emit('join', {"room": roomCode, 'ID': userID});
        }
    }
    const handleHostRoom = () => {
        socket.emit('host', {'ID': userID});
    }
    const handleLeaveRoom = () => {
        socket.emit('leave');
        setUsers([]);
    }

    const startInterval = (name, project_id) => {
        if (activeInterval) {
            // make request
            activeInterval.name = name;
        } else {
            socket.emit('start_interval', {"name": name, "project_id": project_id});
            const user_id = userID;
            setActiveInterval({name, user_id, project_id, start_time: new Date()});
        }
    };
  
    const endInterval = () => {
        if (!activeInterval) {
            return;
        }
        socket.emit('stop_interval');
        setActiveInterval(null);
    }

    const backgroundStyle = { 
        //backgroundImage: 'url("/RoomUI.png")',
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
                        <p id="Title">ROOM</p>
                        <p id="Code">{room}</p>
                    </div>
                    <div className="Users" style={{width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}`}}>
                        {[thisUser, ...users].map((user) => (
                            <UserSection 
                                username={user.username}
                                totalTime={"00:00:00"}
                                pfp={"/pfp.png"}
                                intervals={user.intervals}
                                key={user.id}
                            />
                        ))}
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