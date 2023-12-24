import React from 'react';
import SyncLoader from "react-spinners/SyncLoader";

function Loading() {
    return (
        <>
            <div style={{zIndex: 101, width: "100%", height: "100%", position: "absolute", top: "0px", left: "0px", backgroundColor: 'black', opacity: "70%"}}>
            </div>
            <div style={{zIndex: 102, transform: 'translate(-50%, -50%)', top: "50%", left: "50%", position: "absolute"}}>
                <SyncLoader color="#03A9F4" size={30} margin={10}/>
            </div>
            
        </>
    );
}

export default Loading;