import React from 'react';
import '../Styles/Components.css';

function ProjectsDropdown({ projects, selectProject }) {
    return (
        <div className='projects'>
            <p style={{ position: "absolute", left: "65px", userSelect: 'none', color: '#75A4AE', top: "-3px", fontSize: "10px", whiteSpace: "nowrap" }}>Manage projects in the PROJECTS tab</p>
            <button onClick={() => selectProject({ color: "white", project_id: null, name: "No Project" })} style={{ color: "white" }}>No Project</button>
            {projects.map((project, index) => (
                <button key={project.project_id} onClick={() => selectProject(project)} style={{ color: project.color }}>{project.name}</button>
            ))}
        </div>
    );
}

export default ProjectsDropdown;