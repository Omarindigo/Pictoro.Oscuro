const express = require('express');
const path = require('path');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const chokidar = require('chokidar');

// Initialize express and socket.io
const app = express();
const server = require('http').createServer(app);
const io = socketIo(server);

// Configuration
const PORT = process.env.PORT || 5500;
const WATCH_EXTENSIONS = ['.py', '.html', '.css', '.js'];

// Serve static files from the 'static' and 'public' directories
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index and logo pages from the static directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/logo', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'logo.html'));
});

// API to fetch images
app.get('/api/images/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const imageDir = path.join(__dirname, 'public', 'images', category);

        // Ensure the directory exists
        const files = await fs.readdir(imageDir);
        const images = files.map(image => ({
            url: `/images/${category}/${image}`,
            info: {}  // You can extend this to include metadata if available
        }));

        res.json({ images });
    } catch (err) {
        console.error(`Error fetching images for category ${category}:`, err);
        res.status(404).json({ error: 'Category not found or images missing' });
    }
});

// Serve images
app.get('/images/:category/:image', (req, res) => {
    const { category, image } = req.params;
    const imagePath = path.join(__dirname, 'public', 'images', category, image);

    // Send the image file if it exists, otherwise send a fallback image
    res.sendFile(imagePath, err => {
        if (err) {
            console.error(`Error serving image ${imagePath}:`, err);
            res.status(404).sendFile(path.join(__dirname, 'public', 'images', 'fallback-image.jpg'));
        }
    });
});

// Live reloading with socket.io
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// File watching for live reload
const watcher = chokidar.watch('.', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
});

watcher.on('change', (filePath) => {
    if (WATCH_EXTENSIONS.includes(path.extname(filePath))) {
        console.log(`File ${filePath} has been changed`);
        io.emit('reload');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

