import React from 'react';
import '../Styles/Components.css';

function ProjectsDropdown({ projects, selectProject }) {
    return (
        <div className='projects'>
            <p style={{ position: "absolute", transform: "translateX(-50%)", left: "50%", userSelect: 'none', color: '#75A4AE', top: "-3px", fontSize: "10px", whiteSpace: "nowrap" }}>Manage projects in the PROJECTS tab</p>
            {projects.map((project, index) => (
                <button key={project.project_id} onClick={selectProject} style={{ color: project.color }}>{project.name}</button>
            ))}
        </div>
    );
}

export default ProjectsDropdown;