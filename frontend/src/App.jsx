import React, { useState, useEffect } from 'react';

const API_BASE = `https://my-cloud-2.onrender.com`;

function App() {
  const [websiteName, setWebsiteName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false); // NEW

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true); 
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load items');
    } finally {
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!websiteName.trim() || !htmlContent.trim()) {
      return alert('Please enter both name and HTML content');
    }

    try {
      setLoading(true); 
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE}/items/${editingId}`
        : `${API_BASE}/items`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: websiteName, content: htmlContent }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Network error');
      }

      setWebsiteName('');
      setHtmlContent('');
      setEditingId(null);
      await fetchItems();

      alert(editingId ? 'Updated!' : 'Saved!');
    } catch (err) {
      console.error(err);
      alert(`Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/items/${id}`);
      if (!res.ok) throw new Error('Failed to fetch item content');
      const content = await res.text();

      const item = items.find(i => i._id === id);
      if (!item) throw new Error('Item not found');

      setWebsiteName(item.name);
      setHtmlContent(content);
      setEditingId(id);
    } catch (err) {
      console.error(err);
      alert(`Failed to enter edit mode: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchItems();
      alert('Deleted');
    } catch (err) {
      console.error(err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/items/${id}`);
      if (!res.ok) throw new Error('Failed to fetch HTML content');
      const htmlText = await res.text();

      const newWindow = window.open();
      if (!newWindow) {
        alert('Popup blocked! Please allow popups for this site.');
        return;
      }
      newWindow.document.write(htmlText);
      newWindow.document.close();
    } catch (err) {
      console.error(err);
      alert(`Failed to open: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>{editingId ? 'Edit Item' : 'Store HTML Content'}</h2>

      {loading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: 30,
            height: 30,
            animation: 'spin 1s linear infinite',
            margin: '10px auto'
          }} />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Website name"
          value={websiteName}
          onChange={e => setWebsiteName(e.target.value)}
          style={{ width: '400px', marginBottom: 10 }}
        />
        <br />
        <textarea
          rows={8}
          cols={60}
          placeholder="Paste full HTML content here..."
          value={htmlContent}
          onChange={e => setHtmlContent(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 14 }}
        />
        <br />
        <button type="submit" style={{ marginTop: 10 }} disabled={loading}>
          {editingId ? 'Update Item' : 'Save HTML'}
        </button>
        {editingId && (
          <button
            type="button"
            style={{ marginLeft: 10 }}
            onClick={() => {
              setEditingId(null);
              setWebsiteName('');
              setHtmlContent('');
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>Stored Items (click name to open)</h3>
      <ul>
        {items.length === 0 && <li>No items stored yet</li>}
        {items.map(item => (
          <li key={item._id} style={{ marginBottom: 8 }}>
            <a href={`http://localhost:5000/items/${item._id}/content`}>
  {`http://localhost:5000/items/${item._id}/content`}
 </a>
             <br/>
             <br/>
            <span
              style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
              onClick={() => handleSelect(item._id)}
              title="Click to open stored HTML"
            >
              {item.name}
            </span>{' '}
            <button onClick={() => handleEdit(item._id)} style={{ marginLeft: 8 }}>
              Edit
            </button>{' '}
            <button onClick={() => handleDelete(item._id)} style={{ marginLeft: 4 }}>
              Delete
            </button>
            <br/>
            <br/>
          </li>
        ))}
      </ul>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
