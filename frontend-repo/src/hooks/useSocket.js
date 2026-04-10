import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

export const useSocket = (eventHandlers = {}) => {
  const socketRef = useRef(null);
  const handlersRef = useRef(eventHandlers);

  useEffect(() => {
    handlersRef.current = eventHandlers;
  });

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    const registerHandlers = () => {
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        socket.on(event, handler);
      });
    };

    registerHandlers();

    return () => {
      Object.keys(handlersRef.current).forEach((event) => {
        socket.off(event);
      });
      socket.disconnect();
    };
  }, []); 

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.off(event);
      socket.on(event, handler);
    });
  }, [eventHandlers]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected — event not emitted:', event);
    }
  }, []);

  return { socket: socketRef.current, emit };
};

export default useSocket;
