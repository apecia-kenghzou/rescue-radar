import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getSOSSubmissions, emergencyTypes, getEmergencyTypeInfo } from '../utils/mockAPI';
import { formatCoordinates } from '../utils/geolocation';
import './MapView.css';

const MapView = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [filter, setFilter] = useState('all');
    const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lng: 120.9842 });
    const [zoom, setZoom] = useState(12);

    useEffect(() => {
        loadSubmissions();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadSubmissions, 30000);
        return () => clearInterval(interval);
    }, [filter]);

    const loadSubmissions = async () => {
        try {
            const filters = filter !== 'all' ? { type: filter } : {};
            const result = await getSOSSubmissions(filters);

            if (result.success) {
                setSubmissions(result.data);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerClick = (submission) => {
        setSelectedSubmission(submission);
        setMapCenter(submission.location);
    };

    const handleCloseDetails = () => {
        setSelectedSubmission(null);
    };

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const filteredSubmissions = submissions.filter(s =>
        filter === 'all' || s.type === filter
    );

    // Create custom marker icons for each emergency type
    const createCustomIcon = (typeInfo) => {
        return L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
                <div class="leaflet-marker-container">
                    <div class="leaflet-marker-pin" style="background-color: ${typeInfo.color}; box-shadow: 0 0 20px ${typeInfo.color}80;">
                        <span class="leaflet-marker-icon">${typeInfo.icon}</span>
                    </div>
                    <div class="leaflet-marker-pulse" style="border-color: ${typeInfo.color};"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
    };

    const handleResolve = async () => {
        if (!selectedSubmission) return;

        if (window.confirm('Are you sure you want to resolve this emergency? It will be removed from the map.')) {
            try {
                const { resolveSOS } = await import('../utils/mockAPI');
                const result = await resolveSOS(selectedSubmission.id);

                if (result.success) {
                    // Remove from local state
                    setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id));
                    setSelectedSubmission(null);
                    alert('Emergency resolved successfully!');
                }
            } catch (error) {
                console.error('Error resolving SOS:', error);
                alert('Failed to resolve emergency. Please try again.');
            }
        }
    };

    return (
        <div className="map-view-container animate-fade-in">
            {/* Header */}
            <div className="map-header glass-card">
                <div className="header-content">
                    <div className="header-info">
                        <h2>🗺️ Emergency Response Map</h2>
                        <p className="text-muted">
                            {filteredSubmissions.length} active SOS {filteredSubmissions.length === 1 ? 'request' : 'requests'}
                        </p>
                    </div>

                    {/* Filter */}
                    <div className="filter-section">
                        <label className="filter-label">Filter by type:</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-select filter-select"
                        >
                            <option value="all">All Emergencies</option>
                            {emergencyTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="map-content">
                {/* Real OpenStreetMap */}
                <div className="leaflet-map-container">
                    {loading ? (
                        <div className="map-loading">
                            <div className="spinner"></div>
                            <p>Loading emergency locations...</p>
                        </div>
                    ) : (
                        <MapContainer
                            center={[mapCenter.lat, mapCenter.lng]}
                            zoom={zoom}
                            className="leaflet-map"
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {filteredSubmissions.map((submission) => {
                                const typeInfo = getEmergencyTypeInfo(submission.type);
                                return (
                                    <Marker
                                        key={submission.id}
                                        position={[submission.location.lat, submission.location.lng]}
                                        icon={createCustomIcon(typeInfo)}
                                        eventHandlers={{
                                            click: () => handleMarkerClick(submission)
                                        }}
                                    >
                                        <Popup>
                                            <div className="marker-popup">
                                                <div className="popup-header">
                                                    <span className={`badge badge-${submission.type}`}>
                                                        {typeInfo.icon} {typeInfo.label}
                                                    </span>
                                                </div>
                                                <div className="popup-body">
                                                    <p><strong>📍 Location:</strong></p>
                                                    <p className="popup-coords">{formatCoordinates(submission.location)}</p>
                                                    {submission.notes && (
                                                        <>
                                                            <p><strong>📝 Details:</strong></p>
                                                            <p>{submission.notes}</p>
                                                        </>
                                                    )}
                                                    <p><strong>⏰ Reported:</strong></p>
                                                    <p>{getTimeAgo(submission.timestamp)}</p>
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleMarkerClick(submission)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {/* Map Legend */}
                            <div className="map-legend glass-card">
                                <h4>Legend</h4>
                                <div className="legend-items">
                                    {emergencyTypes.map(type => (
                                        <div key={type.value} className="legend-item">
                                            <div
                                                className="legend-color"
                                                style={{ backgroundColor: type.color }}
                                            />
                                            <span>{type.icon} {type.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </MapContainer>
                    )}
                </div>

                {/* Submissions List */}
                <div className="submissions-sidebar">
                    <h3>Active Requests</h3>
                    <div className="submissions-list">
                        {filteredSubmissions.length === 0 ? (
                            <div className="empty-state">
                                <p>No active SOS requests</p>
                                <span className="empty-icon">✓</span>
                            </div>
                        ) : (
                            filteredSubmissions.map(submission => {
                                const typeInfo = getEmergencyTypeInfo(submission.type);
                                return (
                                    <div
                                        key={submission.id}
                                        className={`submission-card glass-card ${selectedSubmission?.id === submission.id ? 'selected' : ''}`}
                                        onClick={() => handleMarkerClick(submission)}
                                    >
                                        <div className="submission-header">
                                            <span className={`badge badge-${submission.type}`}>
                                                {typeInfo.icon} {typeInfo.label}
                                            </span>
                                            <span className="submission-time">{getTimeAgo(submission.timestamp)}</span>
                                        </div>
                                        <div className="submission-location">
                                            📍 {formatCoordinates(submission.location)}
                                        </div>
                                        {submission.notes && (
                                            <div className="submission-notes">
                                                {submission.notes}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {selectedSubmission && (
                <div className="details-modal" onClick={handleCloseDetails}>
                    <div className="details-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={handleCloseDetails}>×</button>

                        <div className="details-header">
                            <span className={`badge badge-${selectedSubmission.type}`}>
                                {getEmergencyTypeInfo(selectedSubmission.type).icon}{' '}
                                {getEmergencyTypeInfo(selectedSubmission.type).label}
                            </span>
                            <span className="details-time">{getTimeAgo(selectedSubmission.timestamp)}</span>
                        </div>

                        <div className="details-body">
                            <div className="detail-section">
                                <h4>📍 Location</h4>
                                <p className="location-coords">{formatCoordinates(selectedSubmission.location)}</p>
                            </div>

                            {selectedSubmission.notes && (
                                <div className="detail-section">
                                    <h4>📝 Details</h4>
                                    <p>{selectedSubmission.notes}</p>
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>⏰ Reported</h4>
                                <p>{new Date(selectedSubmission.timestamp).toLocaleString()}</p>
                            </div>

                            <div className="detail-section">
                                <h4>🆔 Request ID</h4>
                                <p className="request-id">{selectedSubmission.id}</p>
                            </div>
                        </div>

                        <div className="details-actions">
                            <button
                                className="btn btn-success btn-lg"
                                onClick={handleResolve}
                            >
                                ✅ Mark as Resolved
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapView;
