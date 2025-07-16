const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// MongoDB connection URI (adjust as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/site_db';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Site schema & model
const siteSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  domain: String,
  htmlContent: { type: String, default: '' }, // store raw HTML here
});

const Site = mongoose.model('Site', siteSchema);

// Multer setup to store uploaded file in memory (buffer)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
    cb(null, true);
  } else {
    cb(new Error('Only HTML files allowed'));
  }
};
const upload = multer({ storage, fileFilter });

// Routes

// Get all sites metadata (without HTML content)
app.get('/api/sites', async (req, res) => {
  try {
    const sites = await Site.find({}, '_id name domain').lean();
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get sites' });
  }
});

// Create new site
app.post('/api/sites', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  try {
    const existing = await Site.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Site name already exists' });

    const newSite = new Site({ name, domain: name });
    await newSite.save();

    res.json({ _id: newSite._id, name: newSite.name, domain: newSite.domain });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// Deploy HTML file (upload and save raw HTML to DB)
app.post('/api/sites/:id/deploy', upload.single('index'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No HTML file uploaded' });

  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ error: 'Site not found' });

    site.htmlContent = req.file.buffer.toString('utf-8'); // raw HTML string
    await site.save();

    res.json({ message: 'Deploy complete' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deploy HTML' });
  }
});

// Delete site
app.delete('/api/sites/:id', async (req, res) => {
  try {
    const result = await Site.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Site not found' });

    res.json({ message: 'Site deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// Serve HTML content of a site by id
app.get('/sites/:id', async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site || !site.htmlContent) return res.status(404).send('Site not found or no content deployed');

    res.setHeader('Content-Type', 'text/html');
    res.send(site.htmlContent);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


