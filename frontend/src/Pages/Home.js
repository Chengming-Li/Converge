import '../Styles/Home.css';
import React, { useState, useEffect } from 'react';
import Input from '../Components/Input';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Section from '../Components/Section';
import Error from '../Components/Error';
import moment from "moment-timezone";
import { SHA256 } from 'crypto-js';
import Loading from '../Components/Loading';
import ProjectsDropdown from '../Components/ProjectsDropdown';

const userID = "931452152733499393"
const userDataAPI = "http://localhost:5000/api/user/"
const intervalAPI = "http://localhost:5000/api/interval"
const endIntervalAPI = "http://localhost:5000/api/interval/end/"

const Home = () => {
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
    const [userInfo, setUserInfo] = useState(null);
    const [activeInterval, setActiveInterval] = useState(null);
    const [inactiveIntervals, setInactiveIntervals] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetch(userDataAPI + userID).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).then((data) => {
            setUserInfo(data.userInfo);
            setInactiveIntervals(data.intervals);
            setActiveInterval(data.activeInterval);
            setProjects(data.projects);
            setInputValue(data.activeInterval ? data.activeInterval.name : "")
            setLoading(false);
        }).catch((error) => {
            setErrors(oldErrors => [...oldErrors, error.message]);
            setLoading(false);
        });
    }, []);

    const startInterval = (name, project_id) => {
        if (activeInterval) {
            fetch(intervalAPI + "/" + activeInterval.interval_id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, project_id, start_time: activeInterval.start_time, end_time: null }),
            }).then((response) => {
                if (!response.ok) {
                    console.log(response.json());
                    throw new Error(response.status);
                }
                return response.json();
            }).catch((error) => {
                setErrors(oldErrors => [...oldErrors, error.message]);
            });
            activeInterval.name = name;
            activeInterval.project_id = project_id;
        } else {
            const user_id = userInfo.id
            // sets ActiveInterval so there's no delay, incorrect information will be updated after response
            setActiveInterval({ name, start_time: new Date() })
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
                // overwrites previously started ActiveInterval with correct data
                setActiveInterval({ name, user_id, project_id, interval_id, start_time, end_time })
            }).catch((error) => {
                setActiveInterval(null);
                setErrors(oldErrors => [...oldErrors, error.message]);
            });
        }
    };

    const endInterval = () => {
        if (!activeInterval) {
            return;
        }
        // let end_time, interval_id, name, project_id, start_time, user_id;
        const id = activeInterval.interval_id;
        const prevActive = activeInterval;
        const endedInterval = {
            name: prevActive.name,
            interval_id: prevActive.interval_id,
            project_id: prevActive.project_id,
            user_id: prevActive.user_id,
            start_time: prevActive.start_time,
            end_time: new Date()
        };
        setInactiveIntervals([endedInterval, ...inactiveIntervals]);
        setActiveInterval(null)
        fetch(endIntervalAPI + id, {
            method: 'PUT',
            headers: {},
            body: undefined,
        }).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).then((data) => {
            endedInterval.end_time = data.end_time;
        }).catch((error) => {
            setActiveInterval(prevActive);
            setInputValue(prevActive.name);
            setInactiveIntervals(inactiveIntervals.filter((item, index) => item !== endedInterval));
            setErrors(oldErrors => [...oldErrors, error.message]);
            return;
        });
    }

    const deleteInterval = (id) => {
        const indexToRemove = inactiveIntervals.findIndex((interval) => interval.interval_id === id);
        const removedInterval = indexToRemove !== -1 ? inactiveIntervals[indexToRemove] : null;
        const updatedList = inactiveIntervals.filter((interval) => interval.interval_id !== id);
        setInactiveIntervals(updatedList);
        fetch(intervalAPI + "/" + id, {
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
            setInactiveIntervals([removedInterval, ...inactiveIntervals]);
            setErrors(oldErrors => [...oldErrors, error.message]);
        });
    }

    const editInterval = (id, name, project_id, start_time, end_time) => {
        // if end_time is before start_time, add a day to end_time. If end_time is more than a day ahead of start_time, remove a day
        if (end_time < start_time) {
            end_time.setDate(end_time.getDate() + 1);
        } else if ((end_time - start_time) > (24 * 60 * 60 * 1000)) {
            end_time.setDate(end_time.getDate() - 1);
        }

        const st = moment(start_time).tz(userInfo.timezone).utc().format("dddd DD MMMM YYYY HH:mm:ss z");
        const et = moment(end_time).tz(userInfo.timezone).utc().format("dddd DD MMMM YYYY HH:mm:ss z");
        const indexToEdit = inactiveIntervals.findIndex((interval) => interval.interval_id === id);
        let copy;
        if (indexToEdit !== -1) {
            copy = Object.assign({}, inactiveIntervals[indexToEdit]);
            inactiveIntervals[indexToEdit].name = name;
            inactiveIntervals[indexToEdit].project_id = project_id;
            inactiveIntervals[indexToEdit].start_time = st;
            inactiveIntervals[indexToEdit].end_time = et;
        } else {
            return;
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
            // undos changes
            inactiveIntervals[indexToEdit].name = copy.name;
            inactiveIntervals[indexToEdit].project_id = copy.project_id;
            inactiveIntervals[indexToEdit].start_time = copy.start_time;
            inactiveIntervals[indexToEdit].end_time = copy.end_time;
            setErrors(oldErrors => [...oldErrors, error.message]);
        });
    }

    // separates intervals into sections by date
    const separateSections = () => {
        // sorts in descending order
        inactiveIntervals.sort((a, b) => {
            const dateA = new Date(a.start_time);
            const dateB = new Date(b.start_time);
            return dateB - dateA;
        });
        const output = [];
        const compareDates = (timeOne, timeTwo) => {
            const date1 = new Date(timeOne);
            const date2 = new Date(timeTwo);
            return (date1.getFullYear() === date2.getFullYear()) &&
                (date1.getMonth() === date2.getMonth()) &&
                (date1.getDate() === date2.getDate());
        }
        for (const element of inactiveIntervals) {
            // if no subarray matches the date of the current interval, add one
            if (output.length === 0 || !compareDates(output[output.length - 1][0].start_time, element.start_time)) {
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

        // each section's key is the hash of the relative time along with all the interval id's
        setSections((
            output.map((intervals, index) => (
                <Section
                    title={relativizeDates(intervals[0].start_time)}
                    totalTime={calcTotalTime(intervals)}
                    intervals={intervals}
                    deleteInterval={deleteInterval}
                    editInterval={editInterval}
                    rerender={separateSections}
                    resumeInterval={(name, project_id) => { setInputValue(name); startInterval(name, project_id) }}
                    key={SHA256(relativizeDates(intervals[0].start_time) + intervals.map(obj => obj.interval_id).join('')).toString()}
                />
            ))
        ))
    }

    const updateWindowWidth = () => {
        setWindowWidth(document.documentElement.clientWidth);
    };
    useEffect(() => {
        window.addEventListener('resize', updateWindowWidth);
        return () => {
            window.removeEventListener('resize', updateWindowWidth);
        };
    }, []);

    useEffect(() => {
        separateSections();
    }, [inactiveIntervals]);

    const addProject = () => {
        console.log("Added Project");
    }

    return (
        <div className='App'>

            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={"Username"} />
            <Input
                activeInterval={activeInterval}
                addInterval={startInterval}
                endInterval={endInterval}
                inputWidth={windowWidth - (collapsedMenu ? 58 : 198) + "px"}
                projects={projects}
                value={inputValue}
                setValue={setInputValue}
            />
            <div className="TimeSections" style={{ width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}` }}>
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

export default Home;