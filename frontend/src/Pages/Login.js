import '../Styles/Home.css';
import React, { useState, useEffect, useRef } from 'react';
import Header from '../Components/Header';
import Error from '../Components/Error';
import Loading from '../Components/Loading';

const LOGINPATH = "http://localhost:5000//authorize/google";

const Login = () => {
    const [collapsedMenu, setCollapsedMenu] = useState(false);
    const [errors, setErrors] = useState([]);

    const googleLogin = () => {
        window.location.href = LOGINPATH;
    }

    return (
        <div className='App'>
            <Error
                messages={errors}
                setMessages={setErrors}
            />
            <Header MenuHidden={true} />
            <button id="googleLogin" onClick={googleLogin}>Login</button>
        </div>
    );
}

export default Login;