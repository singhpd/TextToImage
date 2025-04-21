const express = require('express');
const axios = require('axios');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config()

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
    baseURL: 'https://api.studio.nebius.com/v1/',
    apiKey: process.env.NEBIUS_API_KEY,
});


app.get('/',(req,res)=>{
    res.status(200).json("Working");
})


app.post('/generatex', async (req, res) => {
    const {  prompt    } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        const response = await client.images.generate({
            "model": "black-forest-labs/flux-schnell",
            "response_format": "url",
            "extra_body": {
                "response_extension": "webp",
                "width": 1024,
                "height": 1024,
                "num_inference_steps": 4,
                "negative_prompt": "",
                "seed": -1
            },
            "prompt": prompt
        })
        console.log(response)
        // res.json({ image: response.data[0].url });
        res.status(200).json({ image: response.data[0].url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Generation failed' });
    }
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
