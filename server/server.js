import express from 'express';
import cors from 'cors';
import { apDistricts, apBloodGroups, initialDonors, initialRequests } from '../src/data/apData.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory database tables
let donors = [...initialDonors];
let requests = [...initialRequests];
let users = [
  { id: '1', email: 'user@example.com', password: 'password123', name: 'Srinivasa Rao', role: 'donor' }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bharath Blood Donor AP Backend API is running', timestamp: new Date() });
});

// Get AP Districts and Blood Types
app.get('/api/meta', (req, res) => {
  res.json({
    districts: apDistricts,
    bloodGroups: apBloodGroups
  });
});

// Search Donors API
app.get('/api/donors', (req, res) => {
  const { district, city, bloodGroup } = req.query;
  let filtered = [...donors];

  if (bloodGroup && bloodGroup !== 'All') {
    filtered = filtered.filter(d => d.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
  }

  if (district && district !== 'All') {
    filtered = filtered.filter(d => d.district.toLowerCase() === district.toLowerCase());
  }

  if (city && city.trim() !== '') {
    filtered = filtered.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
  }

  res.json({
    success: true,
    count: filtered.length,
    donors: filtered
  });
});

// Register New Donor API
app.post('/api/donors/register', (req, res) => {
  const { name, age, gender, bloodGroup, status, phone, district, city, lastDonated } = req.body;

  if (!name || !bloodGroup || !phone || !district) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const newDonor = {
    id: `donor-${Date.now()}`,
    name,
    age: parseInt(age) || 25,
    gender: gender || 'Male',
    bloodGroup,
    status: status || 'Available',
    phone,
    district,
    city: city || district,
    donationsTotal: 0,
    lastDonated: lastDonated || 'First Time Donor',
    isVerified: true
  };

  donors.unshift(newDonor);

  res.status(201).json({
    success: true,
    message: 'Donor registered successfully!',
    donor: newDonor
  });
});

// Get Urgent Blood Requests API
app.get('/api/requests', (req, res) => {
  const { district, bloodGroup } = req.query;
  let filtered = [...requests];

  if (bloodGroup && bloodGroup !== 'All Blood Groups' && bloodGroup !== 'All') {
    filtered = filtered.filter(r => r.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
  }

  if (district && district !== 'All Districts' && district !== 'All') {
    filtered = filtered.filter(r => r.district.toLowerCase() === district.toLowerCase());
  }

  res.json({
    success: true,
    count: filtered.length,
    requests: filtered
  });
});

// Post New Urgent Blood Request API
app.post('/api/requests', (req, res) => {
  const { patientName, bloodGroup, hospitalName, district, city, units, reason, contactName, phone, isUrgent } = req.body;

  if (!patientName || !bloodGroup || !hospitalName || !phone || !units) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    patientName,
    bloodGroup,
    hospitalName,
    district: district || 'NTR',
    city: city || 'Vijayawada',
    units: parseInt(units) || 1,
    reason: reason || 'Urgent Medical Emergency',
    contactName: contactName || patientName,
    phone,
    isUrgent: isUrgent !== undefined ? isUrgent : true,
    dateNeeded: new Date().toISOString().split('T')[0],
    fulfilled: false
  };

  requests.unshift(newRequest);

  res.status(201).json({
    success: true,
    message: 'Urgent blood request broadcasted across AP!',
    request: newRequest
  });
});

// Fulfill Request
app.post('/api/requests/:id/fulfill', (req, res) => {
  const { id } = req.params;
  const request = requests.find(r => r.id === id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  request.fulfilled = true;
  res.json({ success: true, message: 'Request marked as fulfilled. Thank you donors!', request });
});

// Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const newUser = { id: `u-${Date.now()}`, email, password, name: name || email.split('@')[0] };
  users.push(newUser);

  res.status(201).json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
});

app.listen(PORT, () => {
  console.log(`Bharath Blood Donor Express API running on http://localhost:${PORT}`);
});
