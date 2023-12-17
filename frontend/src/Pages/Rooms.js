import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import '../Styles/Rooms.css';

const Rooms = () => {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [joinedRoom, setJoinedRoom] = useState(false);

    useEffect(() => {
        const newSocket = io.connect('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('message', (data) => {
            setReceivedMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        if (message.trim() !== '' && socket !== null) {
            console.log(message)
            socket.emit('message', {'msg': message, 'room': room, 'username': username});
            setMessage('');
        }
    };

    const joinRoom = () => {
        if (room.trim() !== '' && socket !== null) {
            setJoinedRoom(true);
            socket.emit('join', {'room': room.trim(), 'username': username});
        };
    }

    const leaveRoom = () => {
        socket.emit('leave', {'room': room, 'username': username});
        setJoinedRoom(false);
        setReceivedMessages([])
    }

    return (joinedRoom ?
        <div className='App'>
            <input type="text" value={message} id="message" placeholder="Message" onChange={(event) => (setMessage(event.target.value))}></input>
            <button id="sendBtn" onClick={sendMessage}>Send</button>
            <button id="leaveBtn" onClick={leaveRoom}>Leave Room</button>
            <div>
                {receivedMessages.map((item, index) => (
                    <p key={index}>{item}</p>
                ))}
            </div>
        </div> :
        <div className='App'>
            <input type="text" value={username} id="username" placeholder="Username" onChange={(event) => (setUsername(event.target.value))}></input>
            <input type="text" value={room} id="room" placeholder="Room" onChange={(event) => (setRoom(event.target.value))}></input>
            <button id="joinBtn" onClick={joinRoom}>Join Room</button>
        </div>
    )
}

export default Rooms;