const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required',
        redirectUrl: `${process.env.FRONTEND_URL}/login`
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid token',
      redirectUrl: `${process.env.FRONTEND_URL}/login`
    });
  }
};

module.exports = authMiddleware;