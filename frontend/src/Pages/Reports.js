import 'react-date-range/dist/styles.css';
import '../Styles/Reports.css';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';

import { DateRangePicker } from 'react-date-range';

const userID = "931452152733499393";
const userDataAPI = "http://localhost:5000/api/user/"

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [errors, setErrors] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [dayMenu, setDayMenu] = useState(false);
    const dayMenuRef = useRef(null);

    const [selectionRange, setSelectionRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
  	const [intervals, setIntervals] = useState([]);
    const [projects, setProjects] = useState([]);

    const getIntervals = (startDate, endDate, project) => {
        if (!userInfo) {
            return;
        }
        startDate = new Date(startDate + " 00:00 " + userInfo.timezone);
        endDate = new Date(endDate + " 00:00 " + userInfo.timezone);
        console.log(endDate);
        return intervals.filter(interval => new Date(interval.start_time) >= startDate).filter(interval => new Date(interval.start_time) < endDate);
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

        const handleClickOutside = (event) => {
            if (dayMenuRef.current && !dayMenuRef.current.contains(event.target)) {
                setDayMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (ranges) => {
        setSelectionRange(ranges.selection);
    }

    return (
        <div className='App'>
            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={userInfo ? userInfo.username : "No User"} pfp={userInfo ? userInfo.profile_picture : null} />
            <button className="dayMenuButton" onClick={() => { setDayMenu(true) }} style={{ left: `calc(${collapsedMenu ? '55px' : '125px'} + 50%)` }}>
				{"<   "} {selectionRange.startDate.toLocaleDateString('en-US', {
  					year: 'numeric',
  					month: '2-digit',
					day: '2-digit'
				})} - {selectionRange.endDate.toLocaleDateString('en-US', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				})} {"   >"}
			</button>
            {dayMenu &&
                <div ref={dayMenuRef} style={{ position: 'absolute', left: `calc(${collapsedMenu ? '55px' : '125px'} + 50%)`, transform: "translateX(-50%)", top: '120px', borderRadius: "10px", overflow: "hidden" }}>
                    <DateRangePicker
                        ranges={[selectionRange]}
                        onChange={handleSelect}
                        rangeColors={["darkslateblue"]}
                        className="dateRange"
                        fixedHeight={true}
                    />
                </div>}
        </div>
    );
}

export default Reports;
