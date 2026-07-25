import { initialDonors, initialRequests } from '../data/apData';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to handle API requests with automatic offline fallback
async function fetchApi(endpoint, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`Backend API unreachable at ${endpoint}, falling back to local database.`, error.message);
    return null;
  }
}

// Memory cache fallback store
let localDonors = [...initialDonors];
let localRequests = [...initialRequests];

export const apiService = {
  // Search donors
  async getDonors({ district, city, bloodGroup }) {
    const apiRes = await fetchApi(`/donors?district=${encodeURIComponent(district || '')}&city=${encodeURIComponent(city || '')}&bloodGroup=${encodeURIComponent(bloodGroup || '')}`);
    if (apiRes && apiRes.success) {
      return apiRes.donors;
    }

    // Local fallback filter
    let results = [...localDonors];
    if (bloodGroup && bloodGroup !== 'All') {
      results = results.filter(d => d.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
    }
    if (district && district !== 'All') {
      results = results.filter(d => d.district.toLowerCase() === district.toLowerCase());
    }
    if (city && city.trim()) {
      results = results.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
    }
    return results;
  },

  // Register new donor
  async registerDonor(donorData) {
    const apiRes = await fetchApi('/donors/register', {
      method: 'POST',
      body: JSON.stringify(donorData)
    });

    if (apiRes && apiRes.success) {
      return apiRes.donor;
    }

    // Local fallback
    const newDonor = {
      id: `donor-${Date.now()}`,
      ...donorData,
      donationsTotal: 0,
      isVerified: true
    };
    localDonors.unshift(newDonor);
    return newDonor;
  },

  // Get urgent requests
  async getRequests({ district, bloodGroup }) {
    const apiRes = await fetchApi(`/requests?district=${encodeURIComponent(district || '')}&bloodGroup=${encodeURIComponent(bloodGroup || '')}`);
    if (apiRes && apiRes.success) {
      return apiRes.requests;
    }

    // Local fallback
    let results = [...localRequests];
    if (bloodGroup && bloodGroup !== 'All Blood Groups' && bloodGroup !== 'All') {
      results = results.filter(r => r.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
    }
    if (district && district !== 'All Districts' && district !== 'All') {
      results = results.filter(r => r.district.toLowerCase() === district.toLowerCase());
    }
    return results;
  },

  // Post urgent blood request
  async createRequest(requestData) {
    const apiRes = await fetchApi('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });

    if (apiRes && apiRes.success) {
      return apiRes.request;
    }

    // Local fallback
    const newReq = {
      id: `req-${Date.now()}`,
      ...requestData,
      isUrgent: true,
      fulfilled: false,
      dateNeeded: new Date().toISOString().split('T')[0]
    };
    localRequests.unshift(newReq);
    return newReq;
  },

  // Mark fulfilled
  async fulfillRequest(id) {
    const apiRes = await fetchApi(`/requests/${id}/fulfill`, { method: 'POST' });
    if (apiRes && apiRes.success) {
      return true;
    }
    const item = localRequests.find(r => r.id === id);
    if (item) item.fulfilled = true;
    return true;
  }
};
