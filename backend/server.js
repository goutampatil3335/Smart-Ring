const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS || '*',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

mongoose.connect(`${MONGO_URL}/${DB_NAME}`)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hashed_password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Health Record Schema
const healthRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  date: { type: String, required: true },
  avg_heart_rate: { type: Number, required: true },
  avg_temperature: { type: Number, required: true },
  avg_hrv: { type: Number, required: true },
  avg_risk_score: { type: Number, required: true },
  max_risk_score: { type: Number, required: true },
  total_alerts: { type: Number, required: true },
  profile_type: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'smart-ring-health-monitor-secret-key-2024';
const JWT_EXPIRATION = '24h';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ detail: 'Invalid or expired token' });
    }
    req.userId = decoded.user_id;
    next();
  });
};

// Helper Functions
const generateId = () => {
  return require('crypto').randomUUID();
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const createToken = (userId) => {
  return jwt.sign({ user_id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

// Routes

// Root route
app.get('/api', (req, res) => {
  res.json({ message: 'Smart Ring Health Monitor API' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    console.log("REGISTER REQUEST:", email, password, name);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const userId = generateId();
    
    const user = new User({
      id: userId,
      email,
      name,
      hashed_password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = createToken(userId);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN REQUEST:", email, password); // 👈 ADD THIS

    const user = await User.findOne({ email });
    console.log("USER FOUND:", user); // 👈 ADD THIS

    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, user.hashed_password);
    console.log("PASSWORD VALID:", isValid); // 👈 ADD THIS

    if (!isValid) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const token = createToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ detail: 'Failed to fetch user' });
  }
});

// Create health record
app.post('/api/health-records', authenticateToken, async (req, res) => {
  try {
    const {
      date,
      avg_heart_rate,
      avg_temperature,
      avg_hrv,
      avg_risk_score,
      max_risk_score,
      total_alerts,
      profile_type
    } = req.body;

    const recordId = generateId();
    
    const healthRecord = new HealthRecord({
      id: recordId,
      user_id: req.userId,
      date,
      avg_heart_rate,
      avg_temperature,
      avg_hrv,
      avg_risk_score,
      max_risk_score,
      total_alerts,
      profile_type
    });

    await healthRecord.save();

    res.status(201).json(healthRecord);
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ detail: 'Failed to create health record' });
  }
});

// Get health records
app.get('/api/health-records', authenticateToken, async (req, res) => {
  try {
    const records = await HealthRecord.find({ user_id: req.userId })
      .sort({ date: -1 })
      .limit(30)
      .select('-_id -__v');

    res.json(records);
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ detail: 'Failed to fetch health records' });
  }
});

// Compare health records
app.get('/api/health-records/compare', authenticateToken, async (req, res) => {
  try {
    const { date1, date2 } = req.query;

    const record1 = await HealthRecord.findOne({ user_id: req.userId, date: date1 }).select('-_id -__v');
    const record2 = await HealthRecord.findOne({ user_id: req.userId, date: date2 }).select('-_id -__v');

    res.json({
      date1,
      date2,
      record1,
      record2
    });
  } catch (error) {
    console.error('Compare health records error:', error);
    res.status(500).json({ detail: 'Failed to compare health records' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
