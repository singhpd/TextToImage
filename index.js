const express = require('express');
const axios = require('axios');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config()

const app = express();
const PORT = 5000;
const car_brands = [
  "Hyundai",
  "MARUTI",
  "Mahindra",
  "TATA MOTORS",
  "Renault",
  "Nissan",
  "Honda",
  "KIA",
  "Toyota",
  "MG MOTORS",
  "SKODA ",
  "ISUZU ",
  "FIAT ",
  "FORCE MOTORS ",
  "HINDUSTAN ",
  "CITROEN ",
  "FORD ",
  "BMW",
  "MERCEDES",
  "BMW"
  // "Volkswagen"
];
const brandIcons = {
  "Hyundai": "https://www.carlogos.org/car-logos/hyundai-logo.png",
  "MARUTI": "https://www.carlogos.org/car-logos/suzuki-logo.png",
  "Mahindra": "https://www.carlogos.org/car-logos/mahindra-logo.png",
  "TATA MOTORS": "https://www.carlogos.org/car-logos/tata-logo.png",
  "Renault": "https://www.carlogos.org/car-logos/renault-logo.png",
  "Nissan": "https://www.carlogos.org/car-logos/nissan-logo.png",
  "Honda": "https://www.carlogos.org/car-logos/honda-logo.png",
  "KIA": "https://www.carlogos.org/car-logos/kia-logo.png",
  "Toyota": "https://www.carlogos.org/car-logos/toyota-logo.png",
  "MG MOTORS": "https://www.carlogos.org/car-logos/mg-logo.png",
  "SKODA": "https://www.carlogos.org/car-logos/skoda-logo.png",
  "ISUZU": "https://www.carlogos.org/car-logos/isuzu-logo.png",
  "FIAT": "https://www.carlogos.org/car-logos/fiat-logo.png",
  "FORCE MOTORS": "https://www.carlogos.org/car-logos/force-logo.png",
  "HINDUSTAN": "https://www.carlogos.org/car-logos/hindustan-logo.png",
  "CITROEN": "https://www.carlogos.org/car-logos/citroen-logo.png",
  // "Volkswagen": "https://www.carlogos.org/car-logos/volkswagen-logo.png",
  "FORD": "https://www.carlogos.org/car-logos/ford-logo.png",
  "MERCEDES": "https://www.carlogos.org/car-logos/mercedes-benz-logo.png",
  "BMW": "https://www.carlogos.org/car-logos/bmw-logo.png",
};

app.use(cors());
app.use(express.json());

const client = new OpenAI({
    baseURL: 'https://api.studio.nebius.com/v1/',
    apiKey: process.env.NEBIUS_API_KEY,
});


app.get('/',(req,res)=>{
    res.status(200).json("Working");
})


app.post('/api/dealers', async (req, res) => {
  const { lat, lng } = req.body;
  const API_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

  try {
    let finalDealer = [];

    // Loop through car brands
    for (const brand of car_brands) {
      const response = await axios.get(API_URL, {
        params: {
          location: `${lat},${lng}`,
          radius: 2000,
          type: 'car_dealer',
          keyword: brand,
          key: "AIzaSyBpYLqG5qyvaQtOctcO4Vro7MwknTkvpIE"
        }
      });

      const dealers = response.data.results.map((result, index) => ({
        id: result.place_id || `dealer-${index}`,
        name: result.name,
        address: result.vicinity,
        rating: result.rating,
        openNow: result.opening_hours?.open_now,
        iconUrl: brandIcons[brand] || "",
        position: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        distance: calculateDistance(
          lat,
          lng,
          result.geometry.location.lat,
          result.geometry.location.lng
        ),
        searchBy:brand
      })).filter((item)=> item.name.toLowerCase().includes(item.searchBy.toLowerCase()))

      finalDealer.push(...dealers); // Flatten the array
    }
    // const filterDealer = finalDealer.filter((item)=> item.name.toLowerCase().includes(item.searchBy.toLowerCase()))
    // console.log(filterDealer)

    res.json(finalDealer);

  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({ error: 'Failed to fetch dealer information' });
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles (you might want to use 6371 for kilometers)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10; // Round to 1 decimal place
}

function toRad(value) {
  return value * Math.PI / 180;
}

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
