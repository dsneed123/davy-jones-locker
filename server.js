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

// Log IP addresses
app.use(async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();
    
    try {
        // Read existing IPs
        let ipData = [];
        try {
            const data = await fs.readFile('ips.json', 'utf8');
            ipData = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, create new array
        }

        // Add new IP entry
        ipData.push({ ip, timestamp });

        // Write back to file
        await fs.writeFile('ips.json', JSON.stringify(ipData, null, 2));
        console.log(`Logged IP: ${ip} at ${timestamp}`);
    } catch (error) {
        console.error('Error logging IP:', error);
    }

    next();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});