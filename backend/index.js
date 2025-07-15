const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Demo = require('./models/Demo');

const app = express();

app.use(cors());
app.use(express.json()); // ✅ This should come BEFORE your routes

// Connect to MongoDB using MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB successfully"))
.catch(err => console.log(err));

// Test route to insert data
app.post('/add-demo', async (req, res) => {
  const { name, age } = req.body;

  const demo = new Demo({
    name,
    age
  });

  try {
    const savedDemo = await demo.save();
    res.status(201).json(savedDemo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
