const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/purchases',   require('./routes/purchases'));
app.use('/api/transfers',   require('./routes/transfers'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/bases',       require('./routes/bases'));

// Health check
app.get('/', (req, res) => res.json({ message: 'MAMS Backend API is running!' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
