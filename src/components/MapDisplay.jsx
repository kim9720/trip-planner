import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

const MapDisplay = ({ trip }) => {
  useEffect(() => {
    if (!trip) return;

    // Create custom marker icons
    const createCustomIcon = (color, label) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            transform: translate(-50%, -50%);
          ">
            ${label}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
    };

    // Initialize map with better starting view
    const map = L.map('map', {
      zoomControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    }).setView(trip.current_location, 12);

    // Add a nicer tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control with better position
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add custom markers with better styling
    L.marker(trip.current_location, {
      icon: createCustomIcon('#4e73df', 'Start'),
      zIndexOffset: 1000
    }).addTo(map).bindPopup(`
      <div style="font-weight:bold;color:#4e73df">Current Location</div>
      <div>Lat: ${trip.current_location[0].toFixed(4)}</div>
      <div>Lng: ${trip.current_location[1].toFixed(4)}</div>
    `);

    L.marker(trip.pickup_location, {
      icon: createCustomIcon('#1cc88a', 'Pickup'),
      zIndexOffset: 1000
    }).addTo(map).bindPopup(`
      <div style="font-weight:bold;color:#1cc88a">Pickup Location</div>
      <div>Lat: ${trip.pickup_location[0].toFixed(4)}</div>
      <div>Lng: ${trip.pickup_location[1].toFixed(4)}</div>
    `);

    L.marker(trip.dropoff_location, {
      icon: createCustomIcon('#e74a3b', 'Dropoff'),
      zIndexOffset: 1000
    }).addTo(map).bindPopup(`
      <div style="font-weight:bold;color:#e74a3b">Dropoff Location</div>
      <div>Lat: ${trip.dropoff_location[0].toFixed(4)}</div>
      <div>Lng: ${trip.dropoff_location[1].toFixed(4)}</div>
    `);

    // Add route with better styling
    const routeControl = L.Routing.control({
      waypoints: [
        L.latLng(trip.current_location[0], trip.current_location[1]),
        L.latLng(trip.pickup_location[0], trip.pickup_location[1]),
        L.latLng(trip.dropoff_location[0], trip.dropoff_location[1]),
      ],
      routeWhileDragging: false,
      lineOptions: {
        styles: [{
          color: '#4e73df',
          weight: 5,
          opacity: 0.8,
          dashArray: '0',
          lineCap: 'round'
        }]
      },
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: 'smart',
      collapsible: true,
      autoRoute: true
    }).addTo(map);

    

    // Add custom legend with better styling
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'legend');
      div.style.backgroundColor = 'rgba(255,255,255,0.8)';
      div.style.padding = '10px';
      div.style.borderRadius = '5px';
      div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
      div.style.fontFamily = 'Arial, sans-serif';
      div.style.fontSize = '12px';
      div.style.color = '#333';
      
      div.innerHTML = `
        <h4 style="margin:0 0 8px 0;font-size:14px;color:#4e73df">Map Legend</h4>
        <div style="display:flex;align-items:center;margin-bottom:5px">
          <div style="background:#4e73df;width:12px;height:12px;border-radius:50%;margin-right:8px"></div>
          <span>Current Location</span>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:5px">
          <div style="background:#1cc88a;width:12px;height:12px;border-radius:50%;margin-right:8px"></div>
          <span>Pickup Location</span>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:5px">
          <div style="background:#e74a3b;width:12px;height:12px;border-radius:50%;margin-right:8px"></div>
          <span>Dropoff Location</span>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:5px">
          <div style="background:#4e73df;width:12px;height:3px;margin-right:8px"></div>
          <span>Route</span>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    // Add scale control
    L.control.scale({
      position: 'bottomleft',
      imperial: false,
      maxWidth: 200
    }).addTo(map);

    return () => {
      if (map) map.remove();
    };
  }, [trip]);

  return (
    <div className="card shadow-lg mt-4" style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}>
      <div className="card-header" style={{ 
        backgroundColor: '#f8f9fc',
        borderBottom: '1px solid #e3e6f0',
        padding: '1rem 1.5rem'
      }}>
        <h3 className="m-0 font-weight-bold text-primary">Trip Route Visualization</h3>
      </div>
      <div className="card-body p-0">
        <div 
          id="map" 
          style={{ 
            height: '500px', 
            width: '100%',
            borderRadius: '0 0 12px 12px'
          }}
        ></div>
      </div>
    </div>
  );
};

export default MapDisplay;