import React, { useState, useRef, useEffect } from 'react';
import '../Styles/Components.css';
import ProjectsDropdown from '../Components/ProjectsDropdown';

function UserInterval({ info, editInterval, resumeInterval, projects, windowWidth }) {
    const [startTime, setStartTime] = useState(new Date(info.start_time));
    const [endTime, setEndTime] = useState(new Date(info.end_time));
    const [intervalName, setIntervalName] = useState(info.name);
    const [projectId, setProjectId] = useState(info.project_id);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const isInitialRender = useRef(true);
    const [project, setProject] = useState(info.project_id ? projects.find(project => project.project_id === info.project_id) :
        {
            color: "white",
            project_id: null,
            name: "No Project"
        }
    );
    const [projectDropdown, setProjectDropdown] = useState(false);
    const projectDropdownRef = useRef(null);

    useEffect(() => {
        const handleEditClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleEditClickOutside);

        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setProjectDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleEditClickOutside);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function calculateTimeDifference() {
        const et = new Date(endTime);
        const st = new Date(startTime)
        if (et < st) {
            et.setDate(et.getDate() + 1);
        } else if ((et - st) > (24 * 60 * 60 * 1000)) {
            et.setDate(et.getDate() - 1);
        }

        const timeDifference = et - st;

        const hours = Math.floor(timeDifference / 3600000);
        const minutes = Math.floor((timeDifference % 3600000) / 60000);
        const seconds = Math.max(Math.floor((timeDifference % 60000) / 1000), 1);

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        return formattedHours + ":" + formattedMinutes + ":" + formattedSeconds
    }

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        editInterval(info.interval_id, project.project_id);
    }, [project]);

    return (
        <div className='Interval'>
            <p className="IntervalName" style={{ top: !resumeInterval ? "3px" : "-7px" }}>{intervalName}</p>
            {resumeInterval &&
                <button id="Project"
                    style={{
                        top: "38px",
                        color: project.color,
                        width: `${windowWidth - 430}px`
                    }}
                    onClick={() => { setProjectDropdown(true) }}>{"• " + (project ? project.name : "No Project")}</button>}
            <p id="TimeElapsed" style={{ display: "block", position: "absolute", top: "4px", right: "49px", fontWeight: "100", fontSize: "20px" }}>{calculateTimeDifference(startTime, endTime)}</p>
            {resumeInterval && <button id="Edit" onClick={() => { setMenuIsOpen(!menuIsOpen) }}><img src={'/options.png'} alt="edit" /></button>}
            {menuIsOpen && (
                <div className="EditMenu" ref={dropdownRef}>
                    <button id='resume' onClick={() => { resumeInterval(intervalName, projectId); setMenuIsOpen(false); }}>
                        Resume
                    </button>
                </div>
            )}
            {projectDropdown &&
                <div ref={projectDropdownRef}>
                    <ProjectsDropdown
                        projects={projects}
                        selectProject={(a) => { setProject(a); setProjectDropdown(false); }}
                        left={"0px"}
                        width={"100%"}
                    />
                </div>
            }
        </div>
    );
}

export default UserInterval;