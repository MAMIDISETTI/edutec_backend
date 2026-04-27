require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ name: 'EduPortal API', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`EduPortal API running on http://localhost:${PORT}`);
  });
});
