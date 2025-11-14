// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Get the API key from the .env file
const RAWG_API_KEY = process.env.RAWG_API_KEY;

if (!RAWG_API_KEY || RAWG_API_KEY === 'YOUR_RAWG_API_KEY_HERE') {
  console.error('ERROR: RAWG_API_KEY is not set in the .env file.');
  console.log('Please create a .env file and add your key:');
  console.log('RAWG_API_KEY=your_actual_key_here');
  process.exit(1); // Stop the server
}

const BASE_URL = 'https://api.rawg.io/api';

// --- Caching Setup ---
// We'll store our cached data right here in this object.
// A Map is slightly more efficient for this than a plain object.
const cache = new Map();
// Set how long to cache data (in milliseconds)
// Example: 10 minutes * 60 seconds/minute * 1000 ms/second = 600000
const CACHE_DURATION_MS = 10 * 60 * 1000; 
// --- End Caching Setup ---

// Serve static files (your index.html, css, etc.) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * A helper function to check our cache.
 * It returns the data if it's found and not expired.
 * Otherwise, it returns null.
 */
function getFromCache(key) {
  const cachedItem = cache.get(key);
  if (!cachedItem) {
    console.log(`CACHE MISS: ${key}`);
    return null; // Not in cache
  }

  const isExpired = (Date.now() - cachedItem.timestamp) > CACHE_DURATION_MS;
  if (isExpired) {
    console.log(`CACHE EXPIRED: ${key}`);
    cache.delete(key); // Remove expired item
    return null; // Expired
  }

  console.log(`CACHE HIT: ${key}`);
  return cachedItem.data; // Found and valid!
}

/**
 * A helper function to add data to our cache.
 */
function setInCache(key, data) {
  cache.set(key, {
    data: data,
    timestamp: Date.now()
  });
  console.log(`CACHE SET: ${key}`);
}

// API endpoint for TRENDING games
app.get('/api/trending', async (req, res) => {
  const cacheKey = 'trending';
  
  // 1. Try to get data from cache
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData); // Send cached data instantly
  }

  // 2. If not in cache, fetch from API
  try {
    const url = `${BASE_URL}/games?key=${RAWG_API_KEY}&ordering=-added&page_size=100`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API responded with ${response.status}`);
    }
    const data = await response.json();
    
    // 3. Save the new data to the cache
    setInCache(cacheKey, data);
    
    res.json(data); // Send the new data
  } catch (error) {
    console.error('Error fetching trending games:', error);
    res.status(500).json({ error: 'Failed to fetch trending games' });
  }
});

// API endpoint for SEARCHING games
app.get('/api/search/:query', async (req, res) => {
  const query = req.params.query;
  const cacheKey = `search_${query}`; // Dynamic key based on search query

  // 1. Try to get data from cache
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  // 2. If not in cache, fetch from API
  try {
    const url = `${BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=24`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API responded with ${response.status}`);
    }
    const data = await response.json();
    
    // 3. Save to cache
    setInCache(cacheKey, data);
    
    res.json(data);
  } catch (error) {
    console.error('Error searching games:', error);
    res.status(500).json({ error: 'Failed to search games' });
  }
});

// API endpoint for GAME DETAILS
app.get('/api/game/:id', async (req, res) => {
  const id = req.params.id;
  const cacheKey = `game_${id}`; // Dynamic key based on game ID

  // 1. Try to get data from cache
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  // 2. If not in cache, fetch from API
  try {
    const url = `${BASE_URL}/games/${id}?key=${RAWG_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API responded with ${response.status}`);
    }
    const data = await response.json();
    
    // 3. Save to cache
    setInCache(cacheKey, data);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

// Serve the index.html file for any other root request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});