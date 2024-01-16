import '../Styles/Settings.css';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';

const userID = "931452152733499393";
const userSettingsAPI = "http://localhost:5000//api/user/settings/";

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [timezoneMenuOpen, setTimezoneMenuOpen] = useState(false);
    const [errors, setErrors] = useState([]);
    const [username, setUsername] = useState("");
    const [timezone, setTimezone] = useState("America/Los_Angeles");
    const [pfp, setPfp] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    const [color, setColor] = useState(`rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`);
    const timezoneMenuRef = useRef(null);
    const [data, setData] = useState(new FileReader());

    useEffect(() => {
        fetch(userSettingsAPI + userID).then((response) => {
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

        const handleTimezoneClickOutside = (event) => {
            if (timezoneMenuRef.current && !timezoneMenuRef.current.contains(event.target)) {
                setTimezoneMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleTimezoneClickOutside);

        const handleImage = () => {
            setPfp(data.result);
        }
        data.addEventListener('load', handleImage);

        return () => {
            document.removeEventListener('mousedown', handleTimezoneClickOutside);
            data.removeEventListener('load', handleImage);
        };
    }, []);

    const resetSettings = () => {
        setUsername(userInfo.username);
        setPfp(userInfo.profile_picture);
        setTimezone(userInfo.timezone);
    }

    const saveSettings = (username, timezone, profile_picture) => {
        setLoading(true);
        fetch(userSettingsAPI + userID, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, timezone, profile_picture }),
        }).then((response) => {
            if (!response.ok) {
                console.log(response.json());
                throw new Error(response.status);
            }
            return response.json();
        }).then((data) => {
            setUserInfo({ username: data.username, timezone: data.timezone, profile_picture: data.profile_picture });
            setLoading(false);
        }).catch((error) => {
            resetSettings();
            setErrors(oldErrors => [...oldErrors, error.message]);
            setLoading(false);
        });
    }

    const handleNameChange = (event) => {
        if (event.target.value.length <= 40) {
            setUsername(event.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const handleImageUpload = (e) => {
        if (e.target.files.length <= 0) {
            return;
        }
        data.readAsDataURL(e.target.files[0]);
    }

    return (
        <div className='App'>
            {loading && <Loading />}
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header ToggleMenu={() => { setCollapsedMenu(!collapsedMenu) }} />
            <Sidebar collapsed={collapsedMenu} username={userInfo ? userInfo.username : "No User"} pfp={userInfo ? userInfo.profile_picture : null} />
            <div className='UserProfile' style={{
                width: `calc(100% - ${(collapsedMenu ? 250 : 404)}px)`,
                minWidth: `${(collapsedMenu ? 140 : 0) + 300}px`,
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
                <input
                    type="text"
                    value={username}
                    onChange={handleNameChange}
                    placeholder="Username"
                    id='username'
                    onKeyDown={handleKeyPress}
                />
                <img src={pfp ? pfp : "/pfp.png"} style={{
                    position: "absolute",
                    height: "150px",
                    width: "150px",
                    left: "4.5%",
                    top: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#0b0e0f"
                }} />
                <div className="H" >
                    <input title="Upload Image" id="pfp" type="file" accept="image/*" onChange={handleImageUpload} />
                    <p id='title'>Upload Image</p>
                </div>

                <span id="timezone" style={{ left: "calc(32.5% - 55px)" }}>Timezone:</span>
                <button id="timezone" onClick={() => { setTimezoneMenuOpen(true); }} style={{ width: "35%", left: "calc(32.5% + 55px)", top: "185px", height: "35px", backgroundColor: "gray", borderBottomLeftRadius: timezoneMenuOpen ? "0px" : "5px", borderBottomRightRadius: timezoneMenuOpen ? "0px" : "5px" }}>
                    <span>{timezone}</span>
                    <img src={"/dropdown.png"} style={{ height: "50%", position: "absolute", right: "10px", transform: "translateY(-50%)", top: "50%" }}></img>
                </button>

                {timezoneMenuOpen &&
                    <div className='timezoneMenu' ref={timezoneMenuRef}>
                        <button onClick={() => { setTimezone("America/Los_Angeles"); setTimezoneMenuOpen(false); }}>America/Los_Angeles</button>
                        <button onClick={() => { setTimezone("UTC"); setTimezoneMenuOpen(false); }}>UTC</button>
                        <button onClick={() => { setTimezone("GMT"); setTimezoneMenuOpen(false); }}>GMT</button>
                        <button onClick={() => { setTimezone("MST"); setTimezoneMenuOpen(false); }}>MST</button>
                        <button onClick={() => { setTimezone("EST"); setTimezoneMenuOpen(false); }} style={{ borderBottomLeftRadius: "5px", borderBottomRightRadius: "5px" }}>EST</button>
                    </div>
                }

                <button id="saveChanges" style={{
                    display: ((userInfo && userInfo.username === username && userInfo.profile_picture === pfp && userInfo.timezone === timezone) ? "None" : "block")
                }} onClick={() => saveSettings(username, timezone, pfp)}>Save Changes</button>
                <button id="discardChanges" style={{
                    display: ((userInfo && userInfo.username === username && userInfo.profile_picture === pfp && userInfo.timezone === timezone) ? "None" : "block")
                }} onClick={resetSettings}
                >Reset</button>
            </div>
        </div>
    );
}

export default Settings;