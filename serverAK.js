/**
 * Calendar Project - Server API (serverAK.js)
 * 
 * This Node.js server handles all backend operations for the Calendar application.
 * It provides RESTful API endpoints to manage appointments stored in a SQLite database.
 * 
 * The server supports operations to create, read, update, and delete appointments.
 * It also includes CORS support for cross-origin requests and uses JSON for data interchange.
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests

// Connect to the SQLite database
const db = new sqlite3.Database('./appointments.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create the appointments table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        description TEXT NOT NULL
    )
`);

// Route to fetch appointments by date and time (both optional)
app.get('/appointments', (req, res) => {
    const { date, time } = req.query;
    let query = 'SELECT * FROM appointments';
    let params = [];

    if (date && time) {
        query += ' WHERE date = ? AND time = ?';
        params = [date, time];
    } else if (date) {
        query += ' WHERE date = ?';
        params = [date];
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error fetching appointments.');
        }
        res.json(rows);
    });
});

// Route to count appointments by date within a range
app.get('/appointments/count', (req, res) => {
    const { startDate, endDate } = req.query;
    const query = `
        SELECT date, COUNT(*) as count
        FROM appointments
        WHERE date BETWEEN ? AND ?
        GROUP BY date
    `;
    db.all(query, [startDate, endDate], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error fetching appointment counts.');
        }
        res.json(rows);
    });
});

// Add a new appointment
app.post('/appointments', (req, res) => {
    const { date, time, description } = req.body;
    db.run('INSERT INTO appointments (date, time, description) VALUES (?, ?, ?)',
        [date, time, description],
        function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error adding appointment.');
            }
            res.json({ id: this.lastID, date, time, description });
        }
    );
});

// Delete an appointment
app.delete('/appointments/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM appointments WHERE id = ?', id, (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error deleting appointment.');
        }
        res.send('Appointment successfully deleted.');
    });
});

// Update an appointment
app.put('/appointments/:id', (req, res) => {
    const id = req.params.id;
    const { description } = req.body;
    db.run('UPDATE appointments SET description = ? WHERE id = ?', [description, id], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error updating appointment.');
        }
        db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error fetching updated appointment.');
            }
            res.json(row);
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});