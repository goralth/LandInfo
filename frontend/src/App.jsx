import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Map from './components/Map';
import EntryForm from './components/EntryForm';
import RecordGrid from './components/RecordGrid';

const API_URL = 'http://localhost:5000/api';

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawnGeometry, setDrawnGeometry] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await axios.get(`${API_URL}/session`);
      if (res.data.user) {
        setUser(res.data.user);
        setRole(res.data.role);
        loadRecords();
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      if (res.data.success) {
        setUser(res.data.user);
        setRole(res.data.role);
        loadRecords();
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
    return false;
  };

  const handleLogout = async () => {
    await axios.post(`${API_URL}/logout`);
    setUser(null);
    setRole(null);
    setRecords([]);
  };

  const loadRecords = async () => {
    try {
      const res = await axios.get(`${API_URL}/parcels`);
      setRecords(res.data.features || []);
    } catch (error) {
      console.error('Load records failed:', error);
    }
  };

  const handleSave = async (formData) => {
    if (!drawnGeometry) {
      alert('Please draw a parcel on the map first');
      return false;
    }

    try {
      await axios.post(`${API_URL}/parcels`, {
        ...formData,
        geometry: drawnGeometry
      });
      loadRecords();
      setDrawnGeometry(null);
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <div className="user-info">
        <span>Logged in as: {user}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      <div className="header">
        <h1>LandInfo GIS – Parcel Capture POC</h1>
        <p className="subtitle">Draw parcel on map, capture attributes, save to DB.</p>
      </div>

      <div className="top-panel">
        <div className="entry-section">
          <EntryForm 
            role={role}
            selectedRecord={selectedRecord}
            onSave={handleSave}
            onClear={() => {
              setSelectedRecord(null);
              setDrawnGeometry(null);
            }}
          />
        </div>

        <div className="grid-section">
          <RecordGrid 
            records={records}
            onRefresh={loadRecords}
            onSelect={setSelectedRecord}
          />
        </div>
      </div>

      <div className="map-wrapper">
        <h2 style={{marginBottom: '10px', fontSize: '16px'}}>🗺️ Parcel Map – Bengaluru</h2>
        <Map 
          records={records}
          selectedRecord={selectedRecord}
          role={role}
          onDrawn={setDrawnGeometry}
        />
      </div>
    </div>
  );
}

export default App;
