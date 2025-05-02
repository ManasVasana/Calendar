const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For hashing passwords

app.use(cors());
app.use(express.json());
require('dotenv').config();


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,                
    ssl: {
        rejectUnauthorized: false  
    }
  });


app.use(express.json());

app.listen(1000, () => {
  console.log('Server is running on port 1000');
});

app.delete('/DeleteEvent/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const deleteEventQuery = "DELETE FROM events WHERE id = ?";

  db.query(deleteEventQuery, [eventId], (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ message: "Database error while deleting event." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event deleted successfully." });
  });
});


app.get('/GetEvents/:username', (req, res) => {
  const username = req.params.username;

  const getUserQuery = "SELECT id FROM users WHERE username = ?";
  db.query(getUserQuery, [username], (err, userResult) => {
    if (err) return res.status(500).json({ message: "DB error (user lookup)" });
    if (userResult.length === 0) return res.status(404).json({ message: "User not found" });

    const userId = userResult[0].id;

    const getEventsQuery = `
      SELECT id, user_id, event_title, event_date, start_time, end_time
      FROM events
      WHERE user_id = ?
      ORDER BY event_date ASC, start_time ASC
    `;
    db.query(getEventsQuery, [userId], (err, eventsResult) => {
      if (err) return res.status(500).json({ message: "DB error (events lookup)" });
      return res.status(200).json(eventsResult);
    });
  });
});

app.post("/Events", (req, res) => {
  const { username, title, date, startTime, endTime } = req.body;

  if (!title || !date || startTime === undefined || endTime === undefined || !username) {
    return res.status(400).json({ message: "Title, date, start time, end time, and username are required." });
  }

  if (startTime < 0 || startTime > 24 || endTime < 0 || endTime > 24) {
    return res.status(400).json({ message: "Start and end times must be between 0 and 24." });
  }

  const getUserQuery = "SELECT id FROM users WHERE username = ?";
  db.query(getUserQuery, [username], (err, userResult) => {
    if (err) return res.status(500).json({ message: "Database error (user lookup)" });
    if (userResult.length === 0) return res.status(404).json({ message: "User not found" });

    const userId = userResult[0].id;

    const insertEventQuery = `
      INSERT INTO events (user_id, event_title, event_date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertEventQuery, [userId, title, date, startTime, endTime], (err, result) => {
      if (err) {
        console.error("Error inserting event:", err);
        return res.status(500).json({ message: "Database error while inserting event." });
      }

      res.status(201).json({
        event_id: result.insertId,
        user_id: userId,
        username,
        title,
        date,
        startTime,
        endTime,
      });
    });
  });
});



app.post('/Login', (req, res) => {
    const { username, password} = req.body;
  
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
  
      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const user = results[0];
      const match = await bcrypt.compare(password, user.password); 
  
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      res.status(200).json({
        message: "Login success",
        username: user.username });
    });
  });
  
  app.post('/SignUp', async (req, res) => {
    const { username, password_hash } = req.body;

    try {
      const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
      db.query(checkUserQuery, [username], async (err, results) => {
        if (err) {
          console.error('Database error during username check:', err);
          return res.status(500).send('Internal server error');
        }
  
        if (results.length > 0) {
          return res.status(409).json({ message: 'Username already exists. Please choose another one.' });
        }
  
        const hashedPassword = await bcrypt.hash(password_hash, 10);
        const insertQuery = `
          INSERT INTO users (username, password)
          VALUES (?, ?)
        `;
  
        db.query(insertQuery, [username, hashedPassword], (err, result) => {
          if (err) {
            console.error('Database error during user insertion:', err);
            return res.status(500).send('Internal server error');
          }
  
          res.send('User registered successfully.');
        });
      });
  
    } catch (error) {
      console.error('Hashing error:', error);
      res.status(500).send('Internal server error');
    }
  });
  