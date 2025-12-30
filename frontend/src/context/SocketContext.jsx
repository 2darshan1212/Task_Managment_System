import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        console.log('SocketProvider: Initializing socket connection...');

        const newSocket = io('http://localhost:5000', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully! ID:', newSocket.id);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected. Reason:', reason);
        });

        newSocket.on('connect_error', (error) => {
            console.log('Socket connection error:', error.message);
        });

        // Debug: Log all incoming events
        newSocket.onAny((eventName, ...args) => {
            console.log('Socket event received:', eventName, args);
        });

        setSocket(newSocket);

        return () => {
            console.log('SocketProvider: Closing socket connection');
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
