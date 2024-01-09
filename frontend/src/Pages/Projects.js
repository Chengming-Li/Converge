import '../Styles/Home.css';
import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';
import ProjectDisplay from '../Components/ProjectDisplay';
import { SHA256 } from 'crypto-js';

const userID = "931452152733499393"
const userDataAPI = "http://localhost:5000/api/user/"

const Projects = () => {
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [inactiveIntervals, setInactiveIntervals] = useState([]);

    useEffect(() => {
        fetch(userDataAPI + userID).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).then((data) => {
            setProjects(data.projects);
            setInactiveIntervals(data.intervals);
            setLoading(false);
        }).catch((error) => {
            setErrors(oldErrors => [...oldErrors, error.message]);
            setLoading(false);
        });
    }, []);

    const updateWindowWidth = () => {
        setWindowWidth(document.documentElement.clientWidth);
    };
    useEffect(() => {
        window.addEventListener('resize', updateWindowWidth);
        return () => {
            window.removeEventListener('resize', updateWindowWidth);
        };
    }, []);

    return (
        <div className='App'>
            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={"Username"} />
            <div className="TimeSections" style={{ top: "65px", width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}` }}>
                <div className='ProjectLabels' style={{ marginBottom: "-12px", width: "100%", backgroundColor: "#171919", height: "30px" }}>
                    <span style={{ position: "absolute", left: "15px", textAlign: "center", top: "5px" }}>Color</span>
                    <span style={{ position: "absolute", left: "75px", textAlign: "center", top: "5px" }}>Name</span>
                    <span style={{ position: "absolute", right: "35px", textAlign: "center", top: "5px" }}>Total Time</span>
                </div>
                {projects.map((project, index) => (
                    <ProjectDisplay key={SHA256(project.project_id + project.color)} info={project} intervals={inactiveIntervals.filter(interval => interval.project_id === project.project_id)} />
                ))}
            </div>
        </div>
    );
}

export default Projects;