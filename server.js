// Import the Express app
const app = require('./app');
// Load environment variables from .env file
require('dotenv').config();

// Set server port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server and log the URL
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
