const socketIo = require('socket.io');

let io;

const setupSocket = (server) => {
    io = socketIo(server);
    return io;
};

const getSocket = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

module.exports = { setupSocket, getSocket };