import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import SOSForm from './components/SOSForm';
import MapView from './components/MapView';
import LocationGuide from './components/LocationGuide';
import './App.css';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/location-guide" element={<LocationGuide />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </div>
  );
}

function MainApp() {
  const [mode, setMode] = useState('home'); // 'home', 'need-help', 'can-help'

  const handleSOSSuccess = (submission) => {
    console.log('SOS submitted:', submission);
    // Could show a notification or update state
  };

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <img src="/logo.png" alt="DisasterLink Logo" className="logo-img" />
              <div className="logo-text">
                <h1>Rescue Radar</h1>
                <p className="tagline">Connecting help when it matters most</p>
              </div>
            </div>

            {mode !== 'home' && (
              <button
                className="btn btn-outline"
                onClick={() => setMode('home')}
              >
                ← Back to Home
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {mode === 'home' && (
          <div className="home-container animate-fade-in">
            <div className="container">
              <div className="hero-section">
                <h2 className="hero-title">Emergency Response Platform</h2>
                <p className="hero-description">
                  In times of disaster, every second counts. Choose how you want to participate:
                </p>

                <div className="mode-cards">
                  {/* Need Help Card */}
                  <div
                    className="mode-card glass-card need-help-card"
                    onClick={() => setMode('need-help')}
                  >
                    <div className="mode-icon danger">🆘</div>
                    <h3>I Need Help</h3>
                    <p>Submit an emergency SOS request with your location</p>
                    <ul className="feature-list">
                      <li>📍 Auto-detect location</li>
                      <li>🚨 Specify emergency type</li>
                      <li>📝 Add important details</li>
                      <li>⚡ Instant submission</li>
                    </ul>
                    <button className="btn btn-danger btn-lg">
                      Request Help →
                    </button>
                  </div>

                  {/* Can Help Card */}
                  <div
                    className="mode-card glass-card can-help-card"
                    onClick={() => setMode('can-help')}
                  >
                    <div className="mode-icon primary">🗺️</div>
                    <h3>I Can Help</h3>
                    <p>View emergency locations and respond to those in need</p>
                    <ul className="feature-list">
                      <li>🗺️ Interactive map view</li>
                      <li>📊 Filter by emergency type</li>
                      <li>📍 See exact locations</li>
                      <li>🔄 Real-time updates</li>
                    </ul>
                    <button className="btn btn-primary btn-lg">
                      View Map →
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="info-section">
                  <div className="info-card glass-card">
                    <h4>🔒 No Login Required</h4>
                    <p>Quick access during emergencies - no registration needed</p>
                  </div>
                  <div className="info-card glass-card">
                    <h4>⚡ Instant Response</h4>
                    <p>Connect with help immediately when every second counts</p>
                  </div>
                  <div className="info-card glass-card">
                    <h4>🌍 Community Powered</h4>
                    <p>Built on the strength of people helping people</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'need-help' && (
          <SOSForm onSuccess={handleSOSSuccess} />
        )}

        {mode === 'can-help' && (
          <MapView />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>
            Rescue Radar - Emergency Response Platform |
            Built with ❤️ for humanity
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
