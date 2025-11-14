Full-Stack Gaming Stats Dashboard

This is a dynamic, full-stack web application that displays live video game statistics, trends, and search results. It features a secure Node.js backend that caches data from the RAWG.io API and a fast, responsive vanilla JavaScript frontend.

Live Demo

You can view the live deployed application here:
https://main-esports-dashboard.onrender.com/
(Note: The free plan may take 30-60 seconds to "wake up" on the first visit.)

Features

Dynamic Stats: View up-to-the-minute stats for Top Rated, Most Popular, and Total Games.

Data Visualization: See data visualized in three interactive charts (Top Genres, Top Platforms, and Metacritic Score Distribution) using Chart.js.

Game Search: Search for any game by name to get a list of results.

Game Details: Click on any game card to see a full description and details in a pop-up modal.

Theme Toggle: Switch instantly between a sleek Dark Mode and a clean Light Mode.

Responsive Design: The layout is fully responsive and works perfectly on mobile, tablet, and desktop.

High-Performance Backend: The server caches API results for 10 minutes, making the app feel instant and reducing API calls.

Tech Stack & Key Concepts

This project is divided into two main parts:

1. Frontend (Client-Side)

HTML5: Provides the semantic structure for the dashboard.

CSS3: All styling is custom-written, using CSS Variables for easy theming and a responsive, mobile-first design.

Vanilla JavaScript (ES6+):

async/await with fetch: Manages all asynchronous calls to our backend.

DOM Manipulation: Dynamically generates all UI components (charts, stat cards, game cards).

Event Handling: Manages all user interactions (search, clicks, theme toggling).

Chart.js: A popular library used to render the three data visualization charts.

2. Backend (Server-Side)

Node.js: The runtime environment for our server.

Express.js: The framework used to build our web server and API routes.

dotenv: Secures our secret API key by loading it from a private .env file.

node-fetch: Allows our server to make its own fetch requests to the external RAWG API.

Project Architecture & Data Flow

This project uses a Backend-for-Frontend (BFF) pattern. The frontend (browser) never talks to the external API directly.

Client Request: The user's browser loads index.html and its JavaScript. The JavaScript makes a request to our own server (e.g., /api/trending).

Server Logic: The server.js (Express) server receives this request.

Caching: The server first checks its in-memory Cache.

CACHE HIT: If fresh (under 10 min) data is found, it's sent back to the user instantly.

CACHE MISS: If no data is found, the server proceeds to step 4.

API Proxy: The server securely adds its secret RAWG_API_KEY and calls the external RAWG API.

Server Response: The server receives the data from RAWG, saves it to the cache for next time, and then sends it back to the user's browser.

UI Update: The frontend JavaScript receives the data and updates the page.

This architecture has two main benefits:

Security: The RAWG_API_KEY is 100% secure and never exposed to the public.

Performance: The cache makes the app feel instant for all users after the first visit.
