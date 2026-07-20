import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 VERY IMPORTANT
    req.user = {
      userId: decoded.userId   // ye hona chahiye
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};