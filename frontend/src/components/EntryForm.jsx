import React, { useState, useEffect } from 'react';

function EntryForm({ role, selectedRecord, onSave, onClear }) {
  const [owner, setOwner] = useState('');
  const [landUse, setLandUse] = useState('Agriculture');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (selectedRecord) {
      setOwner(selectedRecord.properties.owner_name);
      setLandUse(selectedRecord.properties.land_use);
      setArea(selectedRecord.properties.area_ha);
    }
  }, [selectedRecord]);

  const handleSave = async () => {
    const success = await onSave({
      owner_name: owner || 'Unknown',
      land_use: landUse,
      area_ha: parseFloat(area) || 0
    });

    if (success) {
      setOwner('');
      setLandUse('Agriculture');
      setArea('');
      setStatus({ type: 'success', message: 'Parcel saved successfully!' });
    } else {
      setStatus({ type: 'error', message: 'Save failed' });
    }
  };

  const handleClear = () => {
    setOwner('');
    setLandUse('Agriculture');
    setArea('');
    setStatus(null);
    onClear();
  };

  const handleFileUpload = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  if (role === 'viewer') {
    return (
      <div>
        <h2>📱 Field Entry</h2>
        <div style={{background: '#fef3c7', padding: '8px 12px', borderRadius: '8px', fontSize: '13px'}}>
          👁️ Viewer mode: View records only (login as editor for entry)
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>📱 Field Entry</h2>
      <div style={{fontSize: '13px', color: '#6b7280', background: '#eff6ff', borderRadius: '10px', padding: '8px 10px', marginBottom: '10px'}}>
        Step 1: Draw polygon on map → Step 2: Fill form → Step 3: Save
      </div>

      <label>
        📁 Upload GeoJSON
        <input type="file" accept=".geojson,.json" onChange={handleFileUpload} style={{flex: 1}} />
      </label>

      <label>
        Owner name
        <input 
          placeholder="Ramesh Kumar" 
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
      </label>

      <label>
        Land use
        <select value={landUse} onChange={(e) => setLandUse(e.target.value)}>
          <option>Agriculture</option>
          <option>Residential</option>
          <option>Forest</option>
          <option>Commercial</option>
        </select>
      </label>

      <label>
        Area (ha)
        <input 
          type="number" 
          step="0.1" 
          placeholder="2.5"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </label>

      <button className="btn-save" onClick={handleSave}>💾 Save & Clear Map</button>
      <button className="btn-clear" onClick={handleClear}>🗑️ Clear Form & Map</button>

      {status && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default EntryForm;
