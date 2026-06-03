import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

function Map({ records, selectedRecord, role, onDrawn }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const parcelsLayerRef = useRef(null);
  const imageOverlayRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapRef.current).setView([12.9716, 77.5946], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);


      const imageUrl = '../assets/otherside.jpg';

      const imageBounds = [
        [-30, 18],
        [78, -83]
      ];

      imageOverlayRef.current = L.imageOverlay(imageUrl, imageBounds, {
        opacity: 0.8        
      }).addTo(map);

      // Geoman controls
      map.pm.addControls({
        position: 'topleft',
        drawPolygon: role === 'editor',
        drawCircle: false,
        drawMarker: false,
        drawPolyline: false,
        drawRectangle: false,
        drawCircleMarker: false
      });

      // Layer for parcels
      parcelsLayerRef.current = L.geoJSON([], {
        style: { color: '#f97316', weight: 3, fillOpacity: 0.4, fillColor: '#fed7aa' },
        onEachFeature: (f, l) => {
          l.bindPopup(
            `<strong>Parcel #${f.properties.id}</strong><br>` +
            `Owner: ${f.properties.owner_name}<br>` +
            `Use: ${f.properties.land_use}<br>` +
            `Area: ${f.properties.area_ha} ha`
          );
        }
      }).addTo(map);

      // Listen for drawn shapes
      map.on('pm:create', (e) => {
        const geojson = e.layer.toGeoJSON();
        onDrawn(geojson.geometry);
      });

      mapInstanceRef.current = map;
    }
  }, [role]);

  // Update parcels layer when records change
  useEffect(() => {
    if (parcelsLayerRef.current && records) {
      parcelsLayerRef.current.clearLayers();
      parcelsLayerRef.current.addData({
        type: 'FeatureCollection',
        features: records
      });

      if (records.length > 0) {
        const bounds = parcelsLayerRef.current.getBounds();
        mapInstanceRef.current.fitBounds(bounds.pad(0.1));
      }
    }
  }, [records]);

  // Zoom to selected record
  useEffect(() => {
    if (selectedRecord && selectedRecord.geometry && mapInstanceRef.current) {
      const layer = L.geoJSON(selectedRecord);
      mapInstanceRef.current.fitBounds(layer.getBounds().pad(0.1));
    }
  }, [selectedRecord]);

  return <div ref={mapRef} className="leaflet-container" />;
}

export default Map;
