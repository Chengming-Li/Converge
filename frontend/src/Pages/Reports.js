import '../Styles/Reports.css';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';

import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';

const userID = "931452152733499393";
const userDataAPI = "http://localhost:5000/api/user/"

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [errors, setErrors] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
	
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
    }, []);

	const customStyles = {
    	calendar: {
      		color: 'red',
    	},
   		ranges: {
      		background: 'blue',
    	},
	};

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
            <DateRangePicker
                ranges={[selectionRange]}
                onChange={handleSelect}
				rangeColors={["purple"]}
				className="dateRange"
				styles={customStyles}
            />
        </div>
    );
}

export default Reports;
