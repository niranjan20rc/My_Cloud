import 'dotenv/config';
import express  from 'express'
import mongoose from 'mongoose'
import cors     from 'cors'
import getRandom from "get-randomizer"
const app = express();
const port = 5000 || process.env.PORT;

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
  mylink:String,  
});

const Item = mongoose.model('Item', itemSchema);



// CREATE
app.post('/items', async (req, res) => {
  try {
    const { name, content } = req.body;
    if (!name || !content) return res.status(400).send('Name & HTML content required');

    const id = getRandom(100, 1000).toString();
    const mylink = name + id;

    const item = new Item({ name, content, mylink });  // assign mylink here
    await item.save();

    console.log('Created mylink:', mylink);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get("/neon",async(req,res)=>{
  res.json(await Item.find().select("mylink"));
})

// READ all
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find().select('_id name');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// READ one
app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).send('Not found');
    res.set('Content-Type', 'text/html').send(item.content);
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
