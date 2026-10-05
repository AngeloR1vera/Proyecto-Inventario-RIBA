const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ estado: 'Backend de RIBA funcionando' });
});

app.use(errorHandler);

module.exports = app;