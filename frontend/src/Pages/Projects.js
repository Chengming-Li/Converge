import '../Styles/Projects.css';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';
import ProjectDisplay from '../Components/ProjectDisplay';
import { SHA256 } from 'crypto-js';
import ColorPicker from '../Components/ColorPicker';

const userID = "931452152733499393"
const userDataAPI = "http://localhost:5000/api/user/"
const projectAPI = "http://localhost:5000/api/project"

const Projects = () => {
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [inactiveIntervals, setInactiveIntervals] = useState([]);
    const [color, setColor] = useState("#d92b2b");
    const [showPicker, setShowPicker] = useState(false);
    const colorPickerRef = useRef(null);
    const [name, setName] = useState("");
    const [userInfo, setUserInfo] = useState(null);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const handleNameChange = (event) => {
        if (event.target.value.length <= 110) {
            setName(event.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));
        }
    };

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
            setUserInfo(data.userInfo);
            setLoading(false);
        }).catch((error) => {
            setErrors(oldErrors => [...oldErrors, error.message]);
            setLoading(false);
        });


        const handleColorClickOutside = (event) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        }
        document.addEventListener('mousedown', handleColorClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleColorClickOutside);
        };
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

    const editProject = (project_id, name, color) => {
        const indexToEdit = projects.findIndex((project) => project.project_id === project_id);
        let copy;
        if (indexToEdit !== -1) {
            copy = Object.assign({}, projects[indexToEdit]);
            projects[indexToEdit].name = name;
            projects[indexToEdit].color = color;
        } else {
            return;
        }
        fetch(projectAPI + "/" + project_id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, color }),
        }).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).catch((error) => {
            // undos changes
            projects[indexToEdit].name = copy.name;
            projects[indexToEdit].color = copy.color;
            setErrors(oldErrors => [...oldErrors, error.message]);
        });
    }

    const deleteProject = (project_id) => {
        const indexToRemove = projects.findIndex((project) => project.project_id === project_id);
        const removedProject = indexToRemove !== -1 ? projects[indexToRemove] : null;
        const updatedList = projects.filter((project) => project.project_id !== project_id);
        setProjects(updatedList);
        fetch(projectAPI + "/" + project_id, {
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
            setProjects([removedProject, ...inactiveIntervals]);
            setErrors(oldErrors => [...oldErrors, error.message]);
        });
    }

    const createProject = (user_id, name, color) => {
        if (!name) {
            return;
        }
        if (projects.some(project => project.name === name)) {
            setErrors(oldErrors => [...oldErrors, "A project with that name already exists!"]);
            return;
        }
        setColor("#d92b2b");
        setName("");
        setProjects(
            [{ project_id: "TEMP", name, color, user_id }, ...projects.filter(project => project.project_id !== "TEMP")].sort((a, b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            })
        );
        fetch(projectAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, user_id, color })
        }).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).then((data) => {
            const project_id = data.id;
            setProjects(
                [{ project_id, name, color, user_id }, ...projects.filter(project => project.project_id !== "TEMP")].sort((a, b) => {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) {
                        return -1;
                    }
                    if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return 1;
                    }
                    return 0;
                })
            );
        }).catch((error) => {
            setErrors(oldErrors => [...oldErrors, error.message]);
        });
    }

    return (
        <div className='App'>
            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={userInfo ? userInfo.username : "No User"} />
            <div className="TimeSections" style={{ top: "85px", width: `${windowWidth - (collapsedMenu ? 114 : 254) + "px"}` }}>
                <div className='ProjectDisplay' style={{ marginBottom: "-2px", backgroundColor: "#171919", height: "70px", borderTopLeftRadius: "15px", borderTopRightRadius: "15px", borderBottomLeftRadius: projects.length == 0 ? "15px" : "0px", borderBottomRightRadius: projects.length == 0 ? "15px" : "0px" }}>
                    <button id="colorButton" onClick={() => { setShowPicker(!showPicker) }} style={{ userSelect: "none", position: "absolute", width: "40px", backgroundColor: color, color: color, height: "40px", borderRadius: "50%" }}>Hi</button>
                    <input
                        className="ProjectName"
                        placeholder="New Project"
                        value={name}
                        onChange={handleNameChange}
                        onKeyDown={handleKeyPress}
                        style={{
                            width: `${windowWidth - 410}px`,
                            backgroundColor: "#171919",
                            height: "40px"
                        }}
                    ></input>
                    <button id="add" style={{ userSelect: "none", position: "absolute", right: "17px", top: "7px", width: "55px", height: "55px" }} onClick={() => createProject(userID, name, color)}>
                        <img src={'/add.png'} alt="Add Project" style={{ position: "absolute", left: "0px", top: "0px", backgroundColor: "#171919", height: "100%" }} />
                    </button>
                </div>
                {showPicker &&
                    <div ref={colorPickerRef}>
                        <ColorPicker setColor={setColor} setShowPicker={setShowPicker} />
                    </div>
                }
                {projects.map((project, index) => (
                    <ProjectDisplay key={SHA256(project.project_id + project.color)}
                        editProject={editProject}
                        screenWidth={windowWidth + (collapsedMenu ? 140 : 0)}
                        info={project}
                        intervals={inactiveIntervals.filter(interval => interval.project_id === project.project_id)}
                        deleteProject={deleteProject}
                    />
                ))}
            </div>
        </div>
    );
}

export default Projects;