const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Log IP addresses and form data
app.use(async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();

    try {
        let ipData = [];
        try {
            const data = await fs.readFile('ips.json', 'utf8');
            ipData = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, create new array
        }

        ipData.push({ ip, timestamp, type: 'visit' });
        await fs.writeFile('ips.json', JSON.stringify(ipData, null, 2));
        console.log(`Logged IP: ${ip} at ${timestamp}`);
    } catch (error) {
        console.error('Error logging IP:', error);
    }

    next();
});

// Handle form submission to log email, name, and IP
app.post('/log-data', async (req, res) => {
    const { email, name } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();

    try {
        let ipData = [];
        try {
            const data = await fs.readFile('ips.json', 'utf8');
            ipData = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, create new array
        }

        ipData.push({ email, name, ip, timestamp, type: 'submission' });
        await fs.writeFile('ips.json', JSON.stringify(ipData, null, 2));
        console.log(`Logged data: ${email}, ${name}, ${ip} at ${timestamp}`);
        res.status(200).send('Data logged');
    } catch (error) {
        console.error('Error logging data:', error);
        res.status(500).send('Error logging data');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});