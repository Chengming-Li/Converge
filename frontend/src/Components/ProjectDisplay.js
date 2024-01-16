import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Components.css';
import ColorPicker from './ColorPicker';

function ProjectDisplay({ info, intervals, screenWidth, editProject, createProject, deleteProject }) {
    const calcTotalTime = (intervals) => {
        let hours = 0;
        for (const interval of intervals) {
            const st = new Date(interval.start_time)
            const et = new Date(interval.end_time)
            const timeDifference = et - st;
            hours += Math.floor(timeDifference / 3600000);
        }
        return String(hours) + "h";
    }
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [name, setName] = useState(info.name);
    const [value, setValue] = useState(info.name);
    const [color, setColor] = useState(info.color);
    const [totalTime, setTotalTime] = useState(calcTotalTime(intervals));
    const [showPicker, setShowPicker] = useState(false);
    const colorPickerRef = useRef(null);
    const dropdownRef = useRef(null);
    const isInitialRender = useRef(true);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const handleNameChange = (event) => {
        if (event.target.value.length <= 110) {
            setValue(event.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));
        }
    };

    const changeName = () => {
        if (value.length === 0) {
            setValue("New Project");
            setName("New Project");
        }
        else if (value !== name) {
            setName(value);
        }
    }

    useEffect(() => {
        const handleEditClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleEditClickOutside);
        const handleColorClickOutside = (event) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        }
        document.addEventListener('mousedown', handleColorClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleEditClickOutside);
            document.removeEventListener('mousedown', handleColorClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        editProject(info.project_id, name, color);
    }, [name, color]);

    return (
        <div className='ProjectDisplay'>
            <button id="colorButton" onClick={() => { setShowPicker(!showPicker) }} style={{ userSelect: "none", position: "absolute", width: "40px", backgroundColor: color, color: color, height: "40px", borderRadius: "50%" }}>Hi</button>
            <input className="ProjectName" value={value} onChange={handleNameChange} onKeyDown={handleKeyPress} onBlur={changeName} style={{
                color: color,
                width: `${screenWidth > 570 ? screenWidth - 455 : screenWidth - 370}px`
            }}></input>
            <p style={{ display: `${screenWidth > 570 ? "block" : "none"}`, position: "absolute", top: "4px", right: "49px", fontWeight: "100", fontSize: "20px" }}>{totalTime}</p>
            <button id="Edit" onClick={() => { setMenuIsOpen(true) }}><img src={'/options.png'} alt="edit" /></button>
            {showPicker &&
                <div ref={colorPickerRef}>
                    <ColorPicker setColor={setColor} setShowPicker={setShowPicker} />
                </div>
            }
            {menuIsOpen && (
                <div className="EditMenu" ref={dropdownRef}>
                    <button id='delete' onClick={() => { deleteProject(info.project_id); setMenuIsOpen(false); }}>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProjectDisplay;