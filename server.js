// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// HTML Routes
// Route to serve the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// Wildcard route to serve the index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API Routes
// Route to get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    res.json(JSON.parse(data));
  });
});

// Route to save a new note
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body; // Destructure the title and text from the request body
  const newNote = { id: uuidv4(), title, text }; // Create a new note with a unique ID

  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }

    const notes = JSON.parse(data); // Parse the existing notes
    notes.push(newNote); // Add the new note to the array

    fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save note' });
      }
      res.json(newNote); // Return the new note to the client
    });
  });
});

// Route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id; // Get the note ID from the request parameters

  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }

    let notes = JSON.parse(data); // Parse the existing notes
    notes = notes.filter(note => note.id !== noteId); // Remove the note with the specified ID

    fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete note' });
      }
      res.json({ success: true }); // Return a success response
    });
  });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
