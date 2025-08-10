import jwt from 'jsonwebtoken';

// Admin authentication middleware - checks JWT and admin role
export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      
      // Check if user has admin role
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
      
      req.user = user; // Attach decoded user info to req.user
      next();
    });
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
}; 