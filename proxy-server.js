import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/proxy/kaspa-tokens', async (req, res) => {
  try {
    console.log('Proxy received body:', req.body);
    const response = await axios.post('https://api.kaspa.com/api/krc721/tokens', req.body, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    res.json(response.data);
  } catch (e) {
    console.error('Proxy error:', e?.response?.data || e.message || e);
    res.status(500).json({ error: e.toString(), details: e?.response?.data });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`)); 