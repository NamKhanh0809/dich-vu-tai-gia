const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // thay đổi khi có domain thật
        methods: ["GET", "POST"]
    }
});

// Lưu io vào app để dùng trong controller
app.set('io', io);

// Socket connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Register user to their personal room
    socket.on('register', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
