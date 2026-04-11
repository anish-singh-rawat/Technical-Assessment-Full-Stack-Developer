import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

export const useSocket = (eventHandlers = {}) => {
  const socketRef = useRef(null);
  const handlersRef = useRef(eventHandlers);

  // Keep handlers ref up to date without re-running the connection effect
  useEffect(() => {
    handlersRef.current = eventHandlers;
  });

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    // Register all event handlers
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // When the access token is refreshed, update the socket auth and reconnect
    const handleTokenRefresh = () => {
      const newToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      socket.auth = { token: newToken };
      socket.disconnect().connect();
    };
    window.addEventListener('auth:tokenRefreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('auth:tokenRefreshed', handleTokenRefresh);
      Object.keys(handlersRef.current).forEach((event) => socket.off(event));
      socket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-register handlers when they change (e.g. user context changes)
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
