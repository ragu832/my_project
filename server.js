require('dotenv').config(); // Load environment variables at the top
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const path = require('path');
const authRoutes = require('./auth'); // Importing authentication routes
const authenticateToken = require('./auth'); // Importing middleware for token authentication
const registrationRouter = require('./register'); // Your registration routes
const loginRouter = require('./login');
const cors = require('cors');

const app = express();
authRoutes(app);
app.use(express.json());
const PORT = process.env.PORT || 5003;
// app.use('/api', authRoutes);
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Middleware to parse JSON
app.use(bodyParser.json()); // Body-parser for parsing JSON
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Mount auth routes under '/api'
app.use('/api', authRoutes);
app.use('/api', registrationRouter);
app.use('/api', loginRouter);

// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Portfolio-related routes
let portfolios = [];

// Create a new portfolio
app.post('/portfolio', (req, res) => {
    const newPortfolio = req.body;
    newPortfolio.id = portfolios.length + 1; // Simple ID assignment
    portfolios.push(newPortfolio);
    res.status(201).json({ message: 'Portfolio created', data: newPortfolio });
});

// Get all portfolios
app.get('/portfolios', (req, res) => {
    res.status(200).json({ portfolios });
});

// Get a specific portfolio by ID
app.get('/portfolio/:id', (req, res) => {
    const portfolio = portfolios.find(p => p.id == req.params.id);
    if (portfolio) {
        res.status(200).json({ portfolio });
    } else {
        res.status(404).json({ message: 'Portfolio not found' });
    }
});

// Update a portfolio
app.put('/portfolio/:id', (req, res) => {
    let portfolio = portfolios.find(p => p.id == req.params.id);
    if (portfolio) {
        Object.assign(portfolio, req.body); // Update the portfolio with new data
        res.status(200).json({ message: 'Portfolio updated', data: portfolio });
    } else {
        res.status(404).json({ message: 'Portfolio not found' });
    }
});

// Delete a portfolio
app.delete('/portfolio/:id', (req, res) => {
    portfolios = portfolios.filter(p => p.id != req.params.id);
    res.status(200).json({ message: 'Portfolio deleted' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.post('/api/register', async (req, res) => {
    console.log('Received register request:', req.body);
    
    // Registration logic here
    // Example: Saving user data to MongoDB
    const { username, email, password } = req.body;
    console.log('Received register request:', req.body);
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try{
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        res.status(201).json({ message: 'User registered successfully' });
    }catch (error) {
        console.error('Error processing register request:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
    res.status(201).json({ message: 'User registered successfully' });
});

// In your server.js or respective login router file

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Example: Check if the user exists
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Example: Verify password (assuming bcrypt is used)
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Example: Create a token (assuming JWT is used)
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      // Respond with success and the token
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error, please try again later' });
    }
  });
  // Use authentication routes
app.use('/api/auth', authRoutes);

// Google Sign-In route
app.post('/api/auth/google', async (req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        // Check if the user exists, otherwise create a new user
        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = new User({ googleId: sub, email, name, picture });
            await user.save();
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Google Sign-In successful', token });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Google Sign-In failed' });
    }
});