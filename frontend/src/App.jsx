import React, { useState, useEffect } from 'react';

function App() {
  const [websiteName, setWebsiteName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch all items on component mount and after updates
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch list of items (id, name, mylink)
  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/items');
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load items');
    }
  };

  // Submit new item or update existing item
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!websiteName.trim() || !htmlContent.trim()) {
      return alert('Please enter both name and HTML content');
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `http://localhost:5000/items/${editingId}`
        : 'http://localhost:5000/items';

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
    }
  };

  // Load item content for editing
  const handleEdit = async (id) => {
    try {
      // Fetch the HTML content by id
      const res = await fetch(`http://localhost:5000/items/${id}`);
      if (!res.ok) throw new Error('Failed to fetch item content');
      const content = await res.text();

      // Find the name from the items list
      const item = items.find(i => i._id === id);
      if (!item) throw new Error('Item not found');

      setWebsiteName(item.name);
      setHtmlContent(content);
      setEditingId(id);
    } catch (err) {
      console.error(err);
      alert(`Failed to enter edit mode: ${err.message}`);
    }
  };

  // Delete item by id
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      const res = await fetch(`http://localhost:5000/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchItems();
      alert('Deleted');
    } catch (err) {
      console.error(err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Open stored HTML content in a new tab/window
  const handleSelect = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/items/${id}`);
      if (!res.ok) throw new Error('Failed to fetch HTML content');
      const htmlText = await res.text();

      // Open new window and write the HTML content
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
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>{editingId ? 'Edit Item' : 'Store HTML Content'}</h2>

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
        <button type="submit" style={{ marginTop: 10 }}>
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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
