import jwt from 'jsonwebtoken';

// JWT authentication middleware
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user; // Attach decoded user info to req.user
      next();
    });
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};