// Mock API for SOS submissions and data retrieval
// In production, replace these with actual API calls

const STORAGE_KEY = 'sos_submissions';

// Simulated network delay
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Get all SOS submissions from local storage
const getStoredSubmissions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// Save submissions to local storage
const saveSubmissions = (submissions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Generate initial mock data
const generateMockData = () => {
  const emergencyTypes = ['medical', 'food', 'shelter', 'rescue', 'water', 'other'];
  const mockSubmissions = [
    {
      id: '1',
      type: 'medical',
      location: { lat: 14.5995, lng: 120.9842 }, // Manila
      notes: 'Elderly person needs urgent medical attention',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'active'
    },
    {
      id: '2',
      type: 'food',
      location: { lat: 14.6091, lng: 121.0223 },
      notes: 'Family of 5 needs food supplies',
      timestamp: Date.now() - 7200000, // 2 hours ago
      status: 'active'
    },
    {
      id: '3',
      type: 'shelter',
      location: { lat: 14.5547, lng: 121.0244 },
      notes: 'House destroyed, need temporary shelter',
      timestamp: Date.now() - 10800000, // 3 hours ago
      status: 'active'
    },
    {
      id: '4',
      type: 'rescue',
      location: { lat: 14.6507, lng: 121.0494 },
      notes: 'People trapped on rooftop due to flooding',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      status: 'active'
    },
    {
      id: '5',
      type: 'water',
      location: { lat: 14.5764, lng: 120.9772 },
      notes: 'Clean drinking water urgently needed',
      timestamp: Date.now() - 5400000, // 1.5 hours ago
      status: 'active'
    }
  ];

  // Only initialize if storage is empty
  const existing = getStoredSubmissions();
  if (existing.length === 0) {
    saveSubmissions(mockSubmissions);
    return mockSubmissions;
  }
  return existing;
};

// Initialize mock data
generateMockData();

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Submit a new SOS request
 * @param {Object} sosData - The SOS submission data
 * @param {string} sosData.type - Emergency type (medical, food, shelter, rescue, water, other)
 * @param {Object} sosData.location - Location coordinates
 * @param {number} sosData.location.lat - Latitude
 * @param {number} sosData.location.lng - Longitude
 * @param {string} sosData.notes - Additional notes
 * @returns {Promise<Object>} The created SOS submission
 */
export const submitSOS = async (sosData) => {
  // Use real API if configured
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sosData),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
        message: 'SOS submitted successfully'
      };
    } catch (error) {
      console.error('Error submitting to API:', error);
      throw error;
    }
  }

  // Fallback to Mock
  await delay(800); // Simulate network delay

  const newSubmission = {
    id: Date.now().toString(),
    type: sosData.type,
    location: sosData.location,
    notes: sosData.notes || '',
    timestamp: Date.now(),
    status: 'active'
  };

  const submissions = getStoredSubmissions();
  submissions.push(newSubmission);
  saveSubmissions(submissions);

  return {
    success: true,
    data: newSubmission,
    message: 'SOS submitted successfully'
  };
};

/**
 * Get all SOS submissions
 * @param {Object} filters - Optional filters
 * @param {string} filters.type - Filter by emergency type
 * @param {string} filters.status - Filter by status
 * @returns {Promise<Array>} Array of SOS submissions
 */
export const getSOSSubmissions = async (filters = {}) => {
  // Use real API if configured
  if (API_URL) {
    try {
      const url = new URL(`${API_URL}/sos`);
      if (filters.type && filters.type !== 'all') {
        url.searchParams.append('type', filters.type);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
        count: result.data.length
      };
    } catch (error) {
      console.error('Error fetching from API:', error);
      // Fallback to mock on error? Or rethrow?
      // For now, let's rethrow so the UI knows something went wrong with the real backend
      throw error;
    }
  }

  // Fallback to Mock
  await delay(600); // Simulate network delay

  let submissions = getStoredSubmissions();

  // Apply filters
  if (filters.type) {
    submissions = submissions.filter(s => s.type === filters.type);
  }
  if (filters.status) {
    submissions = submissions.filter(s => s.status === filters.status);
  }

  return {
    success: true,
    data: submissions,
    count: submissions.length
  };
};

/**
 * Resolve SOS submission
 * @param {string} id - SOS submission ID
 * @returns {Promise<Object>} Updated submission
 */
export const resolveSOS = async (id) => {
  // Use real API if configured
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/sos/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
        message: 'SOS resolved successfully'
      };
    } catch (error) {
      console.error('Error resolving SOS:', error);
      throw error;
    }
  }

  // Fallback to Mock
  await delay(500);

  const submissions = getStoredSubmissions();
  const index = submissions.findIndex(s => s.id === id);

  if (index === -1) {
    return {
      success: false,
      message: 'SOS submission not found'
    };
  }

  submissions[index].status = 'resolved';
  submissions[index].updatedAt = Date.now();
  saveSubmissions(submissions);

  return {
    success: true,
    data: submissions[index],
    message: 'SOS resolved successfully'
  };
};

/**
 * Delete SOS submission
 * @param {string} id - SOS submission ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSOSSubmission = async (id) => {
  await delay(500);

  const submissions = getStoredSubmissions();
  const filtered = submissions.filter(s => s.id !== id);

  if (filtered.length === submissions.length) {
    return {
      success: false,
      message: 'SOS submission not found'
    };
  }

  saveSubmissions(filtered);

  return {
    success: true,
    message: 'SOS submission deleted successfully'
  };
};

// Emergency type metadata
export const emergencyTypes = [
  { value: 'medical', label: 'Medical Emergency', color: '#ef4444', icon: '🏥' },
  { value: 'food', label: 'Food & Supplies', color: '#f59e0b', icon: '🍽️' },
  { value: 'shelter', label: 'Shelter Needed', color: '#8b5cf6', icon: '🏠' },
  { value: 'rescue', label: 'Rescue Required', color: '#ec4899', icon: '🚁' },
  { value: 'water', label: 'Water Needed', color: '#06b6d4', icon: '💧' },
  { value: 'other', label: 'Other', color: '#6b7280', icon: '📢' }
];

export const getEmergencyTypeInfo = (type) => {
  return emergencyTypes.find(t => t.value === type) || emergencyTypes[emergencyTypes.length - 1];
};
