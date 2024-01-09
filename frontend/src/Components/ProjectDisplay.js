import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Components.css';

function ProjectDisplay({ info, intervals }) {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    console.log(intervals);
    console.log(info);
    return (
        <div className='ProjectDisplay'>
            <p>Hi</p>
            <button id="Edit" onClick={() => { setMenuIsOpen(!menuIsOpen) }}><img src={'/options.png'} alt="edit" /></button>
        </div>
    );
}

export default ProjectDisplay;