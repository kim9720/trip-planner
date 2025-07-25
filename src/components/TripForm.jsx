import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

const TripForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    driver_id: '',
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_hours: 0,
  });
  const [errors, setErrors] = useState({});

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
      newErrors.pickup_location = 'Enter valid lat,lng';
    }
    if (!latLngRegex.test(formData.dropoff_location)) {
      newErrors.dropoff_location = 'Enter valid lat,lng';
    }
    if (formData.current_cycle_hours < 0 || formData.current_cycle_hours > 70) {
      newErrors.current_cycle_hours = 'Hours must be between 0 and 70';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  return (
    <div className="card shadow-lg mx-auto fade-in" style={{ 
      maxWidth: '500px', 
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
            <input
              type="text"
              name="current_location"
              value={formData.current_location}
              onChange={handleChange}
              className={`form-control ${errors.current_location ? 'is-invalid' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '12px 15px',
                border: '1px solid #dfe6e9',
                boxShadow: 'none',
                transition: 'all 0.3s',
                fontSize: '0.95rem'
              }}
              placeholder="e.g., 40.7128,-74.0060"
              required
            />
            {errors.current_location && (
              <div className="invalid-feedback d-flex align-items-center mt-1">
                {errors.current_location}
              </div>
            )}
          </div>

          {/* Pickup Location Field */}
          <div className="mb-4">
            <label className="form-label d-flex align-items-center" style={{
              color: '#34495e',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Pickup Location (lat,lng)
              <FiInfo
                className="ms-2"
                size={16}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Enter latitude and longitude, e.g., 34.0522,-118.2437"
              />
            </label>
            <input
              type="text"
              name="pickup_location"
              value={formData.pickup_location}
              onChange={handleChange}
              className={`form-control ${errors.pickup_location ? 'is-invalid' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '12px 15px',
                border: '1px solid #dfe6e9',
                boxShadow: 'none',
                transition: 'all 0.3s',
                fontSize: '0.95rem'
              }}
              placeholder="e.g., 34.0522,-118.2437"
              required
            />
            {errors.pickup_location && (
              <div className="invalid-feedback d-flex align-items-center mt-1">
                {errors.pickup_location}
              </div>
            )}
          </div>

          {/* Dropoff Location Field */}
          <div className="mb-4">
            <label className="form-label d-flex align-items-center" style={{
              color: '#34495e',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Dropoff Location (lat,lng)
              <FiInfo
                className="ms-2"
                size={16}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Enter latitude and longitude, e.g., 41.8781,-87.6298"
              />
            </label>
            <input
              type="text"
              name="dropoff_location"
              value={formData.dropoff_location}
              onChange={handleChange}
              className={`form-control ${errors.dropoff_location ? 'is-invalid' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '12px 15px',
                border: '1px solid #dfe6e9',
                boxShadow: 'none',
                transition: 'all 0.3s',
                fontSize: '0.95rem'
              }}
              placeholder="e.g., 41.8781,-87.6298"
              required
            />
            {errors.dropoff_location && (
              <div className="invalid-feedback d-flex align-items-center mt-1">
                {errors.dropoff_location}
              </div>
            )}
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
