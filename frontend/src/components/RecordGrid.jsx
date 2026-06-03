import React from 'react';

function RecordGrid({ records, onRefresh, onSelect }) {
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
        <h2 style={{margin: 0, fontSize: '18px'}}>📋 Recent Parcels</h2>
        <button className="btn-refresh" onClick={onRefresh}>Refresh</button>
      </div>

      <div className="records-grid">
        {!records || records.length === 0 ? (
          <div style={{textAlign: 'center', color: '#9ca3af', padding: '30px 10px', fontStyle: 'italic'}}>
            No parcels yet.
          </div>
        ) : (
          records.map((r, index) => (
            <div 
              key={r.properties?.id || index}
              className="record-row"
              onClick={() => onSelect(r)}
            >
              <div style={{width: '40px', fontWeight: 700, color: '#1e40af', fontSize: '13px'}}>
                #{r.properties?.id || index + 1}
              </div>
              <div style={{flex: 1, fontSize: '13px', fontWeight: 500, color: '#111827'}}>
                {r.properties?.owner_name || 'Unknown'}
              </div>
              <div style={{width: '90px', fontSize: '12px', color: '#6b7280'}}>
                {r.properties?.land_use || 'N/A'}
              </div>
              <div style={{width: '70px', fontSize: '12px', color: '#059669', fontWeight: 700}}>
                {r.properties?.area_ha || '0'} ha
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{marginTop: '8px', fontSize: '12px', color: '#4b5563'}}>
        Total: {records?.length || 0} parcels
      </div>
    </div>
  );
}

export default RecordGrid;
