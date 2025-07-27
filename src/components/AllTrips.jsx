import React, { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { FiInfo, FiMapPin, FiMap } from 'react-icons/fi';
import LogSheet from './LogSheet';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// CSS import - use CDN if this doesn't work
import 'leaflet/dist/leaflet.css';

// Set up Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const AllTrips = ({ onError }) => {
  const [driverId, setDriverId] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [showMapId, setShowMapId] = useState(null);
  const [mapInstances, setMapInstances] = useState({});

  useEffect(() => {
    return () => {
      // Cleanup all maps when component unmounts
      Object.values(mapInstances).forEach(map => {
        if (map) map.remove();
      });
    };
  }, [mapInstances]);

  const initializeMap = (trip, index) => {
    const mapId = `trip-map-${trip.id}`;
    const mapContainer = document.getElementById(mapId);
    
    if (!mapContainer || mapContainer._leaflet_map) return;

    const map = L.map(mapId, {
      zoomControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const color = ['#4e73df', '#1cc88a', '#e74a3b'][index % 3];

    // Add markers with custom icons
    const createCustomIcon = (label) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;transform:translate(-50%,-50%)">${label}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    L.marker(trip.current_location, {
      icon: createCustomIcon('S')
    }).addTo(map).bindPopup(`
      <div style="font-weight:bold;color:${color}">Start Location</div>
      <div>Lat: ${trip.current_location[0].toFixed(4)}</div>
      <div>Lng: ${trip.current_location[1].toFixed(4)}</div>
    `);

    L.marker(trip.pickup_location, {
      icon: createCustomIcon('P')
    }).addTo(map).bindPopup(`
      <div style="font-weight:bold;color:${color}">Pickup Location</div>
      <div>Lat: ${trip.pickup_location[0].toFixed(4)}</div>
      <div>Lng: ${trip.pickup_location[1].toFixed(4)}</div>
    `);

    L.marker(trip.dropoff_location, {
      icon: createCustomIcon('D')
    }).addTo(map).bindPopup(`
      <div style="font-weight:bold;color:${color}">Dropoff Location</div>
      <div>Lat: ${trip.dropoff_location[0].toFixed(4)}</div>
      <div>Lng: ${trip.dropoff_location[1].toFixed(4)}</div>
    `);

    // Add route
    L.Routing.control({
      waypoints: [
        L.latLng(trip.current_location[0], trip.current_location[1]),
        L.latLng(trip.pickup_location[0], trip.pickup_location[1]),
        L.latLng(trip.dropoff_location[0], trip.dropoff_location[1]),
      ],
      routeWhileDragging: false,
      lineOptions: { 
        styles: [{ 
          color, 
          weight: 5, 
          opacity: 0.8,
          dashArray: '0',
          lineCap: 'round'
        }] 
      },
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: 'smart',
    }).addTo(map);

    // Fit bounds to show all points
    const bounds = L.latLngBounds([
      trip.current_location,
      trip.pickup_location,
      trip.dropoff_location
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Store the map reference
    setMapInstances(prev => ({ ...prev, [trip.id]: map }));
  };

  const handleShowMap = (tripId, index) => {
    if (showMapId === tripId) {
      setShowMapId(null);
    } else {
      setShowMapId(tripId);
      const trip = trips.find(t => t.id === tripId);
      if (trip && !mapInstances[tripId]) {
        initializeMap(trip, index);
      }
    }
  };

  const handleFetchTrips = async () => {
    if (!driverId.trim()) {
      setError('Please enter a Driver ID');
      onError('Please enter a Driver ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`https://trip.uwamaatraders.com/api/trips/?driver_id=${driverId}`);
      const formattedTrips = response.data.map(trip => ({
        id: trip.id,
        driver_id: trip.driver_id,
        current_location: [trip.current_location_lat, trip.current_location_lng],
        pickup_location: [trip.pickup_location_lat, trip.pickup_location_lng],
        dropoff_location: [trip.dropoff_location_lat, trip.dropoff_location_lng],
        current_cycle_hours: trip.current_cycle_hours,
        created_at: trip.created_at,
        logs: trip.log_sheets,
      }));
      setTrips(formattedTrips);
      setLoading(false);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch trips';
      setError(errorMsg);
      onError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h1 className="display-5 mb-4 text-primary">All Trips for Driver</h1>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group mb-3">
            <input
              type="text"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              placeholder="Enter Driver ID (e.g., 98780)"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={handleFetchTrips}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Loading...
                </>
              ) : (
                'Fetch Trips'
              )}
            </button>
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        </div>
      </div>

      {trips.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-4">Trip List</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Created At</th>
                    <th>Current Location</th>
                    <th>Pickup Location</th>
                    <th>Dropoff Location</th>
                    <th>Cycle Hours</th>
                    <th>Logs</th>
                    <th>Map</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip, index) => (
                    <React.Fragment key={trip.id}>
                      <tr>
                        <td>{trip.id}</td>
                        <td>{new Date(trip.created_at).toLocaleString()}</td>
                        <td>{trip.current_location.map(x => x.toFixed(4)).join(', ')}</td>
                        <td>{trip.pickup_location.map(x => x.toFixed(4)).join(', ')}</td>
                        <td>{trip.dropoff_location.map(x => x.toFixed(4)).join(', ')}</td>
                        <td>{trip.current_cycle_hours}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                          >
                            {expandedTrip === trip.id ? 'Hide Logs' : 'Show Logs'}
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleShowMap(trip.id, index)}
                          >
                            <FiMap className="me-1" />
                            {showMapId === trip.id ? 'Hide Map' : 'Show Map'}
                          </button>
                        </td>
                      </tr>
                      {expandedTrip === trip.id && (
                        <tr>
                          <td colSpan="8">
                            <div className="p-3 bg-light">
                              <h6>Log Sheets</h6>
                              <LogSheet logs={trip.logs} />
                            </div>
                          </td>
                        </tr>
                      )}
                      {showMapId === trip.id && (
                        <tr>
                          <td colSpan="8">
                            <div 
                              id={`trip-map-${trip.id}`} 
                              style={{ 
                                height: '400px', 
                                width: '100%',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                margin: '10px 0'
                              }}
                            ></div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTrips;