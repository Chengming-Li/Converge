import React from 'react';
import '../Styles/Components.css';

function ProjectsDropdown({ projects, selectProject, left, width }) {
    return (
        <div className='projects' style={{ left: left, maxWidth: width }}>
            <p style={{ position: "absolute", left: "calc(50% - 85px)", userSelect: 'none', color: '#75A4AE', top: "-3px", fontSize: "10px", whiteSpace: "nowrap" }}>Manage projects in the PROJECTS tab</p>
            <button onClick={() => selectProject({ color: "white", project_id: null, name: "No Project" })} style={{ color: "white" }}>No Project</button>
            {projects.map((project, index) => (
                <button key={project.project_id} onClick={() => selectProject(project)} style={{ color: project.color, overflow: 'hidden', whiteSpace: 'nowrap' }}>{project.name}</button>
            ))}
        </div>
    );
}

export default ProjectsDropdown;