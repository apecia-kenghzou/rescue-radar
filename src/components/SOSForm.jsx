import { useState, useEffect } from 'react';
import { getCurrentLocation, formatCoordinates, isGeolocationAvailable } from '../utils/geolocation';
import { submitSOS, emergencyTypes } from '../utils/mockAPI';
import './SOSForm.css';

const SOSForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        type: 'medical',
        location: null,
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [locationError, setLocationError] = useState(null);

    // Auto-detect location on mount
    useEffect(() => {
        handleGetLocation();
    }, []);

    const handleGetLocation = async () => {
        setLocationLoading(true);
        setLocationError(null);

        try {
            const location = await getCurrentLocation();
            setFormData(prev => ({ ...prev, location }));
        } catch (err) {
            setLocationError(err.message);
            // Set a default location as fallback
            setFormData(prev => ({
                ...prev,
                location: { lat: 14.5995, lng: 120.9842 } // Manila default
            }));
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.location) {
            setError('Location is required. Please allow location access.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await submitSOS(formData);

            if (result.success) {
                setSuccess(true);

                // Reset form after 3 seconds
                setTimeout(() => {
                    setFormData({
                        type: 'medical',
                        location: formData.location, // Keep location
                        notes: ''
                    });
                    setSuccess(false);
                    if (onSuccess) {
                        onSuccess(result.data);
                    }
                }, 3000);
            } else {
                setError(result.message || 'Failed to submit SOS');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('SOS submission error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    if (success) {
        return (
            <div className="sos-form-container animate-fade-in">
                <div className="glass-card success-card">
                    <div className="success-icon">✓</div>
                    <h2>SOS Submitted Successfully!</h2>
                    <p>Help is on the way. Your location has been shared with responders.</p>
                    <div className="success-details">
                        <div className="detail-item">
                            <span className="detail-label">Emergency Type:</span>
                            <span className={`badge badge-${formData.type}`}>
                                {emergencyTypes.find(t => t.value === formData.type)?.label}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">{formatCoordinates(formData.location)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sos-form-container animate-fade-in">
            <div className="glass-card sos-form-card">
                <div className="form-header">
                    <div className="emergency-icon">🆘</div>
                    <h2>Request Emergency Help</h2>
                    <p className="text-muted">Submit your location and emergency details to get help quickly</p>
                </div>

                <form onSubmit={handleSubmit} className="sos-form">
                    {/* Location Section */}
                    <div className="form-group">
                        <label className="form-label">📍 Your Location</label>
                        <div className="location-section">
                            {locationLoading ? (
                                <div className="location-loading">
                                    <div className="spinner"></div>
                                    <span>Detecting your location...</span>
                                </div>
                            ) : formData.location ? (
                                <div className="location-display">
                                    <div className="location-info">
                                        <span className="location-icon">✓</span>
                                        <span className="location-text">{formatCoordinates(formData.location)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="btn btn-sm btn-outline"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            ) : (
                                <div className="location-actions">
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="btn btn-primary"
                                        disabled={!isGeolocationAvailable()}
                                    >
                                        📍 Detect My Location
                                    </button>
                                </div>
                            )}

                            {locationError && (
                                <div className="location-error">
                                    <span>⚠️ {locationError}</span>
                                    {locationError.includes('denied') || locationError.includes('permission') ? (
                                        <a
                                            href="/location-guide"
                                            className="btn btn-sm btn-outline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            How to Enable?
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            className="btn btn-sm btn-outline"
                                        >
                                            Retry
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Emergency Type */}
                    <div className="form-group">
                        <label htmlFor="type" className="form-label">🚨 Emergency Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            {emergencyTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Additional Notes */}
                    <div className="form-group">
                        <label htmlFor="notes" className="form-label">📝 Additional Details (Optional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="form-textarea"
                            placeholder="Describe your situation, number of people, specific needs, etc."
                            rows="4"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger animate-slide-in">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-danger btn-lg submit-btn"
                        disabled={loading || !formData.location}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                🆘 Submit SOS Request
                            </>
                        )}
                    </button>

                    <p className="form-footer-text">
                        Your location will be shared with nearby responders. Help will be dispatched as soon as possible.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SOSForm;
