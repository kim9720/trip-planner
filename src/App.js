import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TripForm from './components/TripForm';
import MapDisplay from './components/MapDisplay';
import LogSheet from './components/LogSheet';
import AllTrips from './components/AllTrips';
import { FiHome, FiMap, FiClock, FiSettings, FiTruck, FiMapPin } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [tripData, setTripData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [activeSection, setActiveSection] = useState('plan');
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });

    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
    try {
      const response = await axios.post('https://trip.uwamaatraders.com/api/trips/', {
        driver_id: formData.driver_id,
        current_location_lat: formData.current_location[0],
        current_location_lng: formData.current_location[1],
        pickup_location_lat: formData.pickup_location[0],
        pickup_location_lng: formData.pickup_location[1],
        dropoff_location_lat: formData.dropoff_location[0],
        dropoff_location_lng: formData.dropoff_location[1],
        current_cycle_hours: formData.current_cycle_hours,
      });
      setTripData(response.data.trip);
      setLogs(response.data.logs);
      setSuccess(true);
      setActiveSection('results');
      setIsLoading(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to plan trip. Please try again.');
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const handleAllTripsError = (errorMsg) => {
    setError(errorMsg);
  };

  return (
    <>
      {showSplashScreen && (
        <div className="splash-screen">
          <div className="splash-content">
            <FiTruck className="splash-icon" size={64} />
            <h1 className="splash-title">Trip Planner</h1>
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      )}

      <div className={`app-container ${showSplashScreen ? 'd-none' : 'd-flex'}`}>
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            {isSidebarOpen ? (
              <h3 className="m-0 text-primary">Trip Planner</h3>
            ) : (
              <FiTruck className="text-primary" size={30} />
            )}
            <button
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? 'Collapse' : 'Expand'}
            >
              {isSidebarOpen ? '◄' : '►'}
            </button>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-link ${activeSection === 'plan' ? 'active' : ''}`}
              onClick={() => setActiveSection('plan')}
              title="Plan a new trip"
            >
              <FiHome className="nav-icon" />
              {isSidebarOpen && <span>Plan Trip</span>}
            </button>
            <button
              className={`nav-link ${activeSection === 'results' ? 'active' : ''}`}
              onClick={() => setActiveSection('results')}
              disabled={!tripData}
              title="View trip map"
            >
              <FiMap className="nav-icon" />
              {isSidebarOpen && <span>Trip Results</span>}
            </button>
            <button
              className={`nav-link ${activeSection === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveSection('logs')}
              disabled={logs.length === 0}
              title="View driver logs"
            >
              <FiClock className="nav-icon" />
              {isSidebarOpen && <span>Driver Logs</span>}
            </button>
            <button
              className={`nav-link ${activeSection === 'all-trips' ? 'active' : ''}`}
              onClick={() => setActiveSection('all-trips')}
              title="View all trips for a driver"
            >
              <FiMapPin className="nav-icon" />
              {isSidebarOpen && <span>All Trips</span>}
            </button>
            <button
              className={`nav-link ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
              title="Adjust settings"
            >
              <FiSettings className="nav-icon" />
              {isSidebarOpen && <span>Settings</span>}
            </button>
          </nav>
        </div>

        <div className="main-content">
          <div className="container-fluid py-4">
            {activeSection === 'plan' && (
              <div className="fade-in">
                <h1 className="display-5 mb-4 text-primary">Plan Your Route</h1>
                <TripForm onSubmit={handleSubmit} loading={isLoading} />
              </div>
            )}

            {activeSection === 'results' && tripData && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1 className="display-5 m-0 text-primary">Trip Results</h1>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setActiveSection('plan')}
                  >
                    Plan New Trip
                  </button>
                </div>
                <MapDisplay trip={tripData} />
              </div>
            )}

            {activeSection === 'logs' && logs.length > 0 && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1 className="display-5 m-0 text-primary">Driver Logs</h1>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setActiveSection('results')}
                  >
                    Back to Results
                  </button>
                </div>
                <LogSheet logs={logs} />
              </div>
            )}

            {activeSection === 'all-trips' && (
              <div className="fade-in">
                <AllTrips onError={handleAllTripsError} />
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="fade-in">
                <h1 className="display-5 mb-4 text-primary">Settings</h1>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Preferences</h5>
                    <div className="settings-option">
                      <span>Theme</span>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={toggleTheme}
                      >
                        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                      </button>
                    </div>
                    <div className="settings-option">
                      <span>Notifications</span>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="notifications"
                        />
                        <label className="form-check-label" htmlFor="notifications">
                          Enable Notifications
                        </label>
                      </div>
                    </div>
                    <div className="settings-option">
                      <span>Map Style</span>
                      <select className="form-select w-auto">
                        <option>Standard</option>
                        <option>Satellite</option>
                        <option>Dark</option>
                      </select>
                    </div>
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
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError('')}
                      />
                    </div>
                    <div className="modal-body">
                      <p>{error}</p>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setError('')}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="error-modal">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title text-success">Success</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccess(false)}
                      />
                    </div>
                    <div className="modal-body">
                      <p>Trip planned successfully! Check the results tab.</p>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setSuccess(false);
                          setActiveSection('results');
                        }}
                      >
                        View Results
                      </button>
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