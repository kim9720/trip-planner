import React, { useState, useEffect } from 'react';
import { FiInfo, FiMapPin, FiSearch } from 'react-icons/fi';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

const TripForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    driver_id: '',
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_hours: 0,
    pickup_search: '',
    dropoff_search: ''
  });
  const [errors, setErrors] = useState({});
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState({
    pickup: [],
    dropoff: []
  });
  const [activeField, setActiveField] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const provider = new OpenStreetMapProvider();

  // Debounce search to avoid excessive API calls
  const handleSearch = async (field, value) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(async () => {
      if (value.length > 2) {
        try {
          const results = await provider.search({ query: value });
          setSearchResults(prev => ({
            ...prev,
            [field]: results.slice(0, 5) // Show top 5 results
          }));
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults(prev => ({
            ...prev,
            [field]: []
          }));
        }
      } else {
        setSearchResults(prev => ({
          ...prev,
          [field]: []
        }));
      }
    }, 300); // 300ms debounce delay

    setTypingTimeout(timeout);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-trigger search for location fields
    if (name === 'pickup_search' || name === 'dropoff_search') {
      const field = name.split('_')[0];
      setActiveField(field);
      handleSearch(field, value);
    }
  };

  const selectLocation = (field, result) => {
    const locationString = `${result.y},${result.x}`;
    setFormData(prev => ({
      ...prev,
      [`${field}_location`]: locationString,
      [`${field}_search`]: result.label
    }));
    setSearchResults(prev => ({
      ...prev,
      [field]: [] // Clear results after selection
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          current_location: `${latitude.toFixed(6)},${longitude.toFixed(6)}`
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        setLocationError('Unable to retrieve your location: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const validate = () => {
    const newErrors = {};
    const latLngRegex = /^-?\d+\.\d+,-?\d+\.\d+$/;
    
    if (!formData.driver_id.trim()) {
      newErrors.driver_id = 'Driver ID is required';
    }
    if (!latLngRegex.test(formData.current_location)) {
      newErrors.current_location = 'Enter valid lat,lng (e.g., 40.7128,-74.0060)';
    }
    if (!latLngRegex.test(formData.pickup_location)) {
      newErrors.pickup_location = 'Please select a valid pickup location';
    }
    if (!latLngRegex.test(formData.dropoff_location)) {
      newErrors.dropoff_location = 'Please select a valid dropoff location';
    }
    if (formData.current_cycle_hours < 0 || formData.current_cycle_hours > 70) {
      newErrors.current_cycle_hours = 'Hours must be between 0 and 70';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const parsedData = {
        driver_id: formData.driver_id,
        current_location: formData.current_location.split(',').map(Number),
        pickup_location: formData.pickup_location.split(',').map(Number),
        dropoff_location: formData.dropoff_location.split(',').map(Number),
        current_cycle_hours: Number(formData.current_cycle_hours),
      };
      onSubmit(parsedData);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <div className="card shadow-lg mx-auto fade-in" style={{ 
      maxWidth: '900px', 
      border: 'none',
      borderRadius: '15px',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #ffffff, #f8f9fa)'
    }}>
      <div className="card-body p-4">
        <h2 className="card-title text-center mb-4" style={{
          color: '#2c3e50',
          fontWeight: '600',
          fontSize: '1.8rem',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          Enter Trip Details
          <div style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '50px',
            height: '3px',
            background: 'linear-gradient(90deg, #3498db, #2ecc71)',
            borderRadius: '3px'
          }}></div>
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Driver ID Field */}
          <div className="mb-4">
            <label className="form-label d-flex align-items-center" style={{
              color: '#34495e',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Driver ID
            </label>
            <input
              type="text"
              name="driver_id"
              value={formData.driver_id}
              onChange={handleChange}
              className={`form-control ${errors.driver_id ? 'is-invalid' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '12px 15px',
                border: '1px solid #dfe6e9',
                boxShadow: 'none',
                transition: 'all 0.3s',
                fontSize: '0.95rem'
              }}
              placeholder="e.g., 98780"
              required
            />
            {errors.driver_id && (
              <div className="invalid-feedback d-flex align-items-center mt-1">
                {errors.driver_id}
              </div>
            )}
          </div>

          {/* Current Location Field */}
          <div className="mb-4">
            <label className="form-label d-flex align-items-center" style={{
              color: '#34495e',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Current Location (lat,lng)
              <FiInfo
                className="ms-2"
                size={16}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Enter latitude and longitude, e.g., 40.7128,-74.0060"
              />
            </label>
            <div className="input-group">
              <input
                type="text"
                name="current_location"
                value={formData.current_location}
                onChange={handleChange}
                className={`form-control ${errors.current_location ? 'is-invalid' : ''}`}
                style={{
                  borderRadius: '8px 0 0 8px',
                  padding: '12px 15px',
                  border: '1px solid #dfe6e9',
                  boxShadow: 'none',
                  transition: 'all 0.3s',
                  fontSize: '0.95rem'
                }}
                placeholder="e.g., 40.7128,-74.0060"
                required
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                className="btn btn-outline-secondary"
                style={{
                  borderRadius: '0 8px 8px 0',
                  borderLeft: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 15px',
                  background: '#f8f9fa'
                }}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <FiMapPin size={18} />
                )}
              </button>
            </div>
            {errors.current_location && (
              <div className="invalid-feedback d-flex align-items-center mt-1">
                {errors.current_location}
              </div>
            )}
            {locationError && (
              <div className="text-danger small mt-1">{locationError}</div>
            )}
            <div className="form-text small mt-1">
              Click the <FiMapPin size={14} className="mx-1" /> icon to use your current location
            </div>
          </div>

          {/* Pickup Location Field with Auto-suggest */}
          <div className="mb-4 position-relative">
            <label className="form-label d-flex align-items-center" style={{
              color: '#34495e',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Pickup Location
              <FiInfo
                className="ms-2"
                size={16}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Search for pickup location"
              />
            </label>
            <div className="input-group">
              <input
                type="text"
                name="pickup_search"
                value={formData.pickup_search}
                onChange={handleChange}
                onFocus={() => setActiveField('pickup')}
                className={`form-control ${errors.pickup_location ? 'is-invalid' : ''}`}
                style={{
                  borderRadius: '8px 0 0 8px',
                  padding: '12px 15px',
                  border: '1px solid #dfe6e9',
                  boxShadow: 'none',
                  transition: 'all 0.3s',
                  fontSize: '0.95rem'
                }}
                placeholder="Start typing to search locations..."
                autoComplete="off"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                style={{
                  borderRadius: '0 8px 8px 0',
                  borderLeft: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 15px',
                  background: '#f8f9fa'
                }}
                onClick={() => handleSearch('pickup', formData.pickup_search)}
              >
                <FiSearch size={18} />
              </button>
            </div>
            <input
              type="hidden"
              name="pickup_location"
              value={formData.pickup_location}
            />
            {activeField === 'pickup' && searchResults.pickup.length > 0 && (
              <div className="list-group position-absolute w-100 mt-1" style={{ 
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #dee2e6',
                borderRadius: '0 0 8px 8px'
              }}>
                {searchResults.pickup.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    className="list-group-item list-group-item-action text-start"
                    onClick={() => selectLocation('pickup', result)}
                    style={{
                      padding: '10px 15px',
                      border: 'none',
                      borderBottom: '1px solid #f8f9fa',
                      fontSize: '0.9rem'
                    }}
                  >
                    {result.label}
                  </button>
                ))}
              </div>
            )}
            {errors.pickup_location && (
              <div className="invalid-feedback d-flex align-items-center mt-1">
                {errors.pickup_location}
              </div>
            )}
            <div className="form-text small mt-1">
              Search for an address to set pickup location
            </div>
          </div>

          {/* Dropoff Location Field with Auto-suggest */}
          <div className="mb-4 position-relative">
            <label className="form-label d-flex align-items-center" style={{
              color: '#34495e',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Dropoff Location
              <FiInfo
                className="ms-2"
                size={16}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Search for dropoff location"
              />
            </label>
            <div className="input-group">
              <input
                type="text"
                name="dropoff_search"
                value={formData.dropoff_search}
                onChange={handleChange}
                onFocus={() => setActiveField('dropoff')}
                className={`form-control ${errors.dropoff_location ? 'is-invalid' : ''}`}
                style={{
                  borderRadius: '8px 0 0 8px',
                  padding: '12px 15px',
                  border: '1px solid #dfe6e9',
                  boxShadow: 'none',
                  transition: 'all 0.3s',
                  fontSize: '0.95rem'
                }}
                placeholder="Start typing to search locations..."
                autoComplete="off"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                style={{
                  borderRadius: '0 8px 8px 0',
                  borderLeft: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 15px',
                  background: '#f8f9fa'
                }}
                onClick={() => handleSearch('dropoff', formData.dropoff_search)}
              >
                <FiSearch size={18} />
              </button>
            </div>
            <input
              type="hidden"
              name="dropoff_location"
              value={formData.dropoff_location}
            />
            {activeField === 'dropoff' && searchResults.dropoff.length > 0 && (
              <div className="list-group position-absolute w-100 mt-1" style={{ 
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #dee2e6',
                borderRadius: '0 0 8px 8px'
              }}>
                {searchResults.dropoff.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    className="list-group-item list-group-item-action text-start"
                    onClick={() => selectLocation('dropoff', result)}
                    style={{
                      padding: '10px 15px',
                      border: 'none',
                      borderBottom: '1px solid #f8f9fa',
                      fontSize: '0.9rem'
                    }}
                  >
                    {result.label}
                  </button>
                ))}
              </div>
            )}
            {errors.dropoff_location && (
              <div className="invalid-feedback d-flex align-items-center mt-1">
                {errors.dropoff_location}
              </div>
            )}
            <div className="form-text small mt-1">
              Search for an address to set dropoff location
            </div>
          </div>

          {/* Current Cycle Hours Field */}
          <div className="mb-4">
            <label className="form-label" style={{
              color: '#34495e',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Current Cycle Hours
            </label>
            <input
              type="number"
              name="current_cycle_hours"
              value={formData.current_cycle_hours}
              onChange={handleChange}
              className={`form-control ${errors.current_cycle_hours ? 'is-invalid' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '12px 15px',
                border: '1px solid #dfe6e9',
                boxShadow: 'none',
                transition: 'all 0.3s',
                fontSize: '0.95rem'
              }}
              min="0"
              max="70"
              step="0.1"
              required
            />
            <div className="form-text">Enter hours between 0 and 70</div>
            {errors.current_cycle_hours && (
              <div className="invalid-feedback d-flex align-items-center mt-1">
                {errors.current_cycle_hours}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn w-100 py-2"
            disabled={loading}
            style={{
              background: 'linear-gradient(90deg, #3498db, #2ecc71)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s',
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11)',
              marginTop: '1rem'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 7px 14px rgba(50, 50, 93, 0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(50, 50, 93, 0.11)';
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Planning...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-send me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                </svg>
                Plan Trip
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripForm;