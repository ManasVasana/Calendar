const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For hashing passwords

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'mysql-b786-manas.l.aivencloud.com',        // e.g., mysql-xxxxx.aivencloud.com
    user: 'avnadmin',         // e.g., avnadmin
    password: 'AVNS_fT03HJSR9oupuj1DBHr',     // e.g., your-Aiven-password
    database: 'calendar',// e.g., defaultdb
    port: 12263,                    // Default MySQL port
    ssl: {
        rejectUnauthorized: false  // SSL configuration required for Aiven
    }
  });


app.use(express.json());

app.listen(1000, () => {
  console.log('Server is running on port 1000');
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
      const match = await bcrypt.compare(password, user.password); // assuming password is hashed
  
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
      // Check if username already exists
      const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
      db.query(checkUserQuery, [username], async (err, results) => {
        if (err) {
          console.error('Database error during username check:', err);
          return res.status(500).send('Internal server error');
        }
  
        if (results.length > 0) {
          return res.status(409).json({ message: 'Username already exists. Please choose another one.' });
        }
  
        // Proceed with hashing and inserting
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
  