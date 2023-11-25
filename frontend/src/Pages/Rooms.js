import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Rooms = () => {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io.connect('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('message', (data) => {
            setReceivedMessages((prevMessages) => [...prevMessages, data]);
        });
    
        return () => {
            newSocket.emit('leave', {'room': room, 'username': username});
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        if (message.trim() !== '' && socket !== null) {
            socket.emit('join', {'room': room, 'username': username});
            socket.emit('message', {'msg': message, 'room': room, 'username': username});
            setMessage('');
        }
    };

    return (
        <>
            <input type="text" value={username} id="username" placeholder="Username" onChange={(event) => (setUsername(event.target.value))}></input>
            <input type="text" value={room} id="room" placeholder="Room" onChange={(event) => (setRoom(event.target.value))}></input>
            <input type="text" value={message} id="message" placeholder="Message" onChange={(event) => (setMessage(event.target.value))}></input>
            <button id="sendBtn" onClick={sendMessage}>Send</button>
            <div>
                {receivedMessages.map((item, index) => (
                    <p key={index}>{item}</p>
                ))}
            </div>
        </>
    )
}

export default Rooms;