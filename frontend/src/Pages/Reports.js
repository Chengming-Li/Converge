import '../Styles/Reports.css';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';

const userID = "931452152733499393";
const userDataAPI = "http://localhost:5000/api/user/"

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [errors, setErrors] = useState([]);
    const [userInfo, setUserInfo] = useState(null);

    const [intervals, setIntervals] = useState([]);
    const [projects, setProjects] = useState([]);

    const getIntervals = (startDate, endDate, project) => {
        return intervals.filter(interval => {
            const date = interval.start_time;
            console.log(new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: "EST" })));
        });
    }

    useEffect(() => {
        fetch(userDataAPI + userID).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).then((data) => {
            setUserInfo(data.userInfo);
            setIntervals(data.intervals);
            setProjects(data.projects);
            setLoading(false);
        }).catch((error) => {
            setErrors(oldErrors => [...oldErrors, error.message]);
            setLoading(false);
        });
    }, []);

    console.log(intervals);
    console.log(projects);
    const january19_2024 = new Date('2024-01-19');
    console.log(getIntervals(january19_2024));

    return (
        <div className='App'>
            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={userInfo ? userInfo.username : "No User"} pfp={userInfo ? userInfo.profile_picture : null} />
        </div>
    );
}

export default Reports;