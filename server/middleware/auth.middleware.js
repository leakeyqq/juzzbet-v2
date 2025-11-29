import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];


  if (!token) {
    console.error("no token")
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
     req.walletAddress = payload.walletAddress; // ✅ assign wallet addre
    next();
  } catch(error) {
    console.error(error)
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
