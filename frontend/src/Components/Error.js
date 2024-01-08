import React, { useState } from 'react';
import '../Styles/Components.css';

function Error({ messages, setMessages }) {

    return (
        <div style={{ position: "absolute", width: "auto", height: "auto", right: "10px", bottom: "2px" }}>
            {
                messages.map((error, index) => [
                    <div className='error' key={error}>
                        <button onClick={() => {
                            setMessages(messages.slice(0, index).concat(messages.slice(index + 1)));
                        }}>X</button>
                        <span>{error}</span>
                    </div>
                ])
            }
        </div>
    )
}

export default Error;