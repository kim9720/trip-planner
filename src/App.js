import React, { useState, useEffect } from 'react';
import TripForm from './components/TripForm';
import MapDisplay from './components/MapDisplay';
import LogSheet from './components/LogSheet';
import { FiHome, FiMap, FiClock, FiSettings, FiTruck } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Create this file for custom styles

const App = () => {
  const [tripData, setTripData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('plan');
  const [showSplash, setShowSplash] = useState(true);

  // Mock data for testing
  const mockTripData = {
    current_location: [40.7128, -74.0060], // New York
    pickup_location: [34.0522, -118.2437], // Los Angeles
    dropoff_location: [41.8781, -87.6298], // Chicago
  };
  const mockLogs = [
    {
      date: '2025-07-24',
      driving_hours: 10,
      on_duty_hours: 12,
      off_duty_hours: 12,
      fueling_stops: 1,
      status_log: [
        ['2025-07-24T00:00:00', 'Off-Duty'],
        ['2025-07-24T01:00:00', 'On-Duty'],
        ['2025-07-24T11:00:00', 'Driving'],
        ['2025-07-24T12:00:00', 'Off-Duty'],
      ],
    },
  ];

  // Hide splash screen after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call
      setTimeout(() => {
        setTripData(mockTripData);
        setLogs(mockLogs);
        setLoading(false);
        setActiveTab('results');
      }, 1000);
    } catch (error) {
      setError('Failed to plan trip. Please try again.');
      setLoading(false);
      setTripData(mockTripData);
      setLogs(mockLogs);
      setActiveTab('results');
    }
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <div className="splash-screen">
          <div className="splash-content">
            <FiTruck className="splash-icon" size={64} />
            <h1 className="splash-title">Trip Planner</h1>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main App */}
      <div className={`app-container ${showSplash ? 'd-none' : 'd-flex'}`}>
        {/* Sidebar */}
        <div 
          className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        >
          <div className="sidebar-header">
            {sidebarOpen ? (
              <h4 className="m-0 text-primary">Trip Planner</h4>
            ) : (
              <FiTruck className="text-primary" size={24} />
            )}
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`nav-link ${activeTab === 'plan' ? 'active' : ''}`}
              onClick={() => setActiveTab('plan')}
            >
              <FiHome className="nav-icon" />
              {sidebarOpen && 'Plan Trip'}
            </button>
            <button 
              className={`nav-link ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
              disabled={!tripData}
            >
              <FiMap className="nav-icon" />
              {sidebarOpen && 'Trip Results'}
            </button>
            <button 
              className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
              disabled={logs.length === 0}
            >
              <FiClock className="nav-icon" />
              {sidebarOpen && 'Driver Logs'}
            </button>
            <button 
              className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings className="nav-icon" />
              {sidebarOpen && 'Settings'}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="container-fluid py-4">
            {activeTab === 'plan' && (
              <div className="fade-in">
                <h1 className="display-5 mb-4 text-primary">Plan Your Route</h1>
                <TripForm onSubmit={handleSubmit} loading={loading} />
              </div>
            )}

            {activeTab === 'results' && tripData && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1 className="display-5 m-0 text-primary">Trip Results</h1>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setActiveTab('plan')}
                  >
                    Plan New Trip
                  </button>
                </div>
                <MapDisplay trip={tripData} />
              </div>
            )}

            {activeTab === 'logs' && logs.length > 0 && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1 className="display-5 m-0 text-primary">Driver Logs</h1>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setActiveTab('results')}
                  >
                    Back to Results
                  </button>
                </div>
                <LogSheet logs={logs} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="fade-in">
                <h1 className="display-5 mb-4 text-primary">Settings</h1>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Application Settings</h5>
                    <p className="card-text">Configure your preferences here.</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="error-modal">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Error</h5>
                      <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                    <div className="modal-body">
                      <p>{error}</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setError(null)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;