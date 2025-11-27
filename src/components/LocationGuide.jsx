import { useNavigate } from 'react-router-dom';
import './LocationGuide.css';

const LocationGuide = () => {
    const navigate = useNavigate();

    return (
        <div className="location-guide-container animate-fade-in">
            <div className="guide-header">
                <button onClick={() => navigate('/')} className="back-btn">
                    ← Back to Home
                </button>
                <h1>Enable Location Services</h1>
                <p className="text-muted">To submit an SOS, we need access to your location. Follow the steps below for your device.</p>
            </div>

            <div className="guide-content">
                {/* iOS Section */}
                <div className="guide-card glass-card">
                    <div className="platform-icon">🍎</div>
                    <h3>iOS (iPhone/iPad)</h3>

                    <div className="browser-section">
                        <h4>Safari</h4>
                        <ol>
                            <li>Tap the <strong>AA</strong> icon in the address bar</li>
                            <li>Select <strong>Website Settings</strong></li>
                            <li>Tap <strong>Location</strong></li>
                            <li>Select <strong>Allow</strong></li>
                            <li>Refresh the page</li>
                        </ol>
                    </div>

                    <div className="browser-section">
                        <h4>Chrome</h4>
                        <ol>
                            <li>Tap the <strong>Lock</strong> icon in the address bar</li>
                            <li>Tap <strong>Permissions</strong></li>
                            <li>Tap <strong>Location</strong></li>
                            <li>Select <strong>Allow</strong></li>
                            <li>Refresh the page</li>
                        </ol>
                    </div>
                </div>

                {/* Android Section */}
                <div className="guide-card glass-card">
                    <div className="platform-icon">🤖</div>
                    <h3>Android</h3>

                    <div className="browser-section">
                        <h4>Chrome</h4>
                        <ol>
                            <li>Tap the <strong>Lock</strong> icon in the address bar</li>
                            <li>Tap <strong>Permissions</strong></li>
                            <li>Toggle <strong>Location</strong> to ON</li>
                            <li>Refresh the page</li>
                        </ol>
                    </div>

                    <div className="browser-section">
                        <h4>Samsung Internet</h4>
                        <ol>
                            <li>Tap the <strong>Menu</strong> (three lines)</li>
                            <li>Go to <strong>Settings</strong> &gt; <strong>Sites and downloads</strong></li>
                            <li>Tap <strong>Site permissions</strong> &gt; <strong>Location</strong></li>
                            <li>Enable location for this site</li>
                        </ol>
                    </div>
                </div>

                {/* Desktop Section */}
                <div className="guide-card glass-card">
                    <div className="platform-icon">💻</div>
                    <h3>Desktop</h3>

                    <div className="browser-section">
                        <h4>Chrome / Edge / Brave</h4>
                        <ol>
                            <li>Click the <strong>Lock</strong> or <strong>Settings</strong> icon in the address bar</li>
                            <li>Toggle <strong>Location</strong> to ON</li>
                            <li>Refresh the page</li>
                        </ol>
                    </div>

                    <div className="browser-section">
                        <h4>Safari (Mac)</h4>
                        <ol>
                            <li>Click <strong>Safari</strong> in the menu bar</li>
                            <li>Select <strong>Settings for This Website...</strong></li>
                            <li>Set <strong>Location</strong> to <strong>Allow</strong></li>
                            <li>Refresh the page</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationGuide;
