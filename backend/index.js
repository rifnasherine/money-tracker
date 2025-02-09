require('dotenv').config();
console.log('MongoDB URL:', process.env.MONGO_URI);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction.js');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Routes
app.get('/api/test', (req, res) => {
  res.json('test ok2');
});

app.post('/api/transaction', async (req, res) => {
  try {
    const { name, description, datetime, price } = req.body;
    const transaction = await Transaction.create({ name, description, datetime, price });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.get('/api/transactions', async (req, res) => {
  await mongoose.connect(process.env.MONGO_URI);
  const transactions = await Transaction.find();
  res.json(transactions);
});

app.put('/api/transaction/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, datetime, price } = req.body;
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { name, description, datetime, price },
      { new: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction' });
  }
});

app.delete('/api/transaction/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting transaction' });
  }
});

// Start the server
app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});