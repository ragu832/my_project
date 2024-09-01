// protectedRoute.js (or within server.js)
const authenticateToken = require('./middleware/auth');

app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});
