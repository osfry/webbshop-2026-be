import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError'){
      return res.status(401).json({ message: "token_expired" });
    }
    return res.status(401).json({message: 'Invalid token'})
  }
}

export function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin'){
    next()
  }
  res.status(403).json({message: 'Access denied. Admin required'})
}
