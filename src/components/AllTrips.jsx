import React, { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { FiInfo, FiMapPin } from 'react-icons/fi';
import LogSheet from './LogSheet';

const AllTrips = ({ onError }) => {
  const [driverId, setDriverId] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedTrip, setExpandedTrip] = useState(null);

  useEffect(() => {
    if (!trips.length) return;

    const map = L.map('all-trips-map', {
      zoomControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const bounds = L.latLngBounds(trips.flatMap(trip => [
      trip.current_location,
      trip.pickup_location,
      trip.dropoff_location,
    ]));
    map.fitBounds(bounds, { padding: [50, 50] });

    trips.forEach((trip, index) => {
      const color = ['#4e73df', '#1cc88a', '#e74a3b'][index % 3];
      L.marker(trip.current_location, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;transform:translate(-50%,-50%)">S${index + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(map).bindPopup(`Trip ${index + 1}: Start (Lat: ${trip.current_location[0].toFixed(4)}, Lng: ${trip.current_location[1].toFixed(4)})`);

      L.marker(trip.pickup_location, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;transform:translate(-50%,-50%)">P${index + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(map).bindPopup(`Trip ${index + 1}: Pickup (Lat: ${trip.pickup_location[0].toFixed(4)}, Lng: ${trip.pickup_location[1].toFixed(4)})`);

      L.marker(trip.dropoff_location, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;transform:translate(-50%,-50%)">D${index + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(map).bindPopup(`Trip ${index + 1}: Dropoff (Lat: ${trip.dropoff_location[0].toFixed(4)}, Lng: ${trip.dropoff_location[1].toFixed(4)})`);

      L.Routing.control({
        waypoints: [
          L.latLng(trip.current_location[0], trip.current_location[1]),
          L.latLng(trip.pickup_location[0], trip.pickup_location[1]),
          L.latLng(trip.dropoff_location[0], trip.dropoff_location[1]),
        ],
        routeWhileDragging: false,
        lineOptions: { styles: [{ color, weight: 5, opacity: 0.8 }] },
        show: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
      }).addTo(map);
    });

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
        ${trips.map((_, index) => `
          <div style="display:flex;align-items:center;margin-bottom:5px">
            <div style="background:${['#4e73df', '#1cc88a', '#e74a3b'][index % 3]};width:12px;height:12px;border-radius:50%;margin-right:8px"></div>
            <span>Trip ${index + 1}</span>
          </div>
        `).join('')}
      `;
      return div;
    };
    legend.addTo(map);

    return () => {
      if (map) map.remove();
    };
  }, [trips]);

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
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Trip List</h5>
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
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map(trip => (
                      <tr key={trip.id}>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {expandedTrip && (
                <div className="mt-3">
                  <LogSheet logs={trips.find(trip => trip.id === expandedTrip).logs} />
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header">
              <h3 className="m-0 font-weight-bold text-primary">All Trip Routes</h3>
            </div>
            <div className="card-body p-0">
              <div id="all-trips-map" style={{ height: '500px', width: '100%' }}></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllTrips;
