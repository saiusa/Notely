/**
 * services/socketService.js
 * Socket.io real-time event handling
 * Manages WebSocket connections and event listeners for live updates
 */

let socket = null;
let isConnecting = false;

class SocketService {
    /**
     * Initialize Socket.io connection
     * @param {string} url - Socket server URL (defaults to current origin)
     */
    static connect(url = window.location.origin) {
        if (socket?.connected) {
            console.log('✓ Socket already connected');
            return Promise.resolve(socket);
        }

        if (isConnecting) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (socket?.connected) {
                        clearInterval(checkInterval);
                        resolve(socket);
                    }
                }, 100);
            });
        }

        isConnecting = true;

        return new Promise((resolve, reject) => {
            try {
                // Dynamically import socket.io-client to avoid build issues if not installed
                import('socket.io-client').then(({ io }) => {
                    socket = io(url, {
                        auth: {
                            token: localStorage.getItem('auth_token'),
                        },
                        reconnection: true,
                        reconnectionDelay: 1000,
                        reconnectionDelayMax: 5000,
                        reconnectionAttempts: 5,
                    });

                    socket.on('connect', () => {
                        console.log('✓ Socket connected:', socket.id);
                        isConnecting = false;
                        resolve(socket);
                    });

                    socket.on('disconnect', () => {
                        console.log('✗ Socket disconnected');
                    });

                    socket.on('error', (error) => {
                        console.error('Socket error:', error);
                        isConnecting = false;
                        reject(error);
                    });
                }).catch(() => {
                    console.warn('Socket.io not installed, using polling fallback');
                    isConnecting = false;
                    reject(new Error('Socket.io client not available'));
                });
            } catch (error) {
                console.error('Failed to connect socket:', error);
                isConnecting = false;
                reject(error);
            }
        });
    }

    /**
     * Disconnect socket
     */
    static disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }

    /**
     * Listen to socket event
     */
    static on(event, callback) {
        if (!socket) {
            console.warn('Socket not connected');
            return;
        }
        socket.on(event, callback);
    }

    /**
     * Stop listening to socket event
     */
    static off(event, callback) {
        if (!socket) return;
        socket.off(event, callback);
    }

    /**
     * Emit socket event
     */
    static emit(event, data) {
        if (!socket?.connected) {
            console.warn('Socket not connected, cannot emit:', event);
            return;
        }
        socket.emit(event, data);
    }

    /**
     * Get socket instance
     */
    static getInstance() {
        return socket;
    }

    /**
     * Check if connected
     */
    static isConnected() {
        return socket?.connected || false;
    }
}

export default SocketService;
