import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000';

export default function App() {
  const [sites, setSites] = useState([]);
  const [siteName, setSiteName] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [htmlFile, setHtmlFile] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch all sites on load
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await axios.get(`${API}/api/sites`);
      setSites(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch sites');
    }
  };

  const createSite = async () => {
    if (!siteName.trim()) {
      setMessage('Site name is required');
      return;
    }
    try {
      const res = await axios.post(`${API}/api/sites`, { name: siteName });
      setMessage(`Site "${res.data.name}" created`);
      setSiteName('');
      fetchSites();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create site');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setHtmlFile(e.target.files[0]);
  };

  const deployHtml = async () => {
    if (!selectedSiteId) {
      setMessage('Select a site to deploy');
      return;
    }
    if (!htmlFile) {
      setMessage('Select an HTML file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('index', htmlFile);

    try {
      await axios.post(`${API}/api/sites/${selectedSiteId}/deploy`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('HTML deployed successfully');
      setHtmlFile(null);
      fetchSites();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to deploy HTML');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h2>Site Manager</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="New site name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          style={{ padding: 8, width: '70%', marginRight: 10 }}
        />
        <button onClick={createSite} style={{ padding: '8px 16px' }}>
          Create Site
        </button>
      </div>

      <hr />

      <div style={{ margin: '20px 0' }}>
        <h3>Deploy HTML to site</h3>
        <select
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          style={{ padding: 8, width: '100%', marginBottom: 10 }}
        >
          <option value="">Select a site</option>
          {sites.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <input type="file" accept=".html" onChange={handleFileChange} />
        <br />
        <button onClick={deployHtml} style={{ marginTop: 10, padding: '8px 16px' }}>
          Deploy HTML
        </button>
      </div>

      <hr />

      <h3>All sites</h3>
      <ul>
        {sites.map((site) => (
          <li key={site._id} style={{ marginBottom: 6 }}>
            <b>{site.name}</b>{' '}
            <a href={`${API}/sites/${site._id}`} target="_blank" rel="noreferrer">
              Open Site
            </a>
          </li>
        ))}
      </ul>

      {message && <p style={{ marginTop: 20, color: 'green' }}>{message}</p>}
    </div>
  );
}
