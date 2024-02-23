import 'react-date-range/dist/styles.css';
import '../Styles/Reports.css';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';
import ProjectsDropdown from '../Components/ProjectsDropdown';
import ReportsSection from '../Components/ReportsSection';

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
    const [projectIdMapping, setProjectIdMapping] = useState({});
    const [dropdown, setDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [project, setProject] = useState({
        color: "white",
        project_id: null,
        name: "All Projects"
    });
    const [sections, setSections] = useState([]);

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
                hashmap[project.project_id] = project;
            }
            hashmap[null] = {
                color: "white",
                name: "All Projects",
                project_id: "",
                user_id: ""
            }
            setProjectIdMapping(hashmap);
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

    const filterIntervals = (range, project) => {
        if (!userInfo) {
            return;
        }
        const filteredIntervals = intervals.filter((interval) =>
            new Date(interval.start_time) >= range.startDate
            && new Date(interval.start_time) <= range.endDate
            && (project.project_id ? interval.project_id == project.project_id : true)
        );
        const hashmap = {};
        const projectTimes = {};
        let time = 0;  // total time in seconds
        filteredIntervals.forEach(interval => {
            if (!hashmap[interval.project_id]) {
                hashmap[interval.project_id] = {};
                projectTimes[interval.project_id] = { hours: 0, minutes: 0, seconds: 0 };
            }
            if (!hashmap[interval.project_id][interval.name]) {
                hashmap[interval.project_id][interval.name] = [];
            }
            const st = new Date(interval.start_time)
            const et = new Date(interval.end_time)
            const timeDifference = et - st;
            // add to total time
            time += Math.floor(timeDifference / 1000);
            // add to project time
            projectTimes[interval.project_id].hours += Math.floor(timeDifference / 3600000);
            projectTimes[interval.project_id].minutes += Math.floor((timeDifference % 3600000) / 60000);
            projectTimes[interval.project_id].seconds += Math.floor((timeDifference % 60000) / 1000);
            // set interval time
            interval.hours = Math.floor(timeDifference / 3600000);
            interval.minutes = Math.floor((timeDifference % 3600000) / 60000);
            interval.seconds = Math.floor((timeDifference % 60000) / 1000);

            hashmap[interval.project_id][interval.name].push(interval);
        });
        const sectionElements = [];
        for (let project_id in hashmap) {
            const projectTimeObject = projectTimes[project_id];
            const projectTotalTime = projectTimeObject.seconds + 60 * projectTimeObject.minutes + 3600 * projectTimeObject.hours;
            sectionElements.push(<ReportsSection
                project={projectIdMapping[project_id]}
                intervals={hashmap[project_id]}
                key={project_id}
                time={projectTimes[project_id]}
                percent={projectTotalTime / time * 100 < 1 ? Math.ceil(projectTotalTime / time * 100) : Math.floor(projectTotalTime / time * 100)}
            />);
        }
        console.log(filteredIntervals);
        console.log(project);
        setSections(sectionElements);
    }

    // updates selected intervals
    useEffect(() => {
        filterIntervals(selectionRange, project);
        setDropdown(false);
        setDayMenu(false);
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
            <div className='pageContents' style={{ left: `${collapsedMenu ? '58px' : '198px'}`, width: `calc(100% - ${collapsedMenu ? '68px' : '198px'})` }}>
                <div id="selectionButtons">
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
                    <button className="Project" onClick={() => { setDropdown(!dropdown) }}>
                        <span style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", display: 'inline-block', color: project.color, overflow: "hidden" }}>{"Project: " + project.name}</span>
                    </button>
                    {dayMenu &&
                        <div ref={dayMenuRef} style={{ position: 'absolute', left: '0px', top: '50px', borderRadius: "10px", overflow: "hidden" }}>
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
                        <div ref={dropdownRef} style={{ position: "absolute", top: "-10px" }}>
                            <ProjectsDropdown
                                projects={projects}
                                selectProject={selectProject}
                                left={"250px"}
                                defaultProjectName={"All Projects"}
                            />
                        </div>
                    }
                </div>
                <div id="sections">
                    {sections}
                </div>
            </div>
        </div>
    );
}

export default Reports;
