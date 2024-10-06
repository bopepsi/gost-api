// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const cors = require('cors'); // Import cors

const app = express();
const port = process.env.PORT || 5000; // Use the port defined in .env or default to 3000

app.use(cors());

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(express.json());

app.use(express.static('public'));

// Routes

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/auth', authRoutes); // User login/signup routes
app.use('/api/invoices', invoiceRoutes); // CRUD routes for invoices

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
