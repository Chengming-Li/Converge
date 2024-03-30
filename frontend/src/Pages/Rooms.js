import io from 'socket.io-client';
import '../Styles/Rooms.css';
import React, { useState, useEffect } from 'react';
import Input from '../Components/Input';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import UserSection from '../Components/UserSection';
import Loading from '../Components/Loading';
import Error from '../Components/Error';
import { SHA256 } from 'crypto-js';

const backend = "http://localhost:5000";
const userDataAPI = backend + "/api/users";
const intervalsDataAPI = backend + "/api/intervals";
const userProjectsAPI = backend + "/api/project/user/";
const authenticateAPI = backend + "/authenticate";
const Rooms = () => {
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
    const [windowHeight, setWIndowHeight] = useState(document.documentElement.clientHeight);
    const [activeInterval, setActiveInterval] = useState(null);
    const [errors, setErrors] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [roomCode, setRoomCode] = useState('');
    const [room, setRoom] = useState('');
    const [socket, setSocket] = useState(null);

    const [loading, setLoading] = useState(true);

    const [thisUser, setThisUser] = useState({}); // active_interval, id, intervals, profile_picture, timeJoined, username
    const [userID, setUserID] = useState("");
    const [users, setUsers] = useState([]);  // active_interval, id, intervals, profile_picture, timeJoined, username
    const [username, setUsername] = useState("");

    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState({
        color: "white",
        project_id: null,
        name: "No Project"
    });

    useEffect(() => {
        const newSocket = io.connect(backend);
        fetch(authenticateAPI, { credentials: 'include' }).then((response) => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                } else {
                    console.log(response.json());
                    throw new Error(response.status);
                }
            }
            return response.json();
        }).then((data) => {
            setUserID(data.user_id);
            setSocket(newSocket);

            fetch(userDataAPI + "/" + data.user_id).then((response) => {
                if (!response.ok) {
                    console.log(response.json());
                    throw new Error(response.status);
                }
                return response.json();
            }).then((d) => {
                setThisUser({
                    active_interval: null,
                    id: data.user_id,
                    intervals: [],
                    profile_picture: d.users[0].profile_picture,
                    timeJoined: new Date(),
                    username: "Me",
                    name: d.users[0].username
                });
                setUsername(d.users[0].username);
                setLoading(false);
            }).catch((error) => {
                setErrors(oldErrors => [...oldErrors, error.message]);
                return;
            });

            fetch(userProjectsAPI + "/" + data.user_id).then((response) => {
                if (!response.ok) {
                    console.log(response.json());
                    throw new Error(response.status);
                }
                return response.json();
            }).then((d) => {
                setProjects(d);
            }).catch((error) => {
                setErrors(oldErrors => [...oldErrors, error.message]);
                return;
            })

            newSocket.on("error", (data) => {
                console.log(data);
                setErrors(oldErrors => [...oldErrors, data]);
            });
            newSocket.on('join', (data) => {
                setRoom(data);
                setLoading(false);
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
                    setErrors(oldErrors => [...oldErrors, error.message]);
                    return;
                });
            });
            newSocket.on("join_data", (data) => {
                setLoading(true);
                const keysString = Object.keys(data).join(', ');
                if (keysString.trim().length > 0) {
                    fetch(userDataAPI + "/" + keysString).then((response) => {
                        if (!response.ok) {
                            console.log(response.json());
                            throw new Error(response.status);
                        }
                        return response.json();
                    }).then((d) => {
                        const newUsers = [];
                        const intervalIDs = [];
                        for (const user of d.users) {
                            newUsers.push({
                                id: user.id,
                                active_intervalID: data[user.id]["active_interval"],
                                active_interval: null,
                                profile_picture: user.profile_picture,
                                username: user.username,
                                timeJoined: data[user.id]["timeJoined"],
                                intervalIDs: data[user.id]["intervals"],
                                intervals: []
                            });
                            if (data[user.id]["active_interval"]) {
                                intervalIDs.push(data[user.id]["active_interval"]);
                            }
                            intervalIDs.push(...data[user.id]["intervals"]);
                        }
                        if (intervalIDs.length > 0) {
                            fetch(intervalsDataAPI + "/" + intervalIDs.join(', ')).then((response) => {
                                if (!response.ok) {
                                    console.log(response.json());
                                    throw new Error(response.status);
                                }
                                return response.json();
                            }).then((intervalData) => {
                                for (const user of newUsers) {
                                    if (user.active_intervalID) {
                                        user.active_interval = intervalData[user.active_intervalID];
                                    }
                                    for (const intervalID of user.intervalIDs) {
                                        user.intervals.push(intervalData[intervalID]);
                                    }
                                }
                            }).catch((error) => {
                                setErrors(oldErrors => [...oldErrors, error.message]);
                                return;
                            });
                        }
                        setTimeout(() => {
                            setUsers(newUsers);
                            setLoading(false);
                        }, 350);
                    }).catch((error) => {
                        setErrors(oldErrors => [...oldErrors, error.message]);
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
                        name: data.interval_name
                    };
                    return [...oldUsers];
                });
            });
            newSocket.on("stop", (data) => {
                setUsers(oldUsers => {
                    let foundObject = oldUsers.find(obj => obj.id === data.user_id);
                    foundObject.active_interval = null;
                    foundObject.intervals.unshift({
                        project_id: data.project_id,
                        interval_id: data.interval_id,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        user_id: data.user_id,
                        name: data.name
                    });
                    return [...oldUsers];
                });
            });
            newSocket.on("stop feedback", (data) => {
                setThisUser(oldUser => {
                    oldUser.intervals = oldUser.intervals.filter(interval => !interval.newInterval);
                    oldUser.intervals.unshift({
                        name: data.name,
                        user_id: data.user_id,
                        project_id: data.project_id,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        interval_id: data.interval_id,
                        newInterval: false
                    });
                    return { ...oldUser };
                });
            });
            newSocket.on("edit", (data) => {
                setUsers(oldUsers => {
                    let foundObject = oldUsers.find(obj => obj.id === data.user_id);
                    foundObject.active_interval.name = data.interval_name;
                    foundObject.active_interval.project_id = data.projectID;
                    return [...oldUsers];
                });
            });
        }).catch((error) => {
            if (error.message === 'Unauthorized') {
                console.log("Hi");
                window.location.href = '/login';
            } else {
                setErrors(oldErrors => [...oldErrors, error.message]);
            }
            setErrors(oldErrors => [...oldErrors, error.message]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

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
        if (event.target.value.trim() === event.target.value && event.target.value.length <= 20) {
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
            setLoading(true);
            socket.emit('join', { "room": roomCode, 'ID': userID });
        }
    }
    const handleHostRoom = () => {
        socket.emit('host', { 'ID': userID });
        setLoading(true);
    }
    const handleLeaveRoom = () => {
        socket.emit('leave');
        setUsers([]);
        setActiveInterval(null);
        setRoom("");
        setInputValue("");
    }

    const startInterval = (name, project_id) => {
        if (activeInterval) {
            // make request
            socket.emit('edit_interval', { "name": name, "project_id": project_id });
            activeInterval.name = name;
        } else {
            socket.emit('start_interval', { "name": name, "project_id": project_id });
            const user_id = userID;
            const newInterval = { name, user_id, project_id, start_time: new Date() };
            setActiveInterval(newInterval);
        }
    };

    const endInterval = () => {
        if (!activeInterval) {
            return;
        }
        socket.emit('stop_interval');
        thisUser.intervals.unshift({
            name: activeInterval.name,
            user_id: activeInterval.user_id,
            project_id: activeInterval.project_id,
            start_time: activeInterval.start_time,
            end_time: new Date(),
            newInterval: true,
        })
        setActiveInterval(null);
        thisUser.active_interval = null;
    };

    const changeProject = (interval_id, project_id) => {
        socket.emit('change_project', { "interval_id": interval_id, "project_id": project_id });
    }

    const resumeInterval = (name, project_id) => {
        if (activeInterval) {
            // make request
            endInterval();
        }
        socket.emit('start_interval', { "name": name, "project_id": project_id });
        const user_id = userID;
        const newInterval = { name, user_id, project_id, start_time: new Date() };
        setActiveInterval(newInterval);
        setInputValue(name);
    };

    const backgroundStyle = {
        //backgroundImage: 'url("/RoomUI.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center calc(50% + 10px)',
        height: '100vh',
    };

    useEffect(() => {
        if (activeInterval) {
            activeInterval.project_id = activeProject.project_id;
        }
        setActiveInterval(oldActive => activeInterval);
    }, [activeProject]);

    return (
        <div className='App' style={backgroundStyle}>
            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={username ? username : "No User"} pfp={thisUser ? thisUser.profile_picture : null} />
            {
                room ?
                    <div>
                        <Input
                            activeInterval={activeInterval}
                            addInterval={startInterval}
                            endInterval={endInterval}
                            inputWidth={windowWidth - (collapsedMenu ? 58 : 198) + "px"}
                            value={inputValue}
                            setValue={setInputValue}
                            project={activeProject}
                            setProject={setActiveProject}
                            projects={projects}
                        />
                        <div className="Banner" style={{ width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}` }}>
                            <p id="Title">ROOM</p>
                            <p id="Code">{room}</p>
                        </div>
                        <div className="Users" style={{ width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}` }}>
                            <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
                                {[thisUser, ...users].map((user) => (
                                    <UserSection
                                        username={user.username}
                                        activeInterval={user.active_interval}
                                        pfp={"/pfp.png"}
                                        intervals={user.intervals}
                                        key={SHA256(user.id + user.timeJoined)}
                                        resumeInterval={user === thisUser ? resumeInterval : null}
                                        userActive={user === thisUser ? activeInterval : null}
                                        projects={user === thisUser ? projects : null}
                                        windowWidth={windowWidth}
                                        editInterval={changeProject}
                                    />
                                ))}
                            </div>
                        </div>
                        <button className='Leave' onClick={handleLeaveRoom} style={{ right: `${(windowWidth - (collapsedMenu ? 188 : 323)) / 2 + "px"}` }}>
                            Leave
                        </button>
                    </div> :
                    <div className='RoomsMenu' style={{
                        width: `${Math.min(windowWidth - (collapsedMenu ? 114 : 254), 370)}px`,
                        top: `${Math.max(0.53 * windowHeight, 300)}px`,
                        right: `${-20 + (windowWidth - (collapsedMenu ? 58 : 198) - Math.min(windowWidth - (collapsedMenu ? 114 : 254), 370)) / 2}px`,
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