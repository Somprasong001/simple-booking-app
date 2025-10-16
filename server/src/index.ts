import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test Route
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));