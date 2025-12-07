require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { GoogleGenAI } = require('@google/genai');
const { connectToDatabase, closeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const { addUserToLocals } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON (default small limit; text-only prompts)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'co-razer-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax'
  }
};

// Use MongoDB for session storage if MongoDB URI is provided
if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'co_razer_db',
    collectionName: 'sessions',
    touchAfter: 24 * 3600 // Lazy session update (in seconds)
  });
}

app.use(session(sessionConfig));

// Add user info to all responses
app.use(addUserToLocals);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));
// Serve browser build of `marked` at /vendor/marked/*
app.use('/vendor/marked', express.static(path.join(__dirname, 'node_modules', 'marked')));

// Serve /html/elements.html statically (no redirect)

// Authentication routes
app.use('/api/auth', authRoutes);

// Comment routes
app.use('/api/comments', commentRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (_, res) => res.json({ ok: true }));

// Fallback for root
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// AI endpoint (Gemini via @google/genai)
app.post('/api/ai', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GOOGLE_API_KEY environment variable.' });
    }

    const prompt = (req.body && req.body.prompt || '').toString().trim();
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const system = [
      'You are a concise, friendly coding mentor.',
      'Focus on practical, actionable guidance for web development.',
      'Prefer HTML, and CSS examples unless a language is specified.',
      'Include short runnable snippets and explain why they work.',
      'Avoid overly long digressions; be direct and clear.'
    ].join(' ');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${system}\n\nUser request:\n${prompt}`
    });

    return res.json({ text: response.text || '' });
  } catch (err) {
    console.error('AI route error:', err);
    const status = err && err.status ? err.status : 500;
    return res.status(status).json({ error: err && err.message ? err.message : 'AI request failed' });
  }
});

// Connect to database and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Co.Razer docs running at http://localhost:${PORT}`);
      console.log(`✓ Authentication system enabled`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⚠ Shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n⚠ Shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
