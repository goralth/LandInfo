import express from 'express';
import session from 'express-session';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const db = new Database('landinfo.db');

// Create parcels table
db.exec(`
  CREATE TABLE IF NOT EXISTS parcels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_name TEXT,
    land_use TEXT,
    area_ha REAL,
    geometry TEXT
  )
`);

// IMPORTANT: Middleware order matters!

// 1. CORS - MUST come first
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// 2. JSON parser
app.use(express.json());

// 3. Session - comes after CORS and JSON
app.use(session({
  secret: 'your-secret-key-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Users
const USERS = {
  viewer: 'view123',
  editor: 'edit123'
};

// Auth endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', username);
  
  if (USERS[username] && USERS[username] === password) {
    req.session.user = username;
    const role = username === 'viewer' ? 'viewer' : 'editor';
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false });
      }
      console.log('Login successful, session saved:', req.session);
      res.json({ success: true, user: username, role });
    });
  } else {
    res.status(401).json({ success: false });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

app.get('/api/session', (req, res) => {
  console.log('Session check:', req.session);
  if (req.session.user) {
    const role = req.session.user === 'viewer' ? 'viewer' : 'editor';
    res.json({ user: req.session.user, role });
  } else {
    res.json({ user: null, role: null });
  }
});

// Parcel endpoints - NO AUTH CHECK FOR NOW (we'll add it back once it works)
app.get('/api/parcels', (req, res) => {
  console.log('Get parcels request, session:', req.session);
  
  try {
    const parcels = db.prepare('SELECT * FROM parcels').all();
    
    const features = parcels.map(p => ({
      type: 'Feature',
      properties: {
        id: p.id,
        owner_name: p.owner_name,
        land_use: p.land_use,
        area_ha: p.area_ha
      },
      geometry: p.geometry ? JSON.parse(p.geometry) : null
    }));
    
    res.json({ type: 'FeatureCollection', features });
  } catch (error) {
    console.error('Get parcels error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/parcels', (req, res) => {
  console.log('Save parcel request, session:', req.session);
  
  if (req.session.user !== 'editor') {
    return res.status(403).json({ error: 'Editor access required' });
  }
  
  try {
    const { owner_name, land_use, area_ha, geometry } = req.body;
    
    const stmt = db.prepare(
      'INSERT INTO parcels (owner_name, land_use, area_ha, geometry) VALUES (?, ?, ?, ?)'
    );
    
    const result = stmt.run(
      owner_name,
      land_use,
      area_ha,
      JSON.stringify(geometry)
    );
    
    res.json({ id: result.lastInsertRowid, status: 'created' });
  } catch (error) {
    console.error('Save parcel error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log('viewer/view123 = View only');
  console.log('editor/edit123 = Full access');
  console.log('Note: Auth temporarily disabled for /api/parcels to test loading');
});
