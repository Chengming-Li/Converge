import '../Styles/Settings.css';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';

const userID = "931452152733499393"
const userDataAPI = "http://localhost:5000//api/user/settings/"

const Projects = () => {
    const [loading, setLoading] = useState(true);
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [errors, setErrors] = useState([]);
    const [username, setUsername] = useState("");
    const [timezone, setTimezone] = useState("America/Los_Angeles");
    const [pfp, setPfp] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    const [color, setColor] = useState(`rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`);

    useEffect(() => {
        fetch(userDataAPI + userID).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).then((data) => {
            setUsername(data.username);
            setTimezone(data.timezone);
            setPfp(data.profile_picture);
            setUserInfo(data);
            setLoading(false);
        }).catch((error) => {
            setErrors(oldErrors => [...oldErrors, error.message]);
            setLoading(false);
        });
    }, []);

    const isBase64Image = (str) => {
    };
    return (
        <div className='App'>
            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={username} />
            <div className='UserProfile' style={{
                width: `calc(100% - ${(collapsedMenu ? 250 : 404)}px)`,
                minWidth: `${(collapsedMenu ? 140 : 0) + 285}px`,
                maxWidth: "810px",
                transform: "translateX(-50%)",
                left: `calc(50% + ${collapsedMenu ? 30 : 100}px)`
            }}>
                <div style={{
                    width: "100%",
                    height: "70px",
                    backgroundColor: color,
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px",
                }} />
                <span>{username}</span>
                <button id="pfp">Upload Image</button>
                <img src={pfp ? `data:image/jpeg;base64,${pfp}` : "/pfp.png"} style={{
                    position: "absolute",
                    height: "150px",
                    width: "150px",
                    left: "4.5%",
                    top: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#0b0e0f"
                }} />
                <button id="saveChanges">Save Changes</button>
                <button id="discardChanges">Reset</button>
            </div>
        </div>
    );
}

export default Projects;