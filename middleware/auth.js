import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Not Authorized: No Token Provided" });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Fallback for demo transition: allow admin@123 for now or just reject
    if (token === 'admin@123') {
      return next();
    }
    return res.status(401).json({ message: "Not Authorized: Invalid Token" });
  }
};

export default auth;
