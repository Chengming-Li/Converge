import 'react-date-range/dist/styles.css';
import '../Styles/Reports.css';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';
import ProjectsDropdown from '../Components/ProjectsDropdown';

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
    const [projectIdNameMapping, setProjectIdNameMapping] = useState({});
    const [dropdown, setDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [project, setProject] = useState({
        color: "white",
        project_id: null,
        name: "No Project"
    });
    const [sections, setSections] = useState({});

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
            const hashmap = {};
            for (const project of data.projects) {
                hashmap[project.project_id] = project.name;
            }
            setProjectIdNameMapping(hashmap);
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
        const handleProjectClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleProjectClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousedown', handleProjectClickOutside);
        };
    }, []);

    const handleSelect = (ranges) => {
        setSelectionRange(ranges.selection);
    }

    const selectProject = (p) => {
        setProject(p);
        setDropdown(false);
    }

    const separateIntervals = (selectedIntervals) => {
        const hashmap = {};
        selectedIntervals.forEach(interval => {
            if (!hashmap[interval.project_id]) {
                hashmap[interval.project_id] = {};
            }
            if (!hashmap[interval.project_id][interval.name]) {
                hashmap[interval.project_id][interval.name] = [];
            }
            hashmap[interval.project_id][interval.name].push(interval);
        });
        return hashmap;
    }

    const filterIntervals = (range, project) => {
        if (!userInfo) {
            return;
        }
        setSections(separateIntervals(intervals.filter((interval) =>
            new Date(interval.start_time) >= range.startDate
            && new Date(interval.start_time) <= range.endDate
            && (project ? interval.project == project.project_id : true)
        )));
    }

    useEffect(() => {
        filterIntervals(selectionRange, project);
    }, [selectionRange, project]);

    return (
        <div className='App'>
            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={userInfo ? userInfo.username : "No User"} pfp={userInfo ? userInfo.profile_picture : null} />
            <div className='buttonSection'>
                <button className="dayMenuButton" onClick={() => { setDayMenu(true) }}>
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
                <button id="Project" onClick={() => { setDropdown(!dropdown) }}>
                    <span style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", display: 'inline-block', color: project.color, width: `500px`, overflow: "hidden" }}>{"Project: " + project.name}</span>
                </button>
            </div>
            {dayMenu &&
                <div ref={dayMenuRef} style={{ position: 'absolute', left: `calc(${collapsedMenu ? '55px' : '125px'} + 50%)`, transform: "translateX(-50%)", top: '120px', borderRadius: "10px", overflow: "hidden" }}>
                    <DateRangePicker
                        ranges={[selectionRange]}
                        onChange={handleSelect}
                        rangeColors={["#005353"]}
                        className="dateRange"
                        fixedHeight={true}
                    />
                </div>
            }
            {dropdown &&
                <div ref={dropdownRef}>
                    <ProjectsDropdown
                        projects={projects}
                        selectProject={selectProject}
                    />
                </div>
            }
        </div>
    );
}

export default Reports;
