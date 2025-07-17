import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import getRandom from 'get-randomizer';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const link = process.env.DB_URI || 'mongodb://localhost:27017/crudApp';
mongoose.connect(link, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemSchema = new mongoose.Schema({
  name: String,
  content: String,
  mylink: String,
});
const Item = mongoose.model('Item', itemSchema);

// CREATE
app.post('/items', async (req, res) => {
  try {
    const { name, content } = req.body;
    if (!name || !content) return res.status(400).send('Name & HTML content required');

    const id = getRandom(100, 1000).toString();
    const mylink = name + id;

    const item = new Item({ name, content, mylink });
    await item.save();

    console.log('Created mylink:', mylink);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get all mylink values
app.get('/neon', async (req, res) => {
  try {
    const links = await Item.find().select('mylink -_id');
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// READ all - return _id and name
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find().select('_id name');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// READ full item metadata by ID
app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).send('Not found');
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// READ only HTML content by ID
app.get('/items/:id/content', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('content');
    if (!item) return res.status(404).send('Item not found');
    res.set('Content-Type', 'text/html');
    res.send(item.content);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// UPDATE
app.put('/items/:id', async (req, res) => {
  try {
    const { name, content } = req.body;
    if (!name || !content) return res.status(400).send('Name & HTML content required');

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, content },
      { new: true }
    );
    if (!item) return res.status(404).send('Not found');
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE
app.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).send('Not found');
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
